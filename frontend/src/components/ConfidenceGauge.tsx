"use client";

import { useEffect, useState } from "react";

interface ConfidenceGaugeProps {
  confidence: number;
  size?: number;
}

export default function ConfidenceGauge({
  confidence,
  size = 160,
}: ConfidenceGaugeProps) {
  const [animatedOffset, setAnimatedOffset] = useState(0);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = Math.PI * radius; // half circle

  // Clamp confidence 0-100
  const clampedConfidence = Math.max(0, Math.min(100, confidence));
  const dashOffset = circumference - (clampedConfidence / 100) * circumference;

  useEffect(() => {
    // Animate from 0 to target
    const timer = setTimeout(() => {
      setAnimatedOffset(dashOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [dashOffset]);

  // Background arc path (180° from bottom-left to bottom-right)
  const arcPath = describeArc(
    center,
    center,
    radius,
    180,
    0
  );

  const confidenceColor =
    clampedConfidence >= 70
      ? "stroke-primary-500"
      : clampedConfidence >= 40
      ? "stroke-warning"
      : "stroke-danger";

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 16}
        viewBox={`0 0 ${size} ${size / 2 + 16}`}
        className="drop-shadow-sm"
      >
        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={arcPath}
          fill="none"
          className={`${confidenceColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            filter: `drop-shadow(0 0 4px ${
              clampedConfidence >= 70
                ? "rgba(34,197,94,0.4)"
                : clampedConfidence >= 40
                ? "rgba(217,119,6,0.4)"
                : "rgba(220,38,38,0.4)"
            })`,
          }}
        />
        {/* Center text */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-900 dark:fill-white font-bold"
          fontSize={size * 0.18}
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        >
          {Math.round(clampedConfidence)}%
        </text>
      </svg>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
        Confidence
      </span>
    </div>
  );
}

// Helper: describe an arc from startAngle to endAngle (in degrees, SVG coords)
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}