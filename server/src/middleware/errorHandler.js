export function errorHandler(error, _request, response, _next) {
  if (error.status) {
    return response.status(error.status).json({ message: error.message });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((item) => item.message);
    return response.status(400).json({ message: 'Event validation failed.', errors: messages });
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'Invalid value supplied.' });
  }

  console.error(error);
  response.status(500).json({ message: 'An unexpected server error occurred.' });
}
