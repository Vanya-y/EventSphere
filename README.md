# EventSphere

EventSphere is a full-stack event management and smart registration system built with the MERN stack.

## Planned features

- Attendees can browse events, register, cancel, and view tickets.
- Organizers can create and manage events.
- Administrators can manage users and events and view platform statistics.
- Registration prevents duplicate bookings and overbooking.
- Tickets have unique identifiers and support check-in.
- Dashboards provide registration analytics and CSV export.

## Technology

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: MongoDB and Mongoose
- Authentication: JWT and bcrypt
- Deployment: Vercel, Render, and MongoDB Atlas

## Getting started

1. Install Node.js (LTS) and MongoDB, or create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your local or Atlas connection string. Keep the database password private.
3. From this directory, run `npm install` and `npm install --prefix client` and `npm install --prefix server`.
4. Run `npm run dev` to start the client and API.

The API health endpoint is `http://localhost:5000/api/health`; the Vite client runs at `http://localhost:5173`.
For local development, Vite proxies frontend `/api` requests to port 5000. For separate deployments, set `VITE_API_URL` in the frontend environment to the backend origin (see `client/.env.example`) and set `CLIENT_URL` on the backend to the deployed frontend origin.

## Event API (initial)

- `GET /api/events` lists published events.
- `GET /api/events/:id` returns one published event.
- `POST /api/events` creates an event from JSON and returns the created record. In production it requires the `x-organizer-key` header matching the server's `ORGANIZER_API_KEY`.
- `POST /api/registrations` registers an attendee using `eventId`, `attendeeName`, and `attendeeEmail`. It creates a unique ticket code, rejects duplicate emails for the same event, and reserves capacity atomically.

Example create request body:

```json
{
  "title": "Future of AI Summit",
  "description": "A day of talks and workshops.",
  "category": "Technology",
  "location": "Bengaluru, India",
  "startsAt": "2026-11-18T09:00:00.000Z",
  "endsAt": "2026-11-18T17:00:00.000Z",
  "capacity": 250,
  "price": 0,
  "status": "published"
}
```

## Deployment

Deployment files are included for Vercel (`vercel.json`) and Render (`render.yaml`). The intended setup is Vercel for the client, Render for the API, and MongoDB Atlas for the database.

1. Push this project to a GitHub repository and connect that repository to Vercel and Render.
2. In Vercel, set `VITE_API_URL` to the public Render API origin, such as `https://eventsphere-api.onrender.com`.
3. In Render, set `MONGODB_URI` to the Atlas connection string, `CLIENT_URL` to the Vercel site origin, and `ORGANIZER_API_KEY` to a long random secret. Keep database credentials and organizer keys in hosting environment settings; never commit them.
4. In Atlas, create a database user and allow the Render service to reach the cluster. Atlas requires the app host's IP/network to be allowed and a database user to connect.

The production event form asks organizers for the organizer key. Public attendee registration remains available.
