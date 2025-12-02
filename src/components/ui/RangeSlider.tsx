"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (value: number) => string;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatLabel = (v) => v.toString(),
  className,
}: RangeSliderProps) {
  const [minVal, maxVal] = value;
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  const getPercent = (value: number) =>
    ((value - min) / (max - min)) * 100;

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  const handleMouseMove = (e: MouseEvent) => {
    if (!rangeRef.current) return;

    const rect = rangeRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = Math.round((percent / 100) * (max - min) + min);
    const clampedValue = Math.max(min, Math.min(max, newValue));

    if (isDraggingMin) {
      const newMin = Math.min(clampedValue, maxVal - step);
      onChange([newMin, maxVal]);
    } else if (isDraggingMax) {
      const newMax = Math.max(clampedValue, minVal + step);
      onChange([minVal, newMax]);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  };

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingMin, isDraggingMax, minVal, maxVal]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Labels */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">
          {formatLabel(minVal)}
        </span>
        <span className="text-text-tertiary">-</span>
        <span className="font-medium text-text-primary">
          {formatLabel(maxVal)}
        </span>
      </div>

      {/* Slider */}
      <div
        ref={rangeRef}
        className="relative h-2 bg-bg-elevated rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary-400 rounded-full shadow-lg cursor-grab transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-400",
            isDraggingMin && "cursor-grabbing scale-110"
          )}
          style={{ left: `calc(${minPercent}% - 10px)` }}
          onMouseDown={() => setIsDraggingMin(true)}
          aria-label="Minimum value"
        />

        {/* Max thumb */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-secondary-400 rounded-full shadow-lg cursor-grab transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary-400",
            isDraggingMax && "cursor-grabbing scale-110"
          )}
          style={{ left: `calc(${maxPercent}% - 10px)` }}
          onMouseDown={() => setIsDraggingMax(true)}
          aria-label="Maximum value"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  );
}
