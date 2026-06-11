"use client";

import { useEffect, useState } from "react";

interface NdviGaugeProps {
  value: number;
  size?: number;
}

export default function NdviGauge({ value, size = 180 }: NdviGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(220); // start at far left

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const clamped = Math.max(0, Math.min(1, value));
  // Map NDVI 0-1 to angle: 220° to -40° (280° arc)
  const startAngle = 220;
  const endAngle = -40;
  const totalArc = startAngle - endAngle; // 260°
  const needleAngle = startAngle - clamped * totalArc;

  // Color based on value
  const color =
    clamped >= 0.8
      ? "#22c55e" // green
      : clamped >= 0.6
      ? "#86efac" // light green
      : clamped >= 0.4
      ? "#eab308" // yellow
      : clamped >= 0.2
      ? "#f59e0b" // amber
      : "#dc2626"; // red

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAngle(needleAngle);
    }, 200);
    return () => clearTimeout(timer);
  }, [needleAngle]);

  // Color zone segments (each as an arc)
  const zones = [
    { min: 0.0, max: 0.2, color: "#dc2626", label: "Very Poor" },
    { min: 0.2, max: 0.4, color: "#f59e0b", label: "Poor" },
    { min: 0.4, max: 0.6, color: "#eab308", label: "Moderate" },
    { min: 0.6, max: 0.8, color: "#86efac", label: "Good" },
    { min: 0.8, max: 1.0, color: "#22c55e", label: "Excellent" },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {/* Color zone arcs */}
        {zones.map((zone) => {
          const zoneStart = startAngle - (zone.max / 1) * totalArc;
          const zoneEnd = startAngle - (zone.min / 1) * totalArc;
          return (
            <path
              key={zone.label}
              d={describeArc(center, center, radius, zoneEnd, zoneStart)}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              opacity={0.6}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * 0.7 * Math.cos(((animatedAngle - 180) * Math.PI) / 180)}
          y2={center + radius * 0.7 * Math.sin(((animatedAngle - 180) * Math.PI) / 180)}
          className="transition-all duration-1000 ease-out"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 3px ${color}40)`,
          }}
        />
        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={6}
          className="fill-slate-200 dark:fill-slate-600 stroke-white dark:stroke-slate-800"
          strokeWidth={2}
        />

        {/* Center text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="fill-slate-900 dark:fill-white font-bold"
          fontSize={size * 0.14}
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        >
          {clamped.toFixed(3)}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 font-medium"
          fontSize={size * 0.055}
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        >
          NDVI Score
        </text>
      </svg>

      {/* Color indicator dots */}
      <div className="flex items-center gap-3 mt-2">
        {zones.map((zone) => (
          <div key={zone.label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              {zone.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const sweepFlag = 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
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