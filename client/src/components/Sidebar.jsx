import { Link, useLocation } from "react-router-dom";
import { Airplay, CalendarDays, Users } from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { lastEventId } = useAppContext();
  const { user } = useAuth();

  const nav = [
    { label: "Dashboard", to: "/", icon: Airplay, disabled: !user },
    { label: "Events", to: "/events", icon: CalendarDays, disabled: !user },
    {
      label: "Attendees",
      to: lastEventId ? `/events/${lastEventId}/attendees` : "/events",
      icon: Users,
      disabled: !user || !lastEventId,
    },
  ];

  return (
    <div
      className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-72 transform bg-slate-950 shadow-soft transition duration-300 md:static md:translate-x-0`}
    >
      <div className="flex h-full flex-col border-r border-slate-800 px-4 py-6 shadow-xl md:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">Admin Dashboard</p>
            <p className="text-sm text-slate-500">Events & Attendees</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:text-white md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {nav.map((item) => {
            const ActiveIcon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"} ${item.disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <ActiveIcon className="h-5 w-5" />
                {item.label}
                {item.disabled && (
                  <span className="ml-auto text-xs text-slate-500">
                    Select event first
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
