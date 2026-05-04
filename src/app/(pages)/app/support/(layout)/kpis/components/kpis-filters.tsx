'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface KpisFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    filterBy: string;
  };
  onFiltersChange: (filters: {
    startDate: string;
    endDate: string;
    filterBy: string;
  }) => void;
}

const filterOptions = [
  { value: 'all', label: 'All Filters' },
  { value: 'user_signup', label: 'User Signup' },
  { value: 'support_invitations', label: 'Support Invitations' },
  { value: 'partner_invitations', label: 'Partner Invitations' },
  { value: 'job_invitations', label: 'Job Invitations' },
  {
    value: 'job_ai_assessment_invitations',
    label: 'Job AI Assessment Invitations',
  },
];

export const KpisFilters = ({ filters, onFiltersChange }: KpisFiltersProps) => {
  const handleDateChange = (
    field: 'startDate' | 'endDate',
    date: Date | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [field]: date ? date.toISOString() : '',
    });
  };

  const handleFilterByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      filterBy: value,
    });
  };

  const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateChange('startDate', date)}
                  initialFocus
                  fromYear={1960}
                  toYear={new Date().getFullYear() + 10}
                  captionLayout="dropdown-buttons"
                  disabled={(date) => {
                    const minDate = new Date(1960, 0, 1);
                    const maxDate = new Date(
                      new Date().getFullYear() + 10,
                      11,
                      31
                    );
                    return date < minDate || date > maxDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateChange('endDate', date)}
                  initialFocus
                  fromYear={1960}
                  toYear={new Date().getFullYear() + 10}
                  captionLayout="dropdown-buttons"
                  disabled={(date) => {
                    const minDate = new Date(1960, 0, 1);
                    const maxDate = new Date(
                      new Date().getFullYear() + 10,
                      11,
                      31
                    );
                    return date < minDate || date > maxDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filterBy">Filter Type</Label>
            <Select
              value={filters.filterBy}
              onValueChange={handleFilterByChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2">
            <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(7)}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(30)}
          >
            Last 30 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(90)}
          >
            Last 90 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(365)}
          >
            Last year
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
};
