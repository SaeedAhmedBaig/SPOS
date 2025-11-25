import React from 'react';

// -------------------- Bar Chart --------------------
const BarChart = ({ data = [], height = 200, width = '100%', color = '#4f46e5', showGrid = true, className = '' }) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const barWidth = 100 / data.length;

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 100 ${height}`}>
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((g, i) => (
            <line key={i} x1="0" y1={g * height} x2="100" y2={g * height} stroke="#e5e7eb" strokeWidth="0.5" />
          ))
        }

        {data.map((item, index) => {
          const barHeight = maxValue ? (item.value / maxValue) * height * 0.8 : 0;
          const x = index * barWidth + barWidth * 0.1;
          const y = height - barHeight;
          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth * 0.8} height={barHeight} fill={color} className="transition-all duration-300 hover:opacity-80" />
              <text x={x + barWidth * 0.4} y={y - 5} textAnchor="middle" className="text-xs fill-gray-600">{item.value}</text>
              <text x={x + barWidth * 0.4} y={height + 10} textAnchor="middle" className="text-xs fill-gray-500">{item.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// -------------------- Line Chart --------------------
const LineChart = ({ data = [], height = 200, width = '100%', color = '#10b981', strokeWidth = 2, showPoints = true, className = '' }) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const pointSpacing = 100 / (data.length - 1);

  const points = data.map((item, index) => {
    const x = index * pointSpacing;
    const y = height - (item.value / maxValue) * height * 0.8;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 100 ${height}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1="0" y1={g * height} x2="100" y2={g * height} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}

        <polyline fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" points={points} />

        {showPoints && data.map((item, index) => {
          const x = index * pointSpacing;
          const y = height - (item.value / maxValue) * height * 0.8;
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="2" fill={color} className="transition-all duration-300" />
              <text x={x} y={y - 6} textAnchor="middle" className="text-xs fill-gray-600">{item.value}</text>
              <text x={x} y={height + 10} textAnchor="middle" className="text-xs fill-gray-500">{item.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// -------------------- Pie Chart --------------------
const PieChart = ({ data = [], height = 200, width = 200, colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], className = '' }) => {
  if (!data.length) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const slices = data.reduce((acc, item, index) => {
    const previousAngle = acc.reduce((sum, s) => sum + s.angle, 0);
    const percentage = item.value / total;
    const angle = percentage * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const startAngle = previousAngle - 90; // start from top
    const endAngle = startAngle + angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

    acc.push({
      pathData: `M50,50 L${x1},${y1} A40,40 0 ${largeArcFlag} 1 ${x2},${y2} Z`,
      color: colors[index % colors.length],
      label: item.label,
      percentage,
      angle
    });
    return acc;
  }, []);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <svg width={width} height={height} viewBox="0 0 100 100">
        {slices.map((slice, index) => (
          <path key={index} d={slice.pathData} fill={slice.color} className="transition-all duration-300 hover:opacity-80" />
        ))}
        <circle cx="50" cy="50" r="15" fill="white" />
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center space-x-1 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-600">{slice.label}</span>
            <span className="text-gray-400">({Math.round(slice.percentage * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { BarChart, LineChart, PieChart };
