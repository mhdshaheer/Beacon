'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function DatePicker({ value, onChange, error, label, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'year'>('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const yearGridRef = useRef<HTMLDivElement>(null);

  // Helper to parse date strings (YYYY-MM-DD or ISO) to local Date object
  const parseDate = (dateStr: any): Date | null => {
    if (!dateStr) return null;
    
    // Handle Date objects
    if (dateStr instanceof Date) return dateStr;
    
    // Handle string inputs
    if (typeof dateStr === 'string') {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // The actual selected date object derived from the prop
  const selectedDate = useMemo(() => parseDate(value), [value]);

  // Sync viewDate when the picker opens or value changes (but only if view hasn't been manually changed)
  useEffect(() => {
    if (selectedDate && isOpen) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to current year in year view
  useEffect(() => {
    if (viewMode === 'year' && yearGridRef.current) {
      const activeYear = yearGridRef.current.querySelector('[data-active="true"]');
      if (activeYear) {
        activeYear.scrollIntoView({ block: 'center', behavior: 'instant' as any });
      }
    }
  }, [viewMode]);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const isFuture = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handleDateClick = (day: number) => {
    if (isFuture(day)) return;
    const newDate = new Date(currentYear, currentMonth, day);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
    setViewMode('calendar');
  };

  const isDaySelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i); 

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "input-field flex items-center justify-between text-left h-11 w-full transition-all duration-200",
          !value && "text-gray-500",
          isOpen && "border-emerald-500/50 ring-1 ring-emerald-500/20",
          error && "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]"
        )}
      >
        <span className="text-sm font-medium">
          {selectedDate 
            ? selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
            : placeholder || 'Select date'}
        </span>
        <CalendarIcon className={cn(
          "w-4 h-4 transition-colors",
          value ? "text-emerald-400" : "text-gray-500"
        )} />
      </button>

      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] absolute -bottom-4 left-0"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute z-[100] w-72 max-w-[calc(100vw-3rem)] left-0 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#141414] p-5 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1.5 opacity-80">Selected Date</p>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {selectedDate 
                      ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'None Selected'}
                  </h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="h-[300px] relative">
              {viewMode === 'calendar' ? (
                <div className="p-4 pt-5">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <button 
                      type="button" 
                      onClick={() => setViewMode('year')}
                      className="text-xs font-bold text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 group"
                    >
                      {MONTHS[currentMonth]} {currentYear}
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
                        <ChevronLeft className="w-4.5 h-4.5" />
                      </button>
                      <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
                        <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 mb-3">
                    {DAYS.map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-bold text-gray-600 h-6 flex items-center justify-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const disabled = isFuture(day);
                      const selected = isDaySelected(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDateClick(day)}
                          disabled={disabled}
                          className={cn(
                            "h-8.5 w-8.5 text-xs rounded-xl flex items-center justify-center transition-all relative font-medium",
                            selected 
                              ? "bg-emerald-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                              : "text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400",
                            isToday(day) && !selected && "text-emerald-400 font-bold ring-1 ring-emerald-500/30",
                            disabled && "opacity-10 cursor-not-allowed grayscale pointer-events-none"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div 
                  ref={yearGridRef}
                  className="absolute inset-0 overflow-y-auto scrollbar-hide grid grid-cols-3 gap-2.5 p-5 pt-6 animate-in fade-in zoom-in-95 duration-200"
                >
                  {years.map((year) => {
                    const isFutureYear = year > new Date().getFullYear();
                    const isSelectedYear = year === currentYear;
                    return (
                      <button
                        key={year}
                        type="button"
                        data-active={isSelectedYear}
                        onClick={() => !isFutureYear && handleYearSelect(year)}
                        disabled={isFutureYear}
                        className={cn(
                          "h-11 text-sm font-bold rounded-xl transition-all",
                          isSelectedYear 
                            ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                            : "text-gray-400 hover:bg-white/10 hover:text-white border border-white/5",
                          isFutureYear && "opacity-20 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 p-3 bg-[#141414]/80 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setViewMode('calendar');
                }}
                className="px-4 py-2 text-[11px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setViewMode('calendar');
                }}
                className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg transition-all uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
