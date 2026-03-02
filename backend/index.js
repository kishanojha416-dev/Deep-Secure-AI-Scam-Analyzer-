import express from 'express';
import cors from 'cors';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
	'http://localhost:5173',
	'https://deep-secure-ai-scam-analyzer.vercel.app',
];

const corsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error('Not allowed by CORS'));
	},
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
	credentials: true,
};

const server = express();

server.use(cors(corsOptions));
server.options('*', cors(corsOptions));

server.use(app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
