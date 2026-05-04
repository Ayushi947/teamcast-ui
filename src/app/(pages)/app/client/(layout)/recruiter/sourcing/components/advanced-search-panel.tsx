'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Code2,
  Parentheses,
} from 'lucide-react';

// Search operators enum
enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

enum ComparisonOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
}

interface SearchFilter {
  id: string;
  field: string;
  comparisonOperator: ComparisonOperator;
  value: string;
  logicalOperator?: LogicalOperator;
  groupStart?: boolean;
  groupEnd?: boolean;
  type: 'text' | 'select' | 'boolean' | 'date' | 'number';
}

interface AdvancedSearchState {
  filters: SearchFilter[];
  globalOperator: LogicalOperator;
  booleanMode: boolean;
  queryString: string;
}

interface AdvancedSearchPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onSearch: (searchState: AdvancedSearchState) => void;
}

const FIELD_OPTIONS = [
  { value: 'title', label: 'Job Title', type: 'text' },
  { value: 'description', label: 'Description', type: 'text' },
  { value: 'department', label: 'Department', type: 'text' },
  { value: 'location', label: 'Location', type: 'text' },
  { value: 'skills', label: 'Required Skills', type: 'text' },
  { value: 'experience', label: 'Experience Level', type: 'number' },
  { value: 'salary', label: 'Salary Range', type: 'number' },
  { value: 'employment_type', label: 'Employment Type', type: 'select' },
  { value: 'remote', label: 'Remote Work', type: 'boolean' },
];

const getComparisonOperators = (fieldType: string) => {
  switch (fieldType) {
    case 'number':
      return [
        { value: ComparisonOperator.EQUALS, label: 'equals (=)' },
        { value: ComparisonOperator.NOT_EQUALS, label: 'not equals (!=)' },
        { value: ComparisonOperator.GREATER_THAN, label: 'greater than (>)' },
        { value: ComparisonOperator.LESS_THAN, label: 'less than (<)' },
        {
          value: ComparisonOperator.GREATER_EQUAL,
          label: 'greater or equal (>=)',
        },
        { value: ComparisonOperator.LESS_EQUAL, label: 'less or equal (<=)' },
      ];
    case 'text':
    default:
      return [
        { value: ComparisonOperator.EQUALS, label: 'equals (=)' },
        { value: ComparisonOperator.NOT_EQUALS, label: 'not equals (!=)' },
        { value: ComparisonOperator.CONTAINS, label: 'contains' },
        { value: ComparisonOperator.STARTS_WITH, label: 'starts with' },
      ];
  }
};

