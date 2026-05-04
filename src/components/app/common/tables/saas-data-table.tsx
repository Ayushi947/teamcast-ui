'use client';

import React, { useState, useEffect, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  SlidersHorizontal,
  FileDown,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Inbox,
  ChevronsUpDown,
  Calendar as CalendarIcon,
  FilterX,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types and Interfaces
export interface SaasTableColumn<T> {
  key: string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface SaasTableAction<T> {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: T, index: number) => void;
  variant?: 'default' | 'destructive';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

export interface SaasTableFilter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'search' | 'date' | 'daterange';
  options?: { label: string; value: string; count?: number }[];
  value: string | string[] | Date | [Date, Date] | null;
  onChange: (value: string | string[] | Date | [Date, Date] | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SaasPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
  onSortChange?: (field: string | null, order: 'asc' | 'desc' | null) => void;
}

export interface SaasDataTableProps<T> {
  // Core data
  data: T[];
  columns: SaasTableColumn<T>[];
  getRowKey: (item: T, index: number) => string | number;

  // Loading and states
  isLoading?: boolean;
  error?: string | null;

  // Table configuration
  title?: string;
  description?: string;
  variant?: 'default' | 'compact';

  // Search functionality
  searchable?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchDebounceMs?: number;
  advancedSearch?: boolean;

  // Filtering
  filters?: SaasTableFilter[];
  quickFilters?: { label: string; value: string; count?: number }[];
  onQuickFilter?: (value: string) => void;
  activeQuickFilter?: string;

  // Actions
  actions?: SaasTableAction<T>[];
  bulkActions?: SaasTableAction<T[]>[];

  // Selection
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  // Row interaction
  onRowClick?: (item: T, index: number) => void;

  // Pagination
  pagination?: SaasPaginationInfo;

  // Toolbar actions
  onRefresh?: () => void;
  onExport?: () => void;
  onCreate?: () => void;

  // Empty state
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  // Styling
  className?: string;
  containerClassName?: string;

  // Toolbar customization
  showToolbar?: boolean;
  toolbarProps?: {
    refreshButtonPosition?: 'toolbar' | 'title';
  };
}

// Default empty state configuration
const DEFAULT_EMPTY_STATE = {
  icon: <Inbox className="text-muted-foreground/50 h-12 w-12" />,
  title: 'No data found',
  description: 'There are no items to display at the moment.',
};

// Enhanced Multi-Select Filter Component
const MultiSelectFilter = memo(function MultiSelectFilter({
  filter,
}: {
  filter: SaasTableFilter;
}) {
  // Ensure we're working with string arrays for multiselect
  const selectedValues =
    Array.isArray(filter.value) && filter.type === 'multiselect'
      ? (filter.value as string[]).filter(
          (v): v is string => typeof v === 'string'
        )
      : [];

  // Handle special case for 'ALL'
  const handleOptionClick = (option: string) => {
    let newValues: string[];

    if (option === 'ALL') {
      // If 'ALL' is already selected, deselect it, otherwise select only 'ALL'
      newValues = selectedValues.includes('ALL') ? [] : ['ALL'];
    } else {
      // For other values, remove 'ALL' if present
      const withoutAll = selectedValues.filter((v) => v !== 'ALL');

      // Toggle the selected value
      newValues = withoutAll.includes(option)
        ? withoutAll.filter((v) => v !== option)
        : [...withoutAll, option];
    }

    filter.onChange(newValues);
  };

  const clearAll = () => {
    filter.onChange([]);
  };

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="h-9 w-full justify-between"
          >
            <div className="flex items-center gap-2">
              {filter.icon}
              <span className="truncate">
                {selectedValues.length === 0
                  ? filter.placeholder || 'Select options...'
                  : selectedValues.length === 1
                    ? filter.options?.find(
                        (opt) => opt.value === selectedValues[0]
                      )?.label
                    : `${selectedValues.length} selected`}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          {selectedValues.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="mb-2 w-full justify-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
              <Separator className="my-1" />
            </>
          )}
          <div className="max-h-[200px] overflow-auto">
            {filter.options?.map((option) => (
              <div
                key={option.value}
                className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-sm p-2"
                onClick={() => handleOptionClick(option.value)}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    className="mr-2"
                    onCheckedChange={() => {}}
                  />
                  <span>{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {option.count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

// Enhanced Date Filter Component
const DateFilter = memo(function DateFilter({
  filter,
}: {
  filter: SaasTableFilter;
}) {
  const [open, setOpen] = useState(false);

  if (filter.type === 'daterange') {
    const dateRange = Array.isArray(filter.value) ? filter.value : [null, null];
    const [from, to] = dateRange as [Date | null, Date | null];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'h-9 w-full justify-start text-left font-normal',
              !from && !to && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from && to
              ? `${format(from, 'MMM dd')} - ${format(to, 'MMM dd')}`
              : from
                ? `${format(from, 'MMM dd, yyyy')} - ...`
                : filter.placeholder || 'Select date range'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from || undefined}
            selected={{ from: from || undefined, to: to || undefined }}
            onSelect={(range) => {
              filter.onChange(
                range?.from && range?.to ? [range.from, range.to] : null
              );
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    );
  }

  const date = filter.value as Date | null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-9 w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? format(date, 'MMM dd, yyyy')
            : filter.placeholder || 'Select date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(selectedDate) => {
            filter.onChange(selectedDate || null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

// Enhanced Search Component
const EnhancedSearch = memo(function EnhancedSearch({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  advancedSearch,
  isLoading,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  advancedSearch?: boolean;
  isLoading?: boolean;
}) {
  const [localValue, setLocalValue] = useState(searchValue);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalValue(searchValue);
  }, [searchValue]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setLocalValue('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full flex-1">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            'focus:ring-primary/20 h-10 w-full bg-transparent pr-20 pl-9 transition-all duration-200 focus:ring-2',
            localValue && 'ring-primary/20 ring-1',
            'border-border/100'
          )}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {isLoading && (
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
          )}
          {localValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="hover:bg-muted h-7 w-7 rounded-full p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          {advancedSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                'h-7 w-7 rounded-full p-0',
                showAdvanced && 'bg-muted text-primary'
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Search Panel */}
      {showAdvanced && advancedSearch && (
        <div className="bg-card absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border shadow-lg">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Advanced Search</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(false)}
                className="h-6 w-6 rounded-full p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-3">
              <Input placeholder="Search in names..." className="h-9" />
              <Input placeholder="Search in emails..." className="h-9" />
              <Input placeholder="Search in descriptions..." className="h-9" />
            </div>
            <div className="flex justify-end gap-2 border-t pt-2">
              <Button variant="outline" size="sm">
                Clear
              </Button>
              <Button size="sm">Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Quick Filters Component
const QuickFilters = memo(function QuickFilters({
  quickFilters,
  activeQuickFilter,
  onQuickFilter,
}: {
  quickFilters: { label: string; value: string; count?: number }[];
  activeQuickFilter?: string;
  onQuickFilter: (value: string) => void;
}) {
  return (
    <div className="flex min-w-fit items-center gap-3">
      <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
        Quick filters:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeQuickFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onQuickFilter(filter.value)}
            className="h-8 gap-2 text-xs whitespace-nowrap"
          >
            {filter.label}
            {filter.count !== undefined && (
              <Badge
                variant={
                  activeQuickFilter === filter.value ? 'secondary' : 'default'
                }
                className="ml-1 h-4 px-1.5 text-xs"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
});

// Table Header Component
const SaasTableHeaderComponent = memo(function SaasTableHeader<T>({
  columns,
  actions,
  selectable,
  selectedRows,
  data,
  onSelectionChange,
  pagination,
  onSort,
}: {
  columns: SaasTableColumn<T>[];
  actions?: SaasTableAction<T>[];
  selectable?: boolean;
  selectedRows?: (string | number)[];
  data: T[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  pagination?: SaasPaginationInfo;
  onSort: (column: SaasTableColumn<T>) => void;
}) {
  const isAllSelected =
    selectable &&
    selectedRows &&
    selectedRows.length === data.length &&
    data.length > 0;
  const isIndeterminate =
    selectable &&
    selectedRows &&
    selectedRows.length > 0 &&
    selectedRows.length < data.length;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange || !selectable) return;

    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      const allIds = data.map((item, index) =>
        typeof item === 'object' && item && 'id' in item
          ? (item as any).id
          : index
      );
      onSelectionChange(allIds);
    }
  }, [isAllSelected, onSelectionChange, selectable, data]);

  return (
    <TableHeader className="dark:bg-background sticky top-0 z-20 rounded-2xl bg-[#F9F9F9]">
      <TableRow className="border-border border-b hover:bg-transparent">
        {selectable && (
          <TableHead className="w-12 py-3">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) (el as any).indeterminate = isIndeterminate;
              }}
              onCheckedChange={handleSelectAll}
              className="ml-2"
            />
          </TableHead>
        )}

        {columns.map((column, colIndex) => (
          <TableHead
            key={column.key}
            className={cn(
              'text-foreground/90 px-4 py-3 text-sm font-semibold',
              'border-t border-b border-gray-200',
              colIndex === 0 && 'rounded-l-[0.70rem] border-l border-gray-200',
              // Only round right corners if this is the last column and there are no actions
              colIndex === columns.length - 1 &&
                !actions?.length &&
                'rounded-r-[0.70rem] border-r border-gray-200',
              // If actions are present, do NOT round the last data column
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.sortable && 'cursor-pointer transition-colors select-none',
              column.className
            )}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(column)}
          >
            <div
              className={cn(
                'flex items-center gap-2',
                column.align === 'center' && 'justify-center',
                column.align === 'right' && 'justify-end'
              )}
            >
              <span>{column.label}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  {pagination?.sortBy === column.key ? (
                    pagination.sortOrder === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  ) : (
                    <div className="flex flex-col opacity-50">
                      <ChevronUp className="-mb-1 h-3 w-3" />
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TableHead>
        ))}

        {actions && actions.length > 0 && (
          <TableHead className="text-foreground/90 w-16 rounded-r-[0.70rem] border-t border-r border-b border-gray-200 py-3 text-right text-sm font-semibold">
            Actions
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
});

// Table Row Component
const SaasTableRowComponent = memo(function SaasTableRow<T>({
  item,
  index,
  columns,
  actions,
  selectable,
  selectedRows,
  onSelectionChange,
  getRowKey,
  onRowClick,
  rowClassName,
}: {
  item: T;
  index: number;
  columns: SaasTableColumn<T>[];
  actions?: SaasTableAction<T>[];
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  getRowKey: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string;
}) {
  const rowKey = getRowKey(item, index);
  const isSelected = selectedRows?.includes(rowKey) || false;

  const handleRowSelect = useCallback(() => {
    if (!onSelectionChange || !selectable) return;

    const newSelection = isSelected
      ? selectedRows?.filter((id) => id !== rowKey) || []
      : [...(selectedRows || []), rowKey];

    onSelectionChange(newSelection);
  }, [isSelected, onSelectionChange, selectable, selectedRows, rowKey]);

  const handleRowClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const isClickableElement = target.closest(
        'button, a, [role="button"], input, select, textarea, [data-radix-collection-item]'
      );

      if (!isClickableElement && onRowClick) {
        onRowClick(item, index);
      }
    },
    [item, index, onRowClick]
  );

  const visibleActions =
    actions?.filter((action) => !action.hidden?.(item)) || [];

  return (
    <TableRow
      className={cn(
        'border-border/50 hover:bg-muted/30 border-b transition-colors',
        isSelected && 'bg-muted/50',
        onRowClick && 'cursor-pointer',
        rowClassName
      )}
      onClick={handleRowClick}
    >
      {selectable && (
        <TableCell className="px-4 py-3">
          <Checkbox checked={isSelected} onCheckedChange={handleRowSelect} />
        </TableCell>
      )}

      {columns.map((column, colIndex) => (
        <TableCell
          key={column.key}
          className={cn(
            'px-4 py-3 text-sm',
            'border-t border-b border-gray-200',
            colIndex === 0 && 'rounded-l-[0.70rem] border-l border-gray-200',
            // Only round right corners if this is the last column and there are no actions
            colIndex === columns.length - 1 &&
              !actions?.length &&
              'rounded-r-[0.70rem] border-r border-gray-200',
            // If actions are present, do NOT round the last data column
            column.align === 'center' && 'text-center',
            column.align === 'right' && 'text-right',
            column.className
          )}
          style={{
            width: column.width,
            padding: '1rem',
            borderRadius: '0.rem',
          }}
        >
          {column.render ? (
            column.render(item, index)
          ) : (
            <span className="text-foreground/80">
              {String((item as any)[column.key] || '-')}
            </span>
          )}
        </TableCell>
      ))}

      {actions && actions.length > 0 && (
        <TableCell
          className={cn(
            'px-4 py-3 text-right',
            'border-t border-r border-b border-gray-200',
            'rounded-r-[0.70rem]'
          )}
        >
          {visibleActions.length === 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => visibleActions[0].onClick(item, index)}
              disabled={visibleActions[0].disabled?.(item)}
              className={cn(
                'h-8',
                visibleActions[0].variant === 'destructive' &&
                  'text-destructive border-destructive/50 hover:bg-destructive/10'
              )}
            >
              {visibleActions[0].icon}
              <span className="ml-2">{visibleActions[0].label}</span>
            </Button>
          )}

          {visibleActions.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {visibleActions.map((action, actionIndex) => (
                  <React.Fragment key={action.key}>
                    <DropdownMenuItem
                      onClick={() => action.onClick(item, index)}
                      disabled={action.disabled?.(item)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2',
                        action.variant === 'destructive' &&
                          'text-destructive focus:text-destructive'
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                    {actionIndex < visibleActions.length - 1 &&
                      visibleActions[actionIndex + 1]?.variant ===
                        'destructive' &&
                      action.variant !== 'destructive' && (
                        <DropdownMenuSeparator />
                      )}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      )}
    </TableRow>
  );
});

// Loading Skeleton Component
const LoadingSkeleton = memo(function LoadingSkeleton({
  columns,
  actions,
  selectable,
  rows = 5,
}: {
  columns: SaasTableColumn<any>[];
  actions?: SaasTableAction<any>[];
  selectable?: boolean;
  rows?: number;
}) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-border/50 border-b">
          {selectable && (
            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-4 rounded" />
            </TableCell>
          )}
          {columns.map((column) => (
            <TableCell key={column.key} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-[200px]" />
            </TableCell>
          ))}
          {actions && actions.length > 0 && (
            <TableCell className="px-4 py-3 text-right">
              <Skeleton className="ml-auto h-8 w-8 rounded" />
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  );
});

// Empty State Component
const EmptyState = memo(function EmptyState({
  emptyState = DEFAULT_EMPTY_STATE,
}: {
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-4">{emptyState.icon}</div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        {emptyState.title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
        {emptyState.description}
      </p>
      {emptyState.action && (
        <Button onClick={emptyState.action.onClick} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          {emptyState.action.label}
        </Button>
      )}
    </div>
  );
});

// Enhanced Toolbar Component
const TableToolbar = memo(function TableToolbar<T>({
  title,
  description,
  searchable,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  advancedSearch,
  filters,
  quickFilters,
  onQuickFilter,
  activeQuickFilter,
  selectedRows,
  bulkActions,
  onRefresh,
  onExport,
  onCreate,
  isLoading,
  toolbarProps,
}: {
  title?: string;
  description?: string;
  searchable?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  advancedSearch?: boolean;
  filters?: SaasTableFilter[];
  quickFilters?: { label: string; value: string; count?: number }[];
  onQuickFilter?: (value: string) => void;
  activeQuickFilter?: string;
  selectedRows?: (string | number)[];
  bulkActions?: SaasTableAction<T[]>[];
  onRefresh?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  isLoading?: boolean;
  toolbarProps?: {
    refreshButtonPosition?: 'toolbar' | 'title';
  };
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh with immediate visual feedback
  const handleRefresh = useCallback(() => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    onRefresh();
  }, [onRefresh]);

  // Reset refreshing state when loading completes
  useEffect(() => {
    if (isRefreshing && !isLoading) {
      const timer = setTimeout(() => {
        setIsRefreshing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, isLoading]);

  const isRefreshSpinning = isRefreshing || isLoading;

  const hasActiveFilters = filters?.some((filter) =>
    Array.isArray(filter.value)
      ? filter.value.length > 0 &&
        !(filter.value.length === 1 && filter.value[0] === 'ALL')
      : filter.value !== '' && filter.value !== null
  );

  const clearAllFilters = () => {
    filters?.forEach((filter) => {
      if (filter.type === 'multiselect') {
        filter.onChange([]);
      } else {
        filter.onChange('');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      {(title || description) && (
        <div className="flex items-center justify-between space-y-1">
          <div>
            {title && (
              <h1 className="text-primary text-2xl font-bold">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {onRefresh && toolbarProps?.refreshButtonPosition === 'title' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshSpinning}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw
                      className={cn(
                        'h-4 w-4',
                        isRefreshSpinning && 'animate-spin'
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Main Toolbar */}
      <div className="dark:bg-background flex flex-col gap-4 rounded-lg bg-white p-4 shadow lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section - Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
          {/* Enhanced Search */}
          {searchable && onSearchChange && (
            <div className="max-w-9xl flex-1">
              <EnhancedSearch
                searchValue={searchValue || ''}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder || 'Search...'}
                advancedSearch={advancedSearch}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Filters Toggle */}
          {filters && filters.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'h-10 gap-2 bg-transparent',
                  hasActiveFilters && 'border-primary text-primary',
                  showFilters && 'bg-muted'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {
                      filters.filter((f) =>
                        Array.isArray(f.value)
                          ? f.value.length > 0
                          : f.value !== '' && f.value !== null
                      ).length
                    }
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground h-10 gap-2"
                >
                  <FilterX className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Bulk Actions */}
          {selectedRows && selectedRows.length > 0 && bulkActions && (
            <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2">
              <span className="text-muted-foreground text-sm font-medium">
                {selectedRows.length} selected
              </span>
              <div className="flex items-center gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.key}
                    variant={
                      action.variant === 'destructive'
                        ? 'destructive'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => action.onClick(selectedRows as T[], 0)}
                    className="h-8 gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Standard Actions */}
          <div className="flex items-center gap-2">
            {onRefresh &&
              (!toolbarProps?.refreshButtonPosition ||
                toolbarProps?.refreshButtonPosition === 'toolbar') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshSpinning}
                        className="h-10 w-10 p-0"
                      >
                        <RefreshCw
                          className={cn(
                            'h-4 w-4',
                            isRefreshSpinning && 'animate-spin'
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

            {onExport && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExport}
                      className="h-10 w-10 p-0"
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onCreate && (
              <Button onClick={onCreate} size="sm" className="h-10 gap-2 px-4">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      {quickFilters && quickFilters.length > 0 && onQuickFilter && (
        <div className="overflow-x-auto">
          <QuickFilters
            quickFilters={quickFilters}
            activeQuickFilter={activeQuickFilter}
            onQuickFilter={onQuickFilter}
          />
        </div>
      )}

      {/* Enhanced Filters Panel */}
      {showFilters && filters && filters.length > 0 && (
        <div className="bg-muted/30 animate-in slide-in-from-top-2 rounded-lg border p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-sm font-semibold">
                Filter Options
              </h3>
              <p className="text-muted-foreground text-xs">
                Refine your search with advanced filters
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                    {filter.icon}
                    {filter.label}
                  </label>
                  {filter.description && (
                    <p className="text-muted-foreground text-xs">
                      {filter.description}
                    </p>
                  )}
                </div>

                {filter.type === 'select' && (
                  <Select
                    value={filter.value as string}
                    onValueChange={(value) => filter.onChange(value)}
                  >
                    <SelectTrigger className="h-9 border border-gray-300 bg-transparent">
                      <SelectValue
                        placeholder={filter.placeholder || 'Select...'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex w-full items-center justify-between">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filter.type === 'multiselect' && (
                  <MultiSelectFilter filter={filter} />
                )}

                {filter.type === 'search' && (
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                      placeholder={filter.placeholder || 'Search...'}
                      value={filter.value as string}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="h-9 border border-gray-300 bg-transparent pl-9"
                    />
                  </div>
                )}

                {(filter.type === 'date' || filter.type === 'daterange') && (
                  <DateFilter filter={filter} />
                )}
              </div>
            ))}
          </div>

          {hasActiveFilters && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                {
                  filters.filter((f) =>
                    Array.isArray(f.value)
                      ? f.value.length > 0
                      : f.value !== '' && f.value !== null
                  ).length
                }{' '}
                active filter(s)
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <FilterX className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Pagination Component
const TablePagination = memo(function TablePagination({
  pagination,
}: {
  pagination: SaasPaginationInfo;
}) {
  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
  } = pagination;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Results info */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>
          Showing {startItem?.toLocaleString()} to {endItem?.toLocaleString()}{' '}
          of {totalItems?.toLocaleString()} results
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-16 border border-gray-300 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === 'ellipsis' ? (
                <span className="text-muted-foreground px-2">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
});

// Main SaaS Data Table Component
export default function SaasDataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  error = null,
  title,
  description,
  variant = 'default',
  searchable = false,
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  advancedSearch = false,
  filters,
  quickFilters,
  onQuickFilter,
  activeQuickFilter,
  actions,
  bulkActions,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  pagination,
  onRefresh,
  onExport,
  onCreate,
  emptyState,
  className,
  containerClassName,
  showToolbar = true,
  toolbarProps,
}: SaasDataTableProps<T>) {
  // Sort handling - cycles through: none -> asc -> desc -> none
  const handleSort = useCallback(
    (column: SaasTableColumn<T>) => {
      if (!column.sortable || !pagination?.onSortChange) return;

      const isCurrentColumn = pagination.sortBy === column.key;

      let newOrder: 'asc' | 'desc' | null;
      let newField: string | null;

      if (!isCurrentColumn) {
        // Different column: start with asc
        newField = column.key;
        newOrder = 'asc';
      } else if (pagination.sortOrder === 'asc') {
        // Same column, currently asc: switch to desc
        newField = column.key;
        newOrder = 'desc';
      } else if (pagination.sortOrder === 'desc') {
        // Same column, currently desc: clear sort
        newField = null;
        newOrder = null;
      } else {
        // No current sort: start with asc
        newField = column.key;
        newOrder = 'asc';
      }

      pagination.onSortChange(newField, newOrder);
    },
    [pagination]
  );

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-4', containerClassName)}>
        {showToolbar && (
          <TableToolbar
            title={title}
            description={description}
            searchable={searchable}
            searchValue={searchValue}
            searchPlaceholder={searchPlaceholder}
            onSearchChange={onSearchChange}
            advancedSearch={advancedSearch}
            filters={filters}
            quickFilters={quickFilters}
            onQuickFilter={onQuickFilter}
            activeQuickFilter={activeQuickFilter}
            selectedRows={selectedRows}
            bulkActions={bulkActions as any}
            onRefresh={onRefresh}
            onExport={onExport}
            onCreate={onCreate}
            isLoading={isLoading}
            toolbarProps={toolbarProps}
          />
        )}

        <div className="bg-card rounded-lg border">
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <AlertCircle className="text-destructive mb-4 h-12 w-12" />
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Something went wrong
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
              {error}
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', containerClassName)}>
      {showToolbar && (
        <TableToolbar
          title={title}
          description={description}
          searchable={searchable}
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
          advancedSearch={advancedSearch}
          filters={filters}
          quickFilters={quickFilters}
          onQuickFilter={onQuickFilter}
          activeQuickFilter={activeQuickFilter}
          selectedRows={selectedRows}
          bulkActions={bulkActions as any}
          onRefresh={onRefresh}
          onExport={onExport}
          onCreate={onCreate}
          isLoading={isLoading}
          toolbarProps={toolbarProps}
        />
      )}

      <div
        className={cn(
          'max-h-auto w-full overflow-hidden',
          variant === 'compact' && 'text-sm',
          className
        )}
      >
        <div className="relative">
          <Table className="border-separate border-spacing-y-2">
            <SaasTableHeaderComponent
              columns={columns as any}
              actions={actions as any}
              selectable={selectable}
              selectedRows={selectedRows}
              data={data}
              onSelectionChange={onSelectionChange}
              pagination={pagination}
              onSort={handleSort}
            />

            {isLoading ? (
              <LoadingSkeleton
                columns={columns}
                actions={actions}
                selectable={selectable}
                rows={pagination?.pageSize || 10}
              />
            ) : data?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                    }
                    className="p-0"
                  >
                    <EmptyState emptyState={emptyState} />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody className="bg-card">
                {data?.map((item, index) => (
                  <SaasTableRowComponent
                    key={getRowKey(item, index)}
                    item={item as any}
                    index={index}
                    columns={columns as any}
                    actions={actions as any}
                    selectable={selectable}
                    selectedRows={selectedRows}
                    onSelectionChange={onSelectionChange}
                    getRowKey={getRowKey as any}
                    onRowClick={onRowClick as any}
                    rowClassName="py-4"
                  />
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </div>

      {pagination && <TablePagination pagination={pagination} />}
    </div>
  );
}

// Export utility functions for common column renderers
export const columnRenderers = {
  badge: (
    value: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
  ) => (
    <Badge variant={variant} className="font-medium">
      {value}
    </Badge>
  ),

  status: (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle2 },
      inactive: { variant: 'secondary' as const, icon: Clock },
      pending: { variant: 'outline' as const, icon: Clock },
      error: { variant: 'destructive' as const, icon: AlertCircle },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1 font-medium">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  },

  currency: (amount: number, currency = 'USD') => (
    <span className="text-right font-medium tabular-nums">
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount)}
    </span>
  ),

  date: (date: string | Date) => (
    <span className="tabular-nums">
      {new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(date))}
    </span>
  ),

  truncateText: (text: string, maxLength = 50) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
          </span>
        </TooltipTrigger>
        {text.length > maxLength && (
          <TooltipContent>
            <p className="max-w-xs">{text}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  ),
};

// Export common actions
export const commonActions = {
  view: <Eye className="h-4 w-4" />,
  edit: <Edit2 className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
};
