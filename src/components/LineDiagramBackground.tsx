import React from 'react';

interface LineDiagramBackgroundProps {
  className?: string;
  variant?: 'topographic' | 'waves' | 'grid' | 'constellation';
}

export const LineDiagramBackground: React.FC<LineDiagramBackgroundProps> = ({
  className = '',
  variant = 'topographic'
}) => {
  if (variant === 'waves') {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 900 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover opacity-[0.06] dark:opacity-[0.08] stroke-[var(--green)]"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 120 C 150 40, 350 200, 550 100 C 750 0, 950 180, 1050 120"
            strokeWidth="1.2"
          />
          <path
            d="M-50 150 C 150 70, 350 230, 550 130 C 750 30, 950 210, 1050 150"
            strokeWidth="1.2"
          />
          <path
            d="M-50 180 C 150 100, 350 260, 550 160 C 750 60, 950 240, 1050 180"
            strokeWidth="1.2"
          />
          <path
            d="M-50 210 C 150 130, 350 290, 550 190 C 750 90, 950 270, 1050 210"
            strokeWidth="1.2"
          />
          <path
            d="M-50 240 C 150 160, 350 320, 550 220 C 750 120, 950 300, 1050 240"
            strokeWidth="1.2"
          />
        </svg>
      </div>
    );
  }

  // Default: Organic topographic contour elevation curves
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 800 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover opacity-[0.06] dark:opacity-[0.08] stroke-[var(--green)]"
      >
        <path
          d="M0 240 C 200 240, 260 160, 420 180 C 580 200, 680 120, 800 130"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path
          d="M0 200 C 180 190, 280 120, 440 140 C 600 160, 690 90, 800 95"
          strokeWidth="1.2"
        />
        <path
          d="M0 160 C 170 140, 300 80, 460 100 C 620 120, 710 60, 800 65"
          strokeWidth="1.5"
        />
        <path
          d="M0 120 C 150 100, 320 50, 480 65 C 640 80, 730 30, 800 35"
          strokeWidth="1.2"
        />
        <path
          d="M0 80 C 140 60, 340 20, 500 35 C 660 50, 750 10, 800 15"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Accent focal rings */}
        <circle cx="460" cy="100" r="45" strokeWidth="1" opacity="0.4" />
        <circle cx="460" cy="100" r="90" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
        <circle cx="460" cy="100" r="140" strokeWidth="0.8" opacity="0.2" />
      </svg>
    </div>
  );
};
