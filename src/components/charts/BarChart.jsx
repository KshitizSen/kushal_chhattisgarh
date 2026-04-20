import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BarChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/**
 * Bar chart component for displaying categorical data
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {Array} props.bars - Bar configurations [{ dataKey, name, color }]
 * @param {string} props.xAxisKey - Key for x-axis data
 * @param {string} props.title - Chart title
 * @param {boolean} props.showGrid - Show grid lines
 * @param {boolean} props.showLegend - Show legend
 * @param {boolean} props.showTooltip - Show tooltip
 * @param {string} props.height - Chart height (default 300)
 */
const BarChart = ({
  data = [],
  bars,
  xKey,
  yKey,
  yKeys,
  color = '#3b82f6',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
  xAxisKey = 'name',
  title,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = '300px',
  stacked = false,
}) => {
  // Default data if none provided
  const defaultData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const barConfigs = bars || (
    Array.isArray(yKeys)
      ? yKeys.map((entry, index) => ({
          dataKey: entry.key,
          name: entry.label,
          color: entry.color || colors[index % colors.length],
        }))
      : Array.isArray(yKey)
        ? yKey.map((entry, index) => ({
            dataKey: entry,
            name: entry,
            color: colors[index % colors.length],
          }))
        : [{
            dataKey: yKey || 'value',
            name: title || 'Value',
            color,
          }]
  );

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis
              dataKey={xKey || xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            {showTooltip && <Tooltip content={<BarChartTooltip />} />}
            {showLegend && <Legend />}
            {barConfigs.map((bar, index) => (
              <Bar
                key={bar.dataKey || index}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
