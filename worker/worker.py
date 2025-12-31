import redis
import json
import os
import shutil
import subprocess
import glob
from google.cloud import storage
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor
from google.oauth2 import service_account

r = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://redis:6379'))
bucket_name = os.getenv("GCS_BUCKET_NAME")
# Load the key from the environment variable we just set in Railway
key_dict = json.loads(os.environ["GCP_CREDENTIALS"])
credentials = service_account.Credentials.from_service_account_info(key_dict)
storage_client = storage.Client(credentials=credentials, project=credentials.project_id)
bucket = storage_client.bucket(bucket_name)

FRAMES_DIR = "/app/frames"
os.makedirs(FRAMES_DIR, exist_ok=True)

print("🚀 Worker Ready: Hybrid Mode (H.264 Preference + Smart Filters).")

def upload_single_frame(args):
    file_path, job_id, index = args
    blob_name = f"jobs/{job_id}/{os.path.basename(file_path)}"
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(file_path)
    link = blob.generate_signed_url(version="v4", expiration=timedelta(hours=1), method="GET")
    return {"id": index + 1, "imageUrl": link, "timestamp": f"Frame {index + 1}"}

while True:
    queue, data = r.blpop("video_queue")
    job = json.loads(data)
    job_id = job['jobId']
    url = job['url']
    target_height = int(job.get('quality', 480)) 

    print(f"Job {job_id}: Downloading at {target_height}p...")

    job_folder = os.path.join(FRAMES_DIR, job_id)
    os.makedirs(job_folder, exist_ok=True)
    os.chdir(job_folder)

    r.set(f"job:{job_id}", json.dumps({"status": "PROCESSING"}))
    r.expire(f"job:{job_id}", 3600)

    try:
        # 1. FORCE H.264 (AVC1)
        # This tells yt-dlp: "Give me H.264 video if possible". 
        # It is much faster to decode than AV1.
        v_limit = f"[height<={target_height}]"
        # Preference: H.264 > VP9 > AV1
        format_selector = f"bestvideo{v_limit}[vcodec^=avc]+bestaudio/best{v_limit}/best"

        yt_cmd = [
            "yt-dlp", url, 
            "-o", "-",             
            "--force-ipv4",
            "--socket-timeout", "30",
            "--retries", "10",
            "-f", format_selector
        ]

        ffmpeg_input_args = []
        ffmpeg_filter_args = []

        # 2. HYBRID LOGIC
        if target_height >= 720:
             # HD MODE (720p / 1080p / 4K)
             # Use Keyframes for speed, but filter duplicates aggressively
             print(f"⚡ HD Mode ({target_height}p): Keyframes + Strict De-Duplication...")
             
             ffmpeg_input_args = ["-skip_frame", "nokey", "-i", "pipe:0"]
             
             # mpdecimate: Removes frames that look similar to the previous one
             # hi/lo/frac: tuned to drop frames that are "mostly the same"
             ffmpeg_filter_args = ["-vsync", "0", "-vf", "mpdecimate=hi=64*10:lo=64*5:frac=0.1"]
        
        else:
             # SD MODE (360p / 480p)
             # Use Scene Detection. It is accurate and avoids repetitions.
             # Since resolution is low, CPU handles it easily.
             print(f"🎨 SD Mode ({target_height}p): High-Accuracy Scene Detection...")
             
             ffmpeg_input_args = ["-i", "pipe:0"]
             # select=gt(scene,0.4): The classic, accurate filter
             ffmpeg_filter_args = ["-vf", "select=gt(scene\\,0.4)", "-vsync", "vfr"]

        ffmpeg_cmd = [
            "ffmpeg", 
            *ffmpeg_input_args,
            *ffmpeg_filter_args,
            "-q:v", "1", 
            "-pix_fmt", "yuvj420p",
            "frame_%03d.jpg"       
        ]

        p1 = subprocess.Popen(yt_cmd, stdout=subprocess.PIPE)
        p2 = subprocess.run(ffmpeg_cmd, stdin=p1.stdout, check=True)
        p1.wait()

        if p1.returncode != 0:
             raise Exception(f"yt-dlp failed (code {p1.returncode})")

        # Upload
        r.set(f"job:{job_id}", json.dumps({"status": "UPLOADING_IMAGES"}))
        jpg_files = sorted(glob.glob("*.jpg"))
        
        # 3. DEBUG LOG
        print(f"📸 Extracted {len(jpg_files)} frames. Uploading...")
        
        upload_tasks = [(f, job_id, i) for i, f in enumerate(jpg_files)]

        image_urls = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            image_urls = list(executor.map(upload_single_frame, upload_tasks))

        # Zip
        r.set(f"job:{job_id}", json.dumps({"status": "ZIPPING"}))
        zip_path = shutil.make_archive(os.path.join(FRAMES_DIR, job_id), 'zip', job_folder)
        blob_zip = bucket.blob(f"zips/{job_id}.zip")
        blob_zip.upload_from_filename(zip_path)
        zip_link = blob_zip.generate_signed_url(version="v4", expiration=timedelta(hours=1), method="GET")

        result_data = {
            "status": "DONE", 
            "zipUrl": zip_link,
            "frames": image_urls,
            "quality": target_height
        }
        r.set(f"job:{job_id}", json.dumps(result_data))
        r.expire(f"job:{job_id}", 3600)

    except Exception as e:
        print(f"❌ Error: {e}")
        r.set(f"job:{job_id}", json.dumps({"status": "ERROR", "error": str(e)}))
    finally:
        os.chdir(FRAMES_DIR)
        shutil.rmtree(job_folder, ignore_errors=True)
        if os.path.exists(f"{job_id}.zip"):
            os.remove(f"{job_id}.zip")