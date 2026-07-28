import clsx from "clsx";

const StatsCard = ({ label, value, icon, accent = "sky" }) => {
  const classes = clsx(
    "rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-soft",
    {
      "border-sky-500/20 bg-sky-950/40": accent === "sky",
      "border-emerald-500/20 bg-emerald-950/40": accent === "emerald",
      "border-amber-500/20 bg-amber-950/40": accent === "amber",
      "border-violet-500/20 bg-violet-950/40": accent === "violet",
    },
  );

  return (
    <div className={classes}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
        <div className="rounded-2xl bg-slate-800 p-3 text-slate-200">
          {icon}
        </div>
      </div>
      <p className="mt-6 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
};

export default StatsCard;
