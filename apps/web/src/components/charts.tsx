import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#000", "#444", "#888", "#aaa", "#ccc"];

interface Props {
  rows: Record<string, any>[];
  chartType: "bar" | "line" | "pie";
}

export default function Chart({ rows, chartType }: Props) {
  if (!rows || rows.length === 0) return null;

  const keys = Object.keys(rows[0]);
  const xKey = keys[0];
  const yKey = keys[1];

  if (chartType === "bar") return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={rows}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey={yKey} fill="#000" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  if (chartType === "line") return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={rows}>
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line dataKey={yKey} stroke="#000" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (chartType === "pie") return (
    <ResponsiveContainer width="100%" height={340}>
      <PieChart>
        <Pie data={rows} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={120}>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  return null;
}