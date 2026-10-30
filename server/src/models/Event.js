import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required.'],
      trim: true,
      maxlength: [120, 'Event title cannot exceed 120 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required.'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required.'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required.'],
      trim: true,
    },
    startsAt: {
      type: Date,
      required: [true, 'Event start date is required.'],
    },
    endsAt: {
      type: Date,
      required: [true, 'Event end date is required.'],
      validate: {
        validator(value) {
          return !this.startsAt || value > this.startsAt;
        },
        message: 'Event end date must be after its start date.',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required.'],
      min: [1, 'Capacity must be at least 1.'],
      validate: {
        validator: Number.isInteger,
        message: 'Capacity must be a whole number.',
      },
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative.'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
    },
  },
  { timestamps: true },
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
