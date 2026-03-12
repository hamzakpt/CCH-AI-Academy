# CCH AI Academy

A unified application combining AI Games and Learning Path features.

## Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 20+ & pnpm (for local development)
- Python 3.11+ (for local backend development)

## Docker (Recommended)

### With Docker (Single Command)
```bash
docker build -t cch-ai-academy -f Dockerfile .
docker run -p 8080:80 cch-ai-academy
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8080/api

## Local Development

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```
Frontend runs on http://localhost:5173

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs on http://localhost:8000

### Environment Variables
Create a `.env` file in the backend directory:
```
API_URL=http://localhost:8000
OPENAI_API_KEY=your_key_here
```

## Architecture

- **Frontend**: React + Vite + TypeScript (port 5173 in dev, served via Nginx in Docker)
- **Backend**: FastAPI + SQLAlchemy (port 8000)
- **Proxy**: Nginx routes `/api` requests to FastAPI backend

## Project Structure

```
├── frontend/          # React Vite application
├── backend/           # FastAPI application
├── Dockerfile         # Multi-stage Docker build
├── docker-entrypoint.sh
├── nginx.conf         # Reverse proxy configuration
└── README.md
```

## Troubleshooting

**Uvicorn not found**: Rebuild the Docker image - Python dependencies need to be reinstalled.

**Port already in use**: Change the port mapping:
```bash
docker run -p 8080:80 -p 8001:8000 cch-ai-academy
```

**API connection issues**: Ensure `API_URL` environment variable matches your backend address.
