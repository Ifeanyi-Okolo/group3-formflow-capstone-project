import { useEffect, useState } from "react";

const initialState = {
  title: "",
  description: "",
  date: "",
  location: "",
  totalTickets: "",
  ticketPrice: "",
  status: "draft",
};

const EventModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().slice(0, 16)
          : "",
        location: initialData.location || "",
        totalTickets: initialData.totalTickets || "",
        ticketPrice: initialData.ticketPrice || "",
        status: initialData.status || "draft",
      });
    } else {
      setForm(initialState);
    }
  }, [initialData]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      totalTickets: Number(form.totalTickets),
      ticketPrice: Number(form.ticketPrice),
      date: new Date(form.date).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {initialData ? "Update Event" : "Create Event"}
            </h2>
            <p className="text-sm text-slate-500">
              Add event details and ticket settings.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:border-slate-700 hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Title
              <input
                value={form.title}
                onChange={handleChange("title")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                placeholder="Event title"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Location
              <input
                value={form.location}
                onChange={handleChange("location")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                placeholder="City or venue"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Description
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows="3"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
              placeholder="Describe the event"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              Date
              <input
                type="datetime-local"
                value={form.date}
                onChange={handleChange("date")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Total Tickets
              <input
                type="number"
                min="0"
                value={form.totalTickets}
                onChange={handleChange("totalTickets")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                placeholder="100"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Ticket Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.ticketPrice}
                onChange={handleChange("ticketPrice")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                placeholder="59.99"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Status
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            {initialData ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
