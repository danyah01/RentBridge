// components/charts/Charts.jsx
// Thin recharts wrappers, themed to match the app palette.

import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';

const palette = ['#0b1620', '#b8893d', '#2f6f4e', '#1f5b86', '#a3322a', '#a36a16'];

const baseAxisProps = {
  stroke: '#8a9099',
  fontSize: 11,
  tickLine: false,
  axisLine: { stroke: '#e3dac7' },
};

const tooltipStyle = {
  background: '#0b1620',
  border: 'none',
  borderRadius: 2,
  color: '#f6f1e8',
  fontSize: 12.5,
  padding: '8px 12px',
};

const tooltipItemStyle = { color: '#f6f1e8' };
const tooltipLabelStyle = { color: '#d4a574', fontSize: 11, marginBottom: 4 };

export function LineSeries({ data, xKey, lines = [], height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#e3dac7" />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={tooltipItemStyle}
          labelStyle={tooltipLabelStyle}
        />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name || l.key}
            stroke={l.color || palette[i % palette.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaSeries({ data, xKey, areaKey, color = '#0b1620', height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#e3dac7" />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
        <Area type="monotone" dataKey={areaKey} stroke={color} strokeWidth={2} fill="url(#g1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({ data, xKey, bars = [], height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#e3dac7" />
        <XAxis dataKey={xKey} {...baseAxisProps} />
        <YAxis {...baseAxisProps} />
        <Tooltip cursor={{ fill: 'rgba(11,22,32,.06)' }}
          contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name || b.key}
            fill={b.color || palette[i % palette.length]}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({ data, dataKey = 'value', nameKey = 'name', height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey}
             innerRadius={60} outerRadius={88} paddingAngle={2} stroke="#faf6ee">
          {data.map((entry, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
