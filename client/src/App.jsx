import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

const events = [
  { _id: 'sample-ai', category: 'Technology', title: 'Future of AI Summit', startsAt: '2026-11-18T09:00:00.000Z', location: 'Bengaluru, India', color: 'violet' },
  { _id: 'sample-design', category: 'Design', title: 'Design Forward 2026', startsAt: '2026-11-24T09:00:00.000Z', location: 'Mumbai, India', color: 'orange' },
  { _id: 'sample-founders', category: 'Business', title: 'Founders & Builders', startsAt: '2026-12-02T09:00:00.000Z', location: 'New Delhi, India', color: 'blue' },
];

function App() {
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      try {
        const data = await apiRequest('/api/events', { signal: controller.signal });
        setEventList(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not connect to the events service.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEvents();
    return () => controller.abort();
  }, []);

  const visibleEvents = eventList.length ? eventList : events;

  async function handleRegistration(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setRegistrationMessage('');
    setTicketCode('');
    const form = new FormData(formElement);
    try {
      const data = await apiRequest('/api/registrations', {
        method: 'POST',
        body: JSON.stringify({
          eventId: selectedEvent._id,
          attendeeName: form.get('attendeeName'),
          attendeeEmail: form.get('attendeeEmail'),
        }),
      });
      setTicketCode(data.registration.ticketCode);
      setRegistrationMessage('You’re registered! Save your ticket code.');
      formElement.reset();
    } catch (err) {
      setRegistrationMessage(err.message);
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setCreating(true);
    setCreateMessage('');
    const form = new FormData(formElement);
    const body = Object.fromEntries(form.entries());
    const organizerKey = body.organizerKey;
    delete body.organizerKey;
    body.startsAt = new Date(body.startsAt).toISOString();
    body.endsAt = new Date(body.endsAt).toISOString();
    body.capacity = Number(body.capacity);
    body.price = Number(body.price || 0);
    body.status = 'published';

    try {
      const data = await apiRequest('/api/events', {
        method: 'POST',
        headers: organizerKey ? { 'x-organizer-key': organizerKey } : {},
        body: JSON.stringify(body),
      });
      setEventList((current) => [...current, data.event].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)));
      formElement.reset();
      setCreateMessage('Your event is published and listed above.');
    } catch (err) {
      setCreateMessage(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="page-shell">
      <nav className="topbar">
        <a className="brand" href="#home" aria-label="EventSphere home">
          <span className="brand-mark">E</span> EventSphere
        </a>
        <div className="nav-links"><a href="#events">Explore events</a><a href="#how">How it works</a></div>
        <div className="nav-actions"><button className="button button-quiet">Log in</button><button className="button button-dark">Get started <span aria-hidden="true">↗</span></button></div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> YOUR NEXT GREAT EXPERIENCE STARTS HERE</div>
          <h1>Make room for<br /><span>something</span> memorable.</h1>
          <p>Discover gatherings worth showing up for. Find your people, book your place, and make the moments count.</p>
          <div className="hero-actions"><a className="button button-dark button-large" href="#events">Explore events <span aria-hidden="true">↗</span></a><a className="text-link" href="#how">See how it works <span aria-hidden="true">→</span></a></div>
          <div className="social-proof"><div className="avatars"><span>A</span><span>R</span><span>M</span><span>+</span></div><div><strong>Events bring us together.</strong><small>Find your next reason to connect.</small></div></div>
        </div>
        <div className="hero-art" aria-label="Abstract event card illustration">
          <div className="art-glow" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="event-ticket"><div className="ticket-top"><span className="ticket-tag">FEATURED EVENT</span><span className="ticket-arrow">↗</span></div><div className="ticket-symbol">✳</div><div className="ticket-bottom"><div><span>TECHNOLOGY · BENGALURU</span><h2>Ideas that<br />move us forward.</h2></div><div className="ticket-date"><strong>18</strong><span>NOV<br />2026</span></div></div></div>
          <div className="floating-note note-top"><span className="note-icon">✦</span><div><strong>Good things happen</strong><small>when we get together</small></div></div>
          <div className="floating-note note-bottom"><span className="check-icon">✓</span><div><strong>You’re on the list!</strong><small>Your next story begins here</small></div></div>
          <div className="art-caption">A little closer to what inspires you. <span>✳</span></div>
        </div>
        <div className="hero-foot"><span>01 — FIND YOUR PEOPLE</span><span>SCROLL TO DISCOVER <b>↓</b></span></div>
      </section>

      <section className="events-section" id="events">
        <div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO START</div><h2>Find your kind of <em>gathering.</em></h2></div><a href="#events" className="text-link">View all events <span aria-hidden="true">→</span></a></div>
        {loading && <p className="events-status" role="status">Finding events for you…</p>}
        {!loading && error && <p className="events-status events-error" role="status">{error} Showing sample events for now.</p>}
        {!loading && !error && eventList.length === 0 && <p className="events-status" role="status">No published events yet. Here are a few examples.</p>}
        <div className="event-grid">{visibleEvents.map((event, index) => <article className={`event-card ${event.color || ['violet', 'orange', 'blue'][index % 3]}`} key={event._id || event.title}><div className="card-art"><span>{event.category}</span><b aria-hidden="true">✳</b></div><div className="card-body"><small>{formatEventDate(event.startsAt)} <i>·</i> {event.location}</small><h3>{event.title}</h3><p className="event-description">{event.description}</p>{event._id?.startsWith('sample-') ? <span className="sample-label">Sample event</span> : <button className="register-link" type="button" onClick={() => { setSelectedEvent(event); setRegistrationMessage(''); setTicketCode(''); }}>Register <span>↗</span></button>}</div></article>)}</div>
        <section className="organizer-panel" id="create-event">
          <div><div className="eyebrow">HOST YOUR OWN</div><h3>Bring people together.</h3><p>Create an event and make it available to attendees.</p></div>
          <form className="event-form" onSubmit={handleCreateEvent}>
            <label>Event title<input name="title" required maxLength="120" /></label>
            <label>Category<input name="category" required /></label>
            <label className="field-wide">Organizer key (required online)<input name="organizerKey" type="password" autoComplete="off" /></label>
            <label className="field-wide">Description<textarea name="description" rows="3" required maxLength="5000" /></label>
            <label>Location<input name="location" required /></label>
            <label>Capacity<input name="capacity" type="number" min="1" step="1" required /></label>
            <label>Starts<input name="startsAt" type="datetime-local" required /></label>
            <label>Ends<input name="endsAt" type="datetime-local" required /></label>
            <label>Price (₹)<input name="price" type="number" min="0" step="0.01" defaultValue="0" /></label>
            <button className="button button-dark field-wide" type="submit" disabled={creating}>{creating ? 'Publishing…' : 'Publish event'} <span aria-hidden="true">↗</span></button>
            {createMessage && <p className="form-message field-wide" role="status">{createMessage}</p>}
          </form>
        </section>
      </section>
      {selectedEvent && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvent(null); }}><section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title"><button className="modal-close" type="button" onClick={() => setSelectedEvent(null)} aria-label="Close registration">×</button><div className="eyebrow">SAVE YOUR PLACE</div><h2 id="registration-title">Register for {selectedEvent.title}</h2><p>{formatEventDate(selectedEvent.startsAt)} · {selectedEvent.location}</p>{ticketCode ? <div className="ticket-confirmation"><span>YOUR TICKET CODE</span><strong>{ticketCode}</strong><small>Keep this code for event check-in.</small></div> : <form className="registration-form" onSubmit={handleRegistration}><label>Your name<input name="attendeeName" autoComplete="name" maxLength="100" required /></label><label>Email address<input name="attendeeEmail" type="email" autoComplete="email" maxLength="254" required /></label><button className="button button-dark" type="submit">Confirm registration <span aria-hidden="true">↗</span></button></form>}{registrationMessage && !ticketCode && <p className="form-message" role="alert">{registrationMessage}</p>}{registrationMessage && ticketCode && <p className="form-message" role="status">{registrationMessage}</p>}</section></div>}
      <footer id="how"><a className="brand" href="#home"><span className="brand-mark">E</span> EventSphere</a><span>More than an event. A moment in the making.</span><span>© 2026 EventSphere</span></footer>
    </main>
  );
}

function formatEventDate(value) {
  if (!value) return 'DATE TO BE ANNOUNCED';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'DATE TO BE ANNOUNCED';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }).format(date).toUpperCase();
}

export default App;
