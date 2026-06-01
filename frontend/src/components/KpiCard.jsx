export default function KpiCard({ title, value, subtitle, icon, color = "blue", onClick }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const interactive = Boolean(onClick);

  return (
    <div
      className={`card px-4 py-3 flex items-center gap-3 min-h-0 ${
        interactive ? "kpi-card-interactive" : ""
      }`}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {icon && (
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 leading-tight">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate figure">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
