"use client";

import { useEffect, useState } from "react";

export function CircularScore({
  value,
  size = 56,
  strokeWidth = 6,
  color: colorOverride,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1s
    const steps = 30;
    const increment = value / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayValue / 100);
  const color =
    colorOverride ?? (value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444");

  const filterId = `glow-${value}-${size}-${strokeWidth}`;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-neutral-200/60 dark:text-neutral-800"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#${filterId})`}
          className="transition-all duration-75 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight"
        style={{ fontSize: size * 0.28 }}
      >
        {displayValue}%
      </span>
    </div>
  );
}

