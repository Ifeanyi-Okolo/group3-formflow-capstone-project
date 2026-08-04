import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Search, Trash2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const AttendeesPage = () => {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketType, setTicketType] = useState("General");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAttendees = async () => {
    setLoading(true);
    try {
      const [attendeesResponse, eventResponse] = await Promise.all([
        api.get(`/events/${eventId}/attendees`),
        api.get(`/events/${eventId}`),
      ]);
      setAttendees(attendeesResponse.data.data);
      setEventInfo(eventResponse.data.data);
    } catch (err) {
      setError(err.message || "Unable to load attendees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadAttendees();
    }
  }, [eventId]);

  const handleCheckin = async (attendeeId) => {
    try {
      const response = await api.patch(`/attendees/${attendeeId}/checkin`);
      setAttendees((prev) =>
        prev.map((attendee) =>
          attendee._id === attendeeId ? response.data.data : attendee,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to update status");
    }
  };

  const handleCancel = async (attendeeId) => {
    const confirmed = window.confirm(
      "Cancel this ticket and free up availability?",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/attendees/${attendeeId}`);
      setAttendees((prev) =>
        prev.filter((attendee) => attendee._id !== attendeeId),
      );
    } catch (err) {
      setError(err.message || "Unable to cancel ticket");
    }
  };

  const { user } = useAuth();

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/events/${eventId}/attendees`, {
        organizerId: user._id,
        customerName: name,
        customerEmail: email,
        ticketType,
      });
      setAttendees((prev) => [response.data.data, ...prev]);
      setName("");
      setEmail("");
      setTicketType("General");
    } catch (err) {
      setError(err.message || "Unable to register attendee");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttendees = useMemo(() => {
    const query = search.toLowerCase();
    return attendees.filter(
      (attendee) =>
        attendee.customerName.toLowerCase().includes(query) ||
        attendee.customerEmail.toLowerCase().includes(query),
    );
  }, [attendees, search]);

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Attendees</h1>
          <p className="mt-2 text-slate-400">
            Manage check-ins and ticket status for this event.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees"
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-sky-500 sm:w-80"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/40 p-5 text-rose-200">
          {error}
        </div>
      )}

      {eventInfo && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">
            {eventInfo.title}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {eventInfo.location} · {new Date(eventInfo.date).toLocaleString()}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            {eventInfo.description || "No description provided."}
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-white">Register Attendee</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add offline or manual attendees for this event.
        </p>
        <form
          onSubmit={handleRegister}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Customer email"
            type="email"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
          <input
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            placeholder="Ticket type"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Registering..." : "Register Attendee"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading attendees...
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
          No attendees match your search or this event has no registrations yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-soft">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 bg-slate-900 px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500">
            <div>Name</div>
            <div>Email</div>
            <div>Status</div>
            <div className="text-right">Check-In</div>
            <div className="text-right">Cancel</div>
          </div>
          <div className="divide-y divide-slate-800">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee._id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-5 text-sm text-slate-200"
              >
                <div>{attendee.customerName}</div>
                <div>{attendee.customerEmail}</div>
                <div>{attendee.status}</div>
                <button
                  onClick={() => handleCheckin(attendee._id)}
                  className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <CheckCircle2 className="inline-block h-4 w-4" />{" "}
                  {attendee.status === "checked-in" ? "Undo" : "Check In"}
                </button>
                <button
                  onClick={() => handleCancel(attendee._id)}
                  className="rounded-3xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  <Trash2 className="inline-block h-4 w-4" /> Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeesPage;
