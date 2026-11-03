import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  sublabel?: string;
  valueDisplay?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  primaryColor = '#10b981', // emerald-500
  sublabel = 'Goal Won',
  valueDisplay
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${primaryColor})`
          }}
        />
      </svg>
      {/* Central label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading font-black text-2xl md:text-3xl tracking-tight text-white font-mono-num">
          {valueDisplay || `${clamped}%`}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
          {sublabel}
        </span>
      </div>
    </div>
  );
};
