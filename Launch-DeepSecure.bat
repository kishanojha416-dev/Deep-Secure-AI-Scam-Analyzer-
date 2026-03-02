@echo off
cd /d "D:\Proj(1)AI SCAM ANALYZER (DeepSecure)\DeepSecure"
start "Deep Secure Full Stack" cmd /k "npm run dev:all"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173/"
