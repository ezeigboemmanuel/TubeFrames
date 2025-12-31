# Use Python 3.11 (Stable)
FROM python:3.11-slim

# Install system tools (FFmpeg is required for video processing)
RUN apt-get update && apt-get install -y ffmpeg git

WORKDIR /app

# Install Python Libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install latest yt-dlp fixes (fixes 403 errors)
RUN pip install --force-reinstall https://github.com/yt-dlp/yt-dlp/archive/master.zip

# Copy your script
COPY worker.py .

# Run unbuffered (so you see logs instantly)
CMD ["python", "-u", "worker.py"]