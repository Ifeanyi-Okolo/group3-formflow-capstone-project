import { useEffect, useState } from "react";
import { BarChart, CalendarDays, CheckCircle2, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import StatsCard from "../components/StatsCard.jsx";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/dashboard/stats?organizerId=${user?._id}`,
        );
        setStats(response.data.data);
        setEvents(response.data.data.recentEvents || []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Overview of ticket sales, revenue, and active event performance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/40 p-6 text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign />}
              accent="emerald"
            />
            <StatsCard
              label="Tickets Sold"
              value={stats.totalTicketsSold}
              icon={<CheckCircle2 />}
              accent="sky"
            />
            <StatsCard
              label="Active Events"
              value={stats.totalUpcomingEvents}
              icon={<CalendarDays />}
              accent="violet"
            />
            <StatsCard
              label="Active Attendees"
              value={stats.activeAttendees}
              icon={<BarChart />}
              accent="amber"
            />
          </div>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Recent Events
                </h2>
                <p className="text-sm text-slate-500">
                  A quick view of your most recent event activity.
                </p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-500">
                No recent events available.
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {event.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {event.location} ·{" "}
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
