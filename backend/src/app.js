import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyzeRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://your-vercel-app.vercel.app', env.frontendUrl];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json({ limit: '200kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(analyzeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
