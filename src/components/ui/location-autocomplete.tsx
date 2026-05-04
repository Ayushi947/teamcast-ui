'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ICombinedLocation,
  ILocationNamesApiRequest,
  ILocationListResponse,
  logger,
} from '@/lib/shared';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';

interface LocationAutocompleteProps {
  value?: string | string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  allowMultiple?: boolean;
  maxSelections?: number;
  getLocationNames?: (
    params?: ILocationNamesApiRequest
  ) => Promise<ILocationListResponse<ICombinedLocation>>;
}

export function LocationAutocomplete({
  value = '',
  onValueChange,
  placeholder = 'Select location...',
  disabled = false,
  className,
  error,
  allowMultiple = false,
  maxSelections = 5,
  getLocationNames,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<ICombinedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Update selectedLocations when value prop changes
  useEffect(() => {
    if (allowMultiple && value) {
      // Handle both string and array inputs
      const locations =
        typeof value === 'string'
          ? value
              .split(' | ')
              .map((loc) => loc.trim())
              .filter(Boolean)
          : Array.isArray(value)
            ? value.filter(Boolean)
            : [];
      setSelectedLocations(locations);
    } else if (value && !allowMultiple) {
      setSelectedLocations([
        typeof value === 'string' ? value : value[0] || '',
      ]);
    } else {
      setSelectedLocations([]);
    }
  }, [value, allowMultiple]);

  // Add abort controller ref for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Google Places API for location search
  const getLocationNamesLocal = async (
    params?: ILocationNamesApiRequest
  ): Promise<ILocationListResponse<ICombinedLocation>> => {
    const search = params?.search || '';

    if (!search || search.length < 2) {
      return { items: [], total: 0, limit: 20, offset: 0 };
    }

    try {
      // Use our API route to avoid CORS issues
      const response = await axios.get('/api/google-places/autocomplete', {
        params: {
          input: search,
          types: 'geocode',
          language: 'en',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      // Transform the response to match our expected format
      const items: ICombinedLocation[] = (data.predictions || []).map(
        (prediction: any) => ({
          id: prediction.place_id,
          name: prediction.description,
        })
      );

      return {
        items: items.slice(0, 20),
        total: items.length,
        limit: 20,
        offset: 0,
      };
    } catch (error: any) {
      logger.error('Error fetching locations', error);

      // Handle API route errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // Handle network errors
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error: Unable to connect to the server.');
      }

      // Handle HTTP errors
      if (error.response?.status) {
        throw new Error(`Server error: ${error.response.status}`);
      }

      throw new Error(
        'Failed to fetch location suggestions. Please try again.'
      );
    }
  };

  const fetchLocations = useCallback(
    async (search: string) => {
      if (!search.trim() || search.length < 2) {
        setLocations([]);
        setLoading(false);
        setApiError(null);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setLoading(true);
        setApiError(null);

        // Use the injected prop or the local implementation
        const response = await (getLocationNames || getLocationNamesLocal)({
          search: search.trim(),
        });

        // Check if request was aborted
        if (signal.aborted) {
          return;
        }

        setLocations(response?.items || []);
      } catch (error: any) {
        // Don't set error state if request was aborted
        if (signal.aborted || error.name === 'AbortError') {
          return;
        }

        logger.error('Error fetching locations:', error);
        setLocations([]);
        setApiError(
          error.message || 'Failed to fetch locations. Please try again.'
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [getLocationNames]
  );

  useEffect(() => {
    fetchLocations(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchLocations]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSelect = (location: string) => {
    try {
      if (allowMultiple) {
        const isAlreadySelected = selectedLocations.includes(location);
        let newSelections: string[];

        if (isAlreadySelected) {
          // Remove from selection
          newSelections = selectedLocations.filter((l) => l !== location);
        } else {
          // Add to selection if under limit
          if (selectedLocations.length < maxSelections) {
            newSelections = [...selectedLocations, location];
          } else {
            return;
          }
        }

        setSelectedLocations(newSelections);
        // For multiple selections, join with a special separator that won't be confused with location commas
        onValueChange(newSelections.join(' | '));
      } else {
        // Single selection
        setSelectedLocations([location]);
        onValueChange(location);

        // Close dropdown for single selection
        setOpen(false);
      }

      // Clear search when item is selected
      setSearchTerm('');
    } catch (error) {
      logger.error('Error in handleSelect:', error);
    }
  };

  const removeLocation = (locationToRemove: string) => {
    const newSelections = selectedLocations.filter(
      (l) => l !== locationToRemove
    );
    setSelectedLocations(newSelections);
    onValueChange(newSelections.join(' | '));
  };

  const displayValue = allowMultiple
    ? selectedLocations.length > 0
      ? `${selectedLocations.length} location${selectedLocations.length > 1 ? 's' : ''} selected`
      : placeholder
    : selectedLocations[0] || placeholder;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between text-left font-normal',
              !selectedLocations.length && 'text-muted-foreground',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            disabled={disabled}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate">{displayValue}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="max-h-[300px] w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <div className="flex flex-col">
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="placeholder:text-muted-foreground flex h-8 w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Results */}
            <div className="max-h-[200px] overflow-y-auto">
              {loading && (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching locations...
                  </div>
                </div>
              )}

              {apiError && (
                <div className="p-4 text-center text-sm">
                  <div className="mb-2 font-medium text-red-500">
                    Google Places API Error
                  </div>
                  <div className="text-xs text-red-400">{apiError}</div>
                </div>
              )}

              {!loading &&
                !apiError &&
                searchTerm.length >= 2 &&
                locations.length === 0 && (
                  <div className="text-muted-foreground p-4 text-center text-sm">
                    No locations found.
                  </div>
                )}

              {!loading && !apiError && searchTerm.length < 2 && (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  Type at least 2 characters to search...
                </div>
              )}

              {!loading && !apiError && locations.length > 0 && (
                <div className="py-1">
                  {locations.slice(0, 20).map((location) => (
                    <div
                      key={location.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(location.name);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          selectedLocations.includes(location.name)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{location.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Multiple selection display */}
      {allowMultiple && selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLocations.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="gap-1 py-1 pr-1 pl-2 text-xs"
            >
              <span className="max-w-[150px] truncate">{location}</span>
              <button
                type="button"
                onClick={() => removeLocation(location)}
                className="hover:bg-muted-foreground/20 focus:ring-muted-foreground ml-1 rounded-full p-0.5 focus:ring-1 focus:outline-none"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
