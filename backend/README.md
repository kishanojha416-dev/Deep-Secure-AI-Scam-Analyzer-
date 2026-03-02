# Deep Secure Backend

Node.js + Express backend for AI-powered scam analysis.

## Setup

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and set your keys:

```env
PORT=5000
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
FRONTEND_URL=https://your-vercel-app.vercel.app
```

4. Start server (development):

```bash
npm run dev
```

5. Start server (production):

```bash
npm install
npm start
```

## API

### POST /analyze

Request:

```json
{
  "message": "Your KYC is blocked. Click this link now."
}
```

Success Response:

```json
{
  "riskLevel": "Uncertain",
  "confidence": 62,
  "reasons": ["Contains some risk signals"],
  "actions": ["Verify the sender before taking action"]
}
```

Error Response:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "\"message\" must be a string."
  }
}
```

## Example curl

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"message":"Your bank account is blocked. Share OTP to unlock."}'
```
