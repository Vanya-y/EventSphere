import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import registrationsRouter from './routes/registrations.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: 'connected', name: 'EventSphere API' });
});

app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);
app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found.' });
});
app.use(errorHandler);

export default app;
