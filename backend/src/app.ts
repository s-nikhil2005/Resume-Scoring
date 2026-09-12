import 'dotenv/config';

import cors, { type CorsOptions } from 'cors';
import express from 'express';
import authRouter from './routes/auth.routes';
import analyzeRouter from './routes/analyze.routes';
import cookieParser from 'cookie-parser';

import {
  errorMiddleware,
} from './middlewares/error.middleware';

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.allowedOrigins?.split(',') || [];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', analyzeRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the world of Different Tools...');
});


// --------------------------------------------------
// Global Error Handler
// Must be registered after all routes
// --------------------------------------------------

app.use(errorMiddleware);

export default app;