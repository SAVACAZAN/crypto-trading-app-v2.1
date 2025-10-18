// server/index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import userExchangesRouter from './api/v1/userExchangesApi.js';

const app = express();

app.use(cookieParser()); // Middleware pentru a permite accesul la cookie-uri
app.use('/api/user-exchanges', userExchangesRouter);

export default app;
