import express from 'express';
import analyzeRoutes from './routes/analyzeRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json({ limit: '200kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(analyzeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