export function AdvancedSearchPanel({
  isVisible,
  onToggle,
  onSearch,
}: AdvancedSearchPanelProps) {
  const [searchState, setSearchState] = useState<AdvancedSearchState>({
    filters: [],
    globalOperator: LogicalOperator.AND,
    booleanMode: false,
    queryString: '',
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addSearchFilter = () => {
    const newFilter: SearchFilter = {
      id: generateId(),
      field: 'title',
      comparisonOperator: ComparisonOperator.CONTAINS,
      value: '',
      type: 'text',
      ...(searchState.booleanMode &&
        searchState.filters.length > 0 && {
          logicalOperator: LogicalOperator.AND,
        }),
    };

    setSearchState((prev) => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const removeSearchFilter = (id: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: prev.filters.filter((filter) => filter.id !== id),
    }));
  };

  const updateSearchFilter = (id: string, updates: Partial<SearchFilter>) => {
    setSearchState((prev) => ({
      ...prev,
      filters: prev.filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const addGrouping = (id: string, type: 'start' | 'end') => {
    updateSearchFilter(id, {
      [type === 'start' ? 'groupStart' : 'groupEnd']: true,
    });
  };

  const removeGrouping = (id: string, type: 'start' | 'end') => {
    updateSearchFilter(id, {
      [type === 'start' ? 'groupStart' : 'groupEnd']: false,
    });
  };

  const generateQueryString = () => {
    if (searchState.filters.length === 0) return '';

    let query = '';
    searchState.filters.forEach((filter, index) => {
      if (filter.groupStart) query += '(';

      if (index > 0 && filter.logicalOperator) {
        query += ` ${filter.logicalOperator} `;
      }

      const fieldQuery = `${filter.field}${filter.comparisonOperator}${
        filter.value.includes(' ') ? `"${filter.value}"` : filter.value
      }`;
      query += fieldQuery;

      if (filter.groupEnd) query += ')';
    });

    return query;
  };

  const clearAllFilters = () => {
    setSearchState({
      filters: [],
      globalOperator: LogicalOperator.AND,
      booleanMode: false,
      queryString: '',
    });
  };

  const handleApplySearch = () => {
    const queryString = generateQueryString();
    const updatedState = { ...searchState, queryString };
    setSearchState(updatedState);
    onSearch(updatedState);
  };

  const toggleBooleanMode = (enabled: boolean) => {
    setSearchState((prev) => ({
      ...prev,
      booleanMode: enabled,
      filters: enabled
        ? prev.filters.map((filter, index) => ({
            ...filter,
            ...(index > 0 &&
              !filter.logicalOperator && {
                logicalOperator: LogicalOperator.AND,
              }),
          }))
        : prev.filters.map((filter) => {
            const { logicalOperator, groupStart, groupEnd, ...rest } = filter;
            return rest;
          }),
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
      <CardHeader className="border-b bg-gray-50/70 px-4 py-3 dark:bg-gray-800/70">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Advanced Search
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden text-xs md:flex">
              {searchState.filters.length}{' '}
              {searchState.filters.length === 1 ? 'filter' : 'filters'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-white p-4 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-12">
          {/* Mode switch */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3 md:col-span-12 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Boolean Search Mode
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Create complex search queries with logical operators
              </span>
            </div>
            <Switch
              checked={searchState.booleanMode}
              onCheckedChange={toggleBooleanMode}
            />
          </div>

          {/* Simple mode operators */}
          {!searchState.booleanMode && searchState.filters.length > 1 && (
            <div className="md:col-span-12">
              <div className="mb-2 flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Match Type
                </Label>
                <div className="flex rounded-md border border-gray-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    className={`px-3 py-1.5 font-medium ${
                      searchState.globalOperator === LogicalOperator.AND
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() =>
                      setSearchState((prev) => ({
                        ...prev,
                        globalOperator: LogicalOperator.AND,
                      }))
                    }
                  >
                    Match All (AND)
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 font-medium ${
                      searchState.globalOperator === LogicalOperator.OR
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() =>
                      setSearchState((prev) => ({
                        ...prev,
                        globalOperator: LogicalOperator.OR,
                      }))
                    }
                  >
                    Match Any (OR)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search filters */}
          <div className="space-y-3 md:col-span-12">
            {searchState.filters.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-center dark:border-gray-700">
                <Filter className="mb-2 h-8 w-8 text-gray-400" />
                <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  No search filters
                </h3>
                <p className="mb-3 max-w-xs text-xs text-gray-500 dark:text-gray-400">
                  Add filters to build a complex search query to find matching
                  jobs
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSearchFilter}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Filter
                </Button>
              </div>
            ) : (
              <>
                {searchState.filters.map((filter, index) => (
                  <div
                    key={filter.id}
                    className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    <div className="grid gap-3 md:grid-cols-12">
                      {/* Logical operator */}
                      {searchState.booleanMode && index > 0 && (
                        <div className="md:col-span-2">
                          <Label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Operator
                          </Label>
                          <Select
                            value={
                              filter.logicalOperator || LogicalOperator.AND
                            }
                            onValueChange={(value: LogicalOperator) =>
                              updateSearchFilter(filter.id, {
                                logicalOperator: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 border-gray-200 text-xs dark:border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={LogicalOperator.AND}
                                className="text-xs"
                              >
                                AND
                              </SelectItem>
                              <SelectItem
                                value={LogicalOperator.OR}
                                className="text-xs"
                              >
                                OR
                              </SelectItem>
                              <SelectItem
                                value={LogicalOperator.NOT}
                                className="text-xs"
                              >
                                NOT
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Field */}
                      <div
                        className={`${
                          searchState.booleanMode && index > 0
                            ? 'md:col-span-2'
                            : 'md:col-span-3'
                        }`}
                      >
                        <Label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Field
                        </Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => {
                            const fieldOption = FIELD_OPTIONS.find(
                              (option) => option.value === value
                            );
                            updateSearchFilter(filter.id, {
                              field: value,
                              type: fieldOption?.type as any,
                            });
                          }}
                        >
                          <SelectTrigger className="h-8 border-gray-200 text-xs dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-xs"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator */}
                      <div className={'md:col-span-3'}>
                        <Label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Condition
                        </Label>
                        <Select
                          value={filter.comparisonOperator}
                          onValueChange={(value: ComparisonOperator) =>
                            updateSearchFilter(filter.id, {
                              comparisonOperator: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-gray-200 text-xs dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getComparisonOperators(filter.type).map((op) => (
                              <SelectItem
                                key={op.value}
                                value={op.value}
                                className="text-xs"
                              >
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value */}
                      <div className={'md:col-span-4'}>
                        <Label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Value
                        </Label>
                        <Input
                          type={filter.type === 'number' ? 'number' : 'text'}
                          value={filter.value}
                          onChange={(e) =>
                            updateSearchFilter(filter.id, {
                              value: e.target.value,
                            })
                          }
                          className="h-8 border-gray-200 text-xs dark:border-gray-700"
                          placeholder={`Enter ${filter.field.replace('_', ' ')} value...`}
                        />
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {searchState.booleanMode && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 rounded-full ${
                                filter.groupStart
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                              }`}
                              onClick={() =>
                                filter.groupStart
                                  ? removeGrouping(filter.id, 'start')
                                  : addGrouping(filter.id, 'start')
                              }
                              title="Start Grouping"
                            >
                              <Parentheses className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          onClick={() => removeSearchFilter(filter.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSearchFilter}
                    className="h-8 text-xs"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Filter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    Clear All
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* AI Query */}
          {searchState.booleanMode && searchState.filters.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 md:col-span-12 dark:border-purple-900/50 dark:bg-purple-900/10">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  Generated Query
                </span>
              </div>
              <div className="relative">
                <div className="rounded-md bg-white p-2 font-mono text-xs dark:bg-gray-800">
                  {searchState.queryString || generateQueryString()}
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        searchState.queryString || generateQueryString()
                      )
                    }
                  >
                    <Code2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2 md:col-span-12">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySearch}
              className="h-9 bg-gradient-to-r from-blue-600 to-blue-700 text-sm shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
              size="sm"
              disabled={searchState.filters.length === 0}
            >
              <Search className="mr-2 h-4 w-4" />
              Apply Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
