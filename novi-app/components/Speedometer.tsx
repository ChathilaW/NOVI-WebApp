type SpeedometerProps = {
  percentage: number; // 0-100
};

export default function Speedometer({ percentage }: SpeedometerProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate needle angle (-90° at 0%, +90° at 100%)
  const needleAngle = -90 + (clampedPercentage / 100) * 180;
  
  // Determine color based on percentage
  const getColor = (pct: number) => {
    if (pct < 40) return '#ef4444'; // Red
    if (pct < 70) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const color = getColor(clampedPercentage);

  return (
    <div className="flex flex-col items-center mb-4">
      <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Colored progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${(clampedPercentage / 100) * 251.2} 251.2`}
        />
        
        {/* Center dot */}
        <circle cx="100" cy="100" r="8" fill="#1f2937" />
        
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="35"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${needleAngle} 100 100)`}
        />
        
        {/* Needle cap */}
        <circle cx="100" cy="100" r="5" fill={color} />
      </svg>
      
      {/* Percentage display */}
      <div className="text-center mt-1">
        <div className="text-3xl font-bold" style={{ color }}>
          {clampedPercentage.toFixed(0)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">Focus Score</div>
      </div>
    </div>
  );
}
