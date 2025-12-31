**YT Video SaaS**

A lightweight server + worker SaaS for extracting scene-detected frames from YouTube (or other) videos, uploading frames and zips to Google Cloud Storage, and serving results via a Next.js frontend.

**Quick Summary**
- **Frontend:** Next.js app (in `frontend/`) with NextAuth for Google sign-in and Prisma for Postgres user storage.
- **Worker:** Python worker (in `worker/`) that uses `yt-dlp` + `ffmpeg` to extract frames (scene detection), uploads frames and zip archives to GCS, and communicates via Redis.
- **Infra:** Docker Compose orchestration with Redis and Postgres.

**Repository Layout**
- `frontend/` — Next.js app, Prisma schema, API routes.
- `worker/` — Python worker, `requirements.txt`, `Dockerfile`, `worker.py`.
- `docker-compose.yml` — example orchestration (Redis, Postgres, frontend, worker).
- `gcp-key.json` — (not committed) service account key for GCS; mount into worker or provide via env.

**Features**
- Scene-detection frame extraction using `ffmpeg` filter `select=gt(scene,0.4)`.
- Streaming download through `yt-dlp` into `ffmpeg` to avoid saving full video files.
- Concurrent upload of frames to Google Cloud Storage and signed URLs for access.
- Job queue implemented on Redis (list key: `video_queue`) and job state stored at `job:{jobId}`.

**Prerequisites**
- Docker & Docker Compose
- (Local dev without Docker) Node.js (v20+), npm, Python 3.11, `ffmpeg` installed

**Environment / Configuration**
The project uses environment variables. See `docker-compose-example.yml` as a template. Important values:

- `DATABASE_URL` — Postgres connection string for Prisma.
- `REDIS_URL` — Redis connection (example: `redis://redis:6379`).
- `NEXTAUTH_URL` — Frontend base URL (e.g. `http://localhost:3000`).
- `NEXTAUTH_SECRET` — NextAuth secret.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — OAuth for NextAuth Google provider.
- `GCS_BUCKET_NAME` — Google Cloud Storage bucket used by the worker.
- `GCP_CREDENTIALS` — JSON contents of a GCP service account (recommended) or mount `gcp-key.json` into the worker container and set `GCP_CREDENTIALS` accordingly.
- `SIGNED_URL_EXP_HOURS` — Signed URL expiry for uploaded objects (default `1`).

Tip: Use `docker-compose-example.yml` to see the placeholder values and required vars.

**Running with Docker Compose (recommended)**
1. Copy `docker-compose-example.yml` to `docker-compose.yml` and fill in secrets (or set env vars).
2. Place your `gcp-key.json` in repository root (or set `GCP_CREDENTIALS` env to the JSON string). The compose file mounts `./gcp-key.json` into the worker.
3. Start services:

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Redis: 6379
- Postgres: 5432

The frontend container runs `npx prisma migrate deploy && npm run dev` by default in the included Dockerfile.

**Running Locally (without Docker)**
- Frontend

```bash
cd frontend
npm install
npx prisma generate
npx prisma migrate dev --name init   # if you want migrations locally
npm run dev
```

- Worker

```bash
cd worker
python -m pip install -r requirements.txt
# (optional) install updated yt-dlp from source as in the Dockerfile
python worker.py
```

Make sure `REDIS_URL` and `GCP_CREDENTIALS` (or `gcp-key.json` mount) are available in the environment when running the worker.

**Prisma / Database**
- Schema is at `frontend/prisma/schema.prisma`.
- On first run (local), run `npx prisma migrate dev` or `npx prisma db push` and `npx prisma generate`.

**How Jobs Are Submitted**
- The frontend enqueues jobs to Redis list `video_queue` with a JSON payload containing at minimum:

```json
{
  "jobId": "<unique-id>",
  "url": "https://www.youtube.com/watch?v=...",
  "quality": 480,
  "limit": 100
}
```

- Worker listens to `BLPOP video_queue` and updates `job:{jobId}` keys with status and result JSON. Results include `zipUrl` and `frames` array (each with `imageUrl`).

**API / Frontend Notes**
- The Next.js app includes API routes for submitting jobs, checking job status, and downloading results under `frontend/app/api/`.

**Worker Details & Security**
- Worker streams `yt-dlp` output into `ffmpeg` and extracts frames with scene detection, then uploads to GCS and zips the set.
- Credentials: do NOT commit `gcp-key.json`. Provide GCP credentials securely (Docker secrets, environment variables, or mounted volume not tracked in git).

**Troubleshooting**
- If `ffmpeg` errors appear, confirm `ffmpeg` is installed in the environment (Dockerfile installs it for the worker).
- If uploads fail, confirm the service account has `storage.objects.create` on the target bucket.
- If Prisma complains about `DATABASE_URL`, ensure Postgres is reachable and migrations have been applied.

**Useful Commands**

```bash
# Build & run everything
docker compose up --build

# Start frontend only (local)
cd frontend && npm run dev

# Start worker only (local)
cd worker && python worker.py
```

**Notes / Next Steps**
- Consider rotating `NEXTAUTH_SECRET` and OAuth client secrets for production.
- Use Docker secrets or a secrets manager for GCP credentials in production.
- Add monitoring for worker queue length and job failures.
