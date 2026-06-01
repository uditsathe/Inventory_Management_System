import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_COLORS = [
  "#155E8A",
  "#3C7C8C",
  "#2F7D5B",
  "#B07A1E",
  "#B5483E",
  "#5B6E9C",
  "#8A6D9B",
  "#6F8F7A",
];

const STATUS_COLORS = {
  PENDING: "#B07A1E",
  CONFIRMED: "#155E8A",
  SHIPPED: "#3C7C8C",
  DELIVERED: "#2F7D5B",
  CANCELLED: "#B5483E",
};

function getColor(name, index, colorMap) {
  return colorMap?.[name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function CloseIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function BreakdownOverlay({
  title,
  subtitle,
  data,
  colorMap,
  onClose,
  isLoading,
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-title"
    >
      <div
        className="breakdown-overlay-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          className="card breakdown-overlay-panel w-full max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 pr-2">
              <h2
                id="breakdown-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-16">
              Loading breakdown...
            </p>
          ) : data.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">
              No data to display.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={48}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={{ stroke: "#97A0A8", strokeWidth: 1 }}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={getColor(entry.name, index, colorMap)}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Count by group
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={data}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEDEA" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={getColor(entry.name, index, colorMap)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-2 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {data.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: getColor(item.name, index, colorMap),
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.value}
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            (
                            {total ? Math.round((item.value / total) * 100) : 0}
                            %)
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { STATUS_COLORS };
