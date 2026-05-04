'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DatePickerCalendarProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePickerCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  disabled = false,
  className,
}: DatePickerCalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    value ? value.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = React.useState(
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const [openUpward, setOpenUpward] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update internal state when external value changes
  React.useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
    }
  }, [value]);

  // Handle escape key to close calendar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentDate = new Date();
  const minYear = minDate?.getFullYear() || 1900;
  const maxYear = maxDate?.getFullYear() || currentDate.getFullYear() + 10;

  // Generate years array
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  ).reverse();

  // Generate days for current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_) => null);

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);

    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;

    return false;
  };

  const isDateSelected = (day: number) => {
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

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const checkPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const calendarHeight = 350; // Approximate height of the calendar
      const spaceBelow = viewportHeight - rect.bottom;

      // Prefer opening downward unless there's really not enough space
      const shouldOpenUpward = spaceBelow < calendarHeight && spaceBelow < 200;
      setOpenUpward(shouldOpenUpward);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      checkPosition();
    }
    setIsOpen(open);
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = parseInt(month);
    setCurrentMonth(monthIndex);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setCurrentYear(yearNum);
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return placeholder;
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div ref={containerRef} className={cn('relative z-10', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && handleOpenChange(!isOpen)}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start text-left font-normal',
          !selectedDate && 'text-muted-foreground',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayDate()}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar Panel */}
          <div
            className={cn(
              'bg-background absolute left-0 z-[100] w-80 rounded-lg border p-4 shadow-xl',
              openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
            )}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Select
                  value={currentMonth.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[110] max-h-60">
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={currentYear.toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[110] max-h-60">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground flex h-8 items-center justify-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty days for alignment */}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="h-8" />
              ))}

              {/* Days */}
              {days.map((day) => {
                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={cn(
                      'h-8 w-full rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                      selected &&
                        'bg-primary text-primary-foreground hover:bg-primary',
                      today && !selected && 'bg-accent text-accent-foreground',
                      disabled &&
                        'hover:text-muted-foreground cursor-not-allowed opacity-50 hover:bg-transparent'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

DatePickerCalendar.displayName = 'DatePickerCalendar';
