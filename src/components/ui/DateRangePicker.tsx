"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

const QUICK_RANGES = [
  { label: "Hoje", getValue: () => ({ startDate: new Date(), endDate: new Date() }) },
  {
    label: "Últimos 7 dias",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: "Últimos 30 dias",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: "Últimos 90 dias",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: "Este mês",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: "Mês passado",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start, endDate: end };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Selecione um período",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempRange(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getDisplayText = () => {
    if (!value.startDate && !value.endDate) return placeholder;
    if (value.startDate && !value.endDate) return formatDate(value.startDate);
    if (!value.startDate && value.endDate) return `Até ${formatDate(value.endDate)}`;
    return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared = { startDate: null, endDate: null };
    setTempRange(cleared);
    onChange(cleared);
    setIsOpen(false);
  };

  const handleQuickRange = (range: DateRange) => {
    setTempRange(range);
    onChange(range);
    setIsOpen(false);
  };

  const handleDateChange = (type: "startDate" | "endDate", dateString: string) => {
    if (!dateString) {
      setTempRange((prev) => ({ ...prev, [type]: null }));
      return;
    }

    const date = new Date(dateString);
    setTempRange((prev) => ({ ...prev, [type]: date }));
  };

  const toInputValue = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border border-border-default rounded-lg text-sm text-text-primary hover:bg-bg-elevated hover:border-border-hover transition-colors w-full"
      >
        <Calendar className="w-4 h-4 text-text-tertiary" />
        <span className="flex-1 text-left truncate">{getDisplayText()}</span>
        {(value.startDate || value.endDate) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-bg-elevated rounded-md transition-colors"
          >
            <X className="w-3 h-3 text-text-tertiary" />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-[480px] bg-bg-secondary border border-border-default rounded-xl shadow-2xl overflow-hidden">
          <div className="flex">
            {/* Quick Ranges */}
            <div className="w-40 border-r border-border-subtle bg-bg-elevated">
              <div className="p-3 border-b border-border-subtle">
                <h4 className="text-xs font-semibold text-text-secondary uppercase">
                  Períodos
                </h4>
              </div>
              <div className="py-2">
                {QUICK_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleQuickRange(range.getValue())}
                    className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={toInputValue(tempRange.startDate)}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    max={toInputValue(tempRange.endDate || new Date())}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={toInputValue(tempRange.endDate)}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    min={toInputValue(tempRange.startDate)}
                    max={toInputValue(new Date())}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-subtle">
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Limpar
                </Button>
                <Button variant="primary" size="sm" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
