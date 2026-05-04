import { useState, FC } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityModuleEnum } from '@/lib/shared';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Common activity actions
const ActivityAction = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SIGNUP: 'SIGNUP',
  CREATE_PROFILE: 'CREATE_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  UPLOAD_RESUME: 'UPLOAD_RESUME',
  APPLY_JOB: 'APPLY_JOB',
  CREATE_JOB: 'CREATE_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  VIEW_CANDIDATE: 'VIEW_CANDIDATE',
  INVITE_USER: 'INVITE_USER',
  CREATE_ASSESSMENT: 'CREATE_ASSESSMENT',
  COMPLETE_ASSESSMENT: 'COMPLETE_ASSESSMENT',
};

// Local interface for activity log filters in UI
interface IActivityLogFilter {
  userId?: string;
  module?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface ActivityFiltersProps {
  onChange: (filters: IActivityLogFilter) => void;
  defaultFilters?: IActivityLogFilter;
  showModuleFilter?: boolean;
}

export const ActivityFilters: FC<ActivityFiltersProps> = ({
  onChange,
  defaultFilters = {},
  showModuleFilter = true,
}) => {
  const [filters, setFilters] = useState<IActivityLogFilter>(defaultFilters);
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultFilters.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    defaultFilters.endDate
  );

  const handleFilterChange = (
    key: keyof IActivityLogFilter,
    value: string | Date | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setStartDate(undefined);
      setEndDate(undefined);
      const newFilters = {
        ...filters,
        startDate: undefined,
        endDate: undefined,
      };
      setFilters(newFilters);
      onChange(newFilters);
      return;
    }

    setStartDate(range.from);
    setEndDate(range.to);

    const newFilters = {
      ...filters,
      startDate: range.from,
      endDate: range.to,
    };

    setFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilter = showModuleFilter
      ? {
          ...defaultFilters,
          module: defaultFilters.module ?? 'all',
          action: defaultFilters.action ?? 'all',
        }
      : { module: defaultFilters.module };
    setFilters(defaultFilter);
    setStartDate(undefined);
    setEndDate(undefined);
    onChange(defaultFilter);
  };

  // Convert enum to array for select options
  const moduleOptions = Object.values(ActivityModuleEnum);

  const actionOptions = Object.values(ActivityAction);

  const hasActiveFilters = () => {
    return (
      (filters.action && filters.action !== 'all') ||
      (showModuleFilter &&
        filters.module &&
        filters.module !== defaultFilters.module) ||
      filters.startDate ||
      filters.endDate
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Module Filter */}
        {showModuleFilter && (
          <Select
            value={filters.module || ''}
            onValueChange={(value) => handleFilterChange('module', value)}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Module</SelectLabel>
                <SelectItem value="all">All Modules</SelectItem>
                {moduleOptions.map((module) => (
                  <SelectItem
                    key={module}
                    value={module.toString().toLowerCase()}
                  >
                    {module.toString().charAt(0).toUpperCase() +
                      module.toString().slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* Action Filter */}
        <Select
          value={filters.action || ''}
          onValueChange={(value) => handleFilterChange('action', value)}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Action</SelectLabel>
              <SelectItem value="all">All Actions</SelectItem>
              {actionOptions.map((action) => (
                <SelectItem key={action} value={action.toString()}>
                  {action
                    .toString()
                    .replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 justify-start text-left font-normal',
                (startDate || endDate) && 'text-primary'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                <>
                  {format(startDate, 'MMM d')} -{' '}
                  {format(endDate, 'MMM d, yyyy')}
                </>
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: startDate,
                to: endDate,
              }}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.module && filters.module !== 'all' && showModuleFilter && (
            <Badge variant="outline" className="gap-1">
              Module:{' '}
              {filters.module.charAt(0).toUpperCase() + filters.module.slice(1)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('module', 'all')}
              />
            </Badge>
          )}
          {filters.action && filters.action !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Action:{' '}
              {filters.action
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('action', 'all')}
              />
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="outline" className="gap-1">
              Date: {startDate ? format(startDate, 'MMM d') : '...'} -{' '}
              {endDate ? format(endDate, 'MMM d, yyyy') : '...'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  handleDateChange({});
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
