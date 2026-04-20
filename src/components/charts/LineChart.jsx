import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const LineChartTooltip = ({ active, payload, label }) => {
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
 * Line chart component for trends over time
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {Array} props.lines - Line configurations [{ dataKey, name, color, strokeWidth }]
 * @param {string} props.xAxisKey - Key for x-axis data
 * @param {string} props.title - Chart title
 * @param {boolean} props.showGrid - Show grid lines
 * @param {boolean} props.showLegend - Show legend
 * @param {boolean} props.showTooltip - Show tooltip
 * @param {boolean} props.showDots - Show data points
 * @param {string} props.height - Chart height (default 300)
 */
const LineChart = ({
  data = [],
  lines,
  xKey,
  yKey,
  color = '#3b82f6',
  xAxisKey = 'name',
  title,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showDots = true,
  height = '300px',
}) => {
  // Default data if none provided
  const defaultData = [
    { name: 'Jan', value: 400, secondary: 240 },
    { name: 'Feb', value: 300, secondary: 139 },
    { name: 'Mar', value: 600, secondary: 380 },
    { name: 'Apr', value: 800, secondary: 490 },
    { name: 'May', value: 500, secondary: 380 },
    { name: 'Jun', value: 700, secondary: 430 },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const lineConfigs = lines || [
    {
      dataKey: yKey || 'value',
      name: title || 'Value',
      color,
    },
  ];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsLineChart
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
            {showTooltip && <Tooltip content={<LineChartTooltip />} />}
            {showLegend && <Legend />}
            {lineConfigs.map((line, index) => (
              <Line
                key={line.dataKey || index}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                dot={showDots ? { r: 4 } : false}
                activeDot={{ r: 6 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
