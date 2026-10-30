import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import Event from '../models/Event.js';

const router = Router();

function requireOrganizerKey(request, response, next) {
  if (process.env.NODE_ENV !== 'production') return next();

  const configuredKey = process.env.ORGANIZER_API_KEY;
  const providedKey = request.get('x-organizer-key');
  if (!configuredKey || !providedKey) {
    return response.status(401).json({ message: 'Organizer key is required to publish events.' });
  }

  const configuredBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(providedKey);
  if (configuredBuffer.length !== providedBuffer.length || !timingSafeEqual(configuredBuffer, providedBuffer)) {
    return response.status(401).json({ message: 'Organizer key is invalid.' });
  }

  next();
}

router.get('/', async (_request, response, next) => {
  try {
    const events = await Event.find({ status: 'published' }).sort({ startsAt: 1 });
    response.json({ events });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid event ID.' });
    }

    const event = await Event.findOne({ _id: request.params.id, status: 'published' });
    if (!event) return response.status(404).json({ message: 'Event not found.' });
    response.json({ event });
  } catch (error) {
    next(error);
  }
});

// Temporary project setup endpoint. Add organizer authentication before exposing event creation.
router.post('/', requireOrganizerKey, async (request, response, next) => {
  try {
    const event = await Event.create(request.body);
    response.status(201).json({ event });
  } catch (error) {
    next(error);
  }
});

export default router;
