import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PieChartTooltip = ({ active, payload, nameKey, dataKey, total }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0].payload;
  const percentage = total > 0 ? ((item[dataKey] / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-semibold text-gray-900 dark:text-white">{item[nameKey]}</p>
      <p className="text-sm" style={{ color: item.color }}>
        Value: <span className="font-medium">{item[dataKey]}</span>
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Percentage: {percentage}%
      </p>
    </div>
  );
};

/**
 * Pie chart component for proportional data
 * @param {Object} props
 * @param {Array} props.data - Chart data array [{ name, value, color }]
 * @param {string} props.dataKey - Key for value (default 'value')
 * @param {string} props.nameKey - Key for name (default 'name')
 * @param {string} props.title - Chart title
 * @param {boolean} props.showLegend - Show legend
 * @param {boolean} props.showTooltip - Show tooltip
 * @param {boolean} props.showLabel - Show label on slices
 * @param {string} props.height - Chart height (default 300)
 */
const PieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title,
  showLegend = true,
  showTooltip = true,
  showLabel = false,
  height = '300px',
  innerRadius = 0,
  outerRadius = 80,
}) => {
  // Default data if none provided
  const defaultData = [
    { name: 'Completed', value: 400, color: '#22c55e' },
    { name: 'In Progress', value: 300, color: '#f59e0b' },
    { name: 'Pending', value: 200, color: '#ef4444' },
    { name: 'Not Started', value: 100, color: '#6b7280' },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item[dataKey], 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (!showLabel) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip content={<PieChartTooltip nameKey={nameKey} dataKey={dataKey} total={total} />} />
            )}
            {showLegend && <Legend />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;
