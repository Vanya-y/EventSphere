import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    attendeeName: {
      type: String,
      required: [true, 'Your name is required.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    attendeeEmail: {
      type: String,
      required: [true, 'Your email is required.'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot exceed 254 characters.'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'checked-in'],
      default: 'confirmed',
    },
  },
  { timestamps: true },
);

registrationSchema.index({ event: 1, attendeeEmail: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
