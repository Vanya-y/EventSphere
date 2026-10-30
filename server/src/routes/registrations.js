import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

const router = Router();

router.post('/', async (request, response, next) => {
  const { eventId, attendeeName, attendeeEmail } = request.body;

  if (!mongoose.isValidObjectId(eventId)) {
    return response.status(400).json({ message: 'A valid event ID is required.' });
  }

  if (typeof attendeeName !== 'string' || !attendeeName.trim() || typeof attendeeEmail !== 'string' || !attendeeEmail.trim()) {
    return response.status(400).json({ message: 'Name and email are required.' });
  }

  const normalizedEmail = attendeeEmail.trim().toLowerCase();
  let reservedEvent;

  try {
    reservedEvent = await Event.findOneAndUpdate(
      { _id: eventId, status: 'published', $expr: { $lt: ['$registeredCount', '$capacity'] } },
      { $inc: { registeredCount: 1 } },
      { new: true },
    );

    if (!reservedEvent) {
      const eventExists = await Event.exists({ _id: eventId, status: 'published' });
      if (!eventExists) return response.status(404).json({ message: 'Published event not found.' });
      return response.status(409).json({ message: 'This event is full.' });
    }

    const registration = await Registration.create({
      event: reservedEvent._id,
      attendeeName: attendeeName.trim(),
      attendeeEmail: normalizedEmail,
      ticketCode: `ES-${randomBytes(8).toString('hex').toUpperCase()}`,
    });

    response.status(201).json({
      message: 'Registration confirmed.',
      registration: {
        id: registration._id,
        event: registration.event,
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        ticketCode: registration.ticketCode,
        status: registration.status,
      },
    });
  } catch (error) {
    if (reservedEvent) {
      await Event.updateOne({ _id: reservedEvent._id }, { $inc: { registeredCount: -1 } });
    }
    if (error.code === 11000) {
      return response.status(409).json({ message: 'This email is already registered for the event.' });
    }
    next(error);
  }
});

export default router;
