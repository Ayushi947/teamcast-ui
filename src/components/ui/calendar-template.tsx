'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarTemplateProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  className?: string;
}

export function CalendarTemplate({
  date,
  onDateChange,
  className,
}: CalendarTemplateProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP')
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            fromYear={1960}
            toYear={new Date().getFullYear() + 10}
            captionLayout="dropdown-buttons"
            disabled={(date) => {
              const today = new Date();
              const minDate = new Date(1960, 0, 1);
              const maxDate = new Date(today.getFullYear() + 10, 11, 31);
              return date < minDate || date > maxDate;
            }}
            classNames={{
              caption_label: 'hidden',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
