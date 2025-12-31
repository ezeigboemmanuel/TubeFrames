import redis
import json
import os
import shutil
import subprocess
import glob
import logging
from google.cloud import storage
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor
from google.oauth2 import service_account

# Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379')
FRAMES_DIR = os.getenv('FRAMES_DIR', '/app/frames')
BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')
GCP_CREDENTIALS = os.environ.get('GCP_CREDENTIALS')
SIGNED_URL_EXP_HOURS = int(os.getenv('SIGNED_URL_EXP_HOURS', '1'))
MAX_FRAMES = int(os.getenv('MAX_FRAMES', '500'))

# Logging setup
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

# Validate environment
if not BUCKET_NAME or not GCP_CREDENTIALS:
    logging.error('Missing GCS_BUCKET_NAME or GCP_CREDENTIALS environment variables.')
    raise SystemExit(1)

# Setup
r = redis.Redis.from_url(REDIS_URL)
key_dict = json.loads(GCP_CREDENTIALS)
credentials = service_account.Credentials.from_service_account_info(key_dict)
storage_client = storage.Client(credentials=credentials, project=credentials.project_id)
bucket = storage_client.bucket(BUCKET_NAME)

os.makedirs(FRAMES_DIR, exist_ok=True)

logging.info('🚀 Worker Ready: Smart Scene Detection (NaN Fix + 1.5s Cooldown).')

def upload_single_frame(args):
    file_path, job_id, index = args
    blob_name = f"jobs/{job_id}/{os.path.basename(file_path)}"
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(file_path)
    link = blob.generate_signed_url(version="v4", expiration=timedelta(hours=SIGNED_URL_EXP_HOURS), method="GET")
    return {"id": index + 1, "imageUrl": link, "timestamp": f"Frame {index + 1}"}

def run_worker_loop():
    while True:
        queue, data = r.blpop("video_queue")
        job = json.loads(data)
        job_id = job['jobId']
        url = job['url']
        target_height = int(job.get('quality', 480))
        requested_limit = int(job.get('limit', MAX_FRAMES))

        logging.info(f"Job {job_id}: Downloading at {target_height}p (Request Limit: {requested_limit})...")

        job_folder = os.path.join(FRAMES_DIR, job_id)
        os.makedirs(job_folder, exist_ok=True)

        r.set(f"job:{job_id}", json.dumps({"status": "PROCESSING"}))
        r.expire(f"job:{job_id}", 3600)

        try:
            # 1. DOWNLOAD STREAM
            v_limit = f"[height<={target_height}]"
            format_selector = f"bestvideo{v_limit}[vcodec^=avc]+bestaudio/best{v_limit}/best"

            yt_cmd = [
                "yt-dlp", url,
                "-o", "-",
                "--force-ipv4",
                "--socket-timeout", "30",
                "--retries", "10",
                "-f", format_selector
            ]

            # 2. FIXED SCENE DETECTION
            # Logic: If (Scene Change > 40%) AND ( (It is the first frame) OR (Last screenshot was > 1.5s ago) )
            logging.info("🎨 Analyzing: Threshold (0.4) + 1.5s Cooldown (NaN Check Added)...")

            ffmpeg_filter_args = [
                "-vf", 
                "select='gt(scene,0.4)*(isnan(prev_selected_t)+gt(t-prev_selected_t,1.5))'", 
                "-vsync", "vfr"
            ]

            output_pattern = os.path.join(job_folder, "frame_%03d.jpg")

            ffmpeg_cmd = [
                "ffmpeg",
                "-i", "pipe:0",
                *ffmpeg_filter_args,
                "-q:v", "1",
                "-pix_fmt", "yuvj420p",
                output_pattern
            ]

            p1 = subprocess.Popen(yt_cmd, stdout=subprocess.PIPE)
            try:
                subprocess.run(ffmpeg_cmd, stdin=p1.stdout, check=True)
            finally:
                if p1.stdout:
                    p1.stdout.close()
                p1.wait()

            if p1.returncode and p1.returncode != 0:
                raise Exception(f"yt-dlp failed (code {p1.returncode})")

            # 3. UPLOAD
            r.set(f"job:{job_id}", json.dumps({"status": "UPLOADING_IMAGES"}))
            jpg_files = sorted(glob.glob(os.path.join(job_folder, "*.jpg")))

            total_extracted = len(jpg_files)
            upload_limit = min(requested_limit, MAX_FRAMES, total_extracted)
            
            logging.info(f"📸 Extracted {total_extracted} frames. Uploading first {upload_limit}...")

            upload_tasks = [(f, job_id, i) for i, f in enumerate(jpg_files[:upload_limit])]

            image_urls = []
            with ThreadPoolExecutor(max_workers=10) as executor:
                image_urls = list(executor.map(upload_single_frame, upload_tasks))

            # 4. ZIP
            r.set(f"job:{job_id}", json.dumps({"status": "ZIPPING"}))
            
            zip_content_folder = os.path.join(FRAMES_DIR, f"{job_id}_zip_content")
            os.makedirs(zip_content_folder, exist_ok=True)
            
            for f_path in jpg_files[:upload_limit]:
                 shutil.copy(f_path, zip_content_folder)

            zip_path = shutil.make_archive(os.path.join(FRAMES_DIR, job_id), 'zip', zip_content_folder)
            
            blob_zip = bucket.blob(f"zips/{job_id}.zip")
            blob_zip.upload_from_filename(zip_path)
            zip_link = blob_zip.generate_signed_url(version="v4", expiration=timedelta(hours=SIGNED_URL_EXP_HOURS), method="GET")

            shutil.rmtree(zip_content_folder, ignore_errors=True)

            result_data = {
                "status": "DONE",
                "zipUrl": zip_link,
                "frames": image_urls,
                "quality": target_height
            }
            r.set(f"job:{job_id}", json.dumps(result_data))
            r.expire(f"job:{job_id}", 3600)

        except subprocess.CalledProcessError as cpe:
            logging.error(f"Subprocess failed: {cpe}")
            r.set(f"job:{job_id}", json.dumps({"status": "ERROR", "error": str(cpe)}))
        except Exception as e:
            logging.exception(f"Error processing job {job_id}: {e}")
            r.set(f"job:{job_id}", json.dumps({"status": "ERROR", "error": str(e)}))
        finally:
            try:
                shutil.rmtree(job_folder, ignore_errors=True)
            except Exception:
                pass
            try:
                if os.path.exists(f"{job_id}.zip"):
                    os.remove(f"{job_id}.zip")
            except Exception:
                pass

if __name__ == '__main__':
    run_worker_loop()