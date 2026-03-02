# Deep Secure Deployment Prep

This project contains:
- Frontend (React + Vite) in the root workspace
- Backend (Node.js + Express) in `backend/`

## Frontend (Vercel)

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

3. Create production build:

```bash
npm run build
```

## Backend (Render)

1. Move into backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Configure environment variables:

```env
PORT=5000
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
FRONTEND_URL=https://your-vercel-app.vercel.app
```

3. Start server:

```bash
npm start
```

4. Health check:

```bash
GET /health
```
Response:

```json
{ "status": "ok" }
```
