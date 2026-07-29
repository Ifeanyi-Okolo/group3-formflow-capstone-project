import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios.js";
import EventModal from "../components/EventModal.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const { lastEventId, setLastEventId } = useAppContext();
  const { user } = useAuth();

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/events?organizerId=${user._id}`);
        setEvents(response.data.data);
        if (!lastEventId && response.data.data.length > 0) {
          setLastEventId(response.data.data[0]._id);
        }
      } catch (err) {
        setError(err.message || "Unable to load events");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [refresh, lastEventId, setLastEventId, user]);

  const openCreate = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (selectedEvent) {
        await api.put(`/events/${selectedEvent._id}`, payload);
      } else {
        await api.post("/events", {
          ...payload,
          organizerId: user._id,
        });
      }
      setModalOpen(false);
      setRefresh((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this event?",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      setRefresh((prev) => !prev);
    } catch (err) {
      setError(err.message || "Unable to cancel event");
    }
  };

  const eventCount = useMemo(() => events.length, [events]);

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Events</h1>
          <p className="mt-2 text-slate-400">
            Create, update, and manage event ticketing.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/40 p-5 text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
          No events found. Create your first event to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-soft"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-semibold text-white">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.location} · {new Date(event.date).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {event.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Tickets
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {event.availableTickets}/{event.totalTickets}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    ${event.ticketPrice}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Created
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/events/${event._id}/attendees`}
                  onClick={() => setLastEventId(event._id)}
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:text-white"
                >
                  View Attendees
                </Link>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openEdit(event)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="inline-flex items-center gap-2 rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    <Trash2 className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedEvent}
      />
    </div>
  );
};

export default EventsPage;
