import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer
} from "recharts";

// Monochromatic palette from your UI
const COLORS = ["#000000", "#1A1A1A", "#333333", "#4D4D4D", "#666666", "#808080"];

interface Props {
  rows: Record<string, any>[];
  chartType: "bar" | "line" | "pie" | "area" | "scatter" | "radar";
}

/**
 * Qlue Modular Chart Engine
 * Styling: Minimalist, Sharp, Heavy Sans Typography
 */
export default function Chart({ rows, chartType }: Props) {
  if (!rows || rows.length === 0) return null;

  const keys = Object.keys(rows[0]);
  const xKey = keys[0];
  const yKey = keys[1];

  // Global axis & tooltip styles to match your screenshots
  const axisStyle = {
    fontSize: "9px",
    fontWeight: 900,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fill: "#999",
  };

  const tooltipStyle = {
    backgroundColor: "#000",
    border: "none",
    borderRadius: "0px",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    padding: "10px",
  };

  if (chartType === "bar") return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={rows} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={{ stroke: '#000' }} tickLine={false} dy={10} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f5f5f5" }} />
        {/* No radius = Sharp brutalist corners */}
        <Bar dataKey={yKey} fill="#000" radius={0}>
          {rows.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#000" : "#333"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  if (chartType === "line") return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={rows} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={{ stroke: '#000' }} tickLine={false} dy={10} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#000"
          strokeWidth={3}
          dot={{ r: 0 }} // Clean line, or use {r: 4, fill: "#000", strokeWidth: 0}
          activeDot={{ r: 6, fill: "#000" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (chartType === "area") return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={rows} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#000" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#000" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={{ stroke: '#000' }} tickLine={false} dy={10} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="stepAfter" // Makes the area chart look like a digital readout
          dataKey={yKey}
          stroke="#000"
          strokeWidth={2}
          fill="url(#areaGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  if (chartType === "pie") return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={rows}
          dataKey={yKey}
          nameKey={xKey}
          cx="50%"
          cy="50%"
          outerRadius={140}
          innerRadius={80} // Donut style looks more modern/tech
          paddingAngle={4}
          stroke="none"
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="rect" // Sharp legend icons
          wrapperStyle={{ paddingTop: "40px", ...axisStyle, color: "#000" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  if (chartType === "scatter") return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#ddd" />
        <XAxis dataKey={xKey} name={xKey} tick={axisStyle} axisLine={{ stroke: '#000' }} />
        <YAxis dataKey={yKey} name={yKey} tick={axisStyle} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={rows} fill="#000" shape="square" /> {/* Square dots for brutalism */}
      </ScatterChart>
    </ResponsiveContainer>
  );

  if (chartType === "radar") return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={rows} cx="50%" cy="50%" outerRadius={120}>
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis dataKey={xKey} tick={axisStyle} />
        <Radar
          dataKey={yKey}
          stroke="#000"
          fill="#000"
          fillOpacity={0.4}
          strokeWidth={3}
        />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );

  return null;
}