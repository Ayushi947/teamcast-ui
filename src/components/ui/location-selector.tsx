'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from 'country-state-city';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MapPin, Search } from 'lucide-react';

interface LocationSelectorProps {
  country?: string;
  state?: string;
  city?: string;
  onLocationChange: (location: {
    country: string;
    state: string;
    city: string;
    countryCode: string;
    stateCode: string;
  }) => void;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
  required?: boolean;
  errors?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export function LocationSelector({
  country = '',
  state = '',
  city = '',
  onLocationChange,
  disabled = false,
  className,
  showLabels = true,
  required = false,
  errors,
}: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

  // Search states for filtering
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Get all countries
  const countries = useMemo(() => Country.getAllCountries(), []);

  // Get states for selected country
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);

  // Get cities for selected state
  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode
    );
  }, [selectedCountry, selectedState]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.isoCode.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  // Filter states based on search
  const filteredStates = useMemo(() => {
    if (!stateSearch) return states;
    return states.filter(
      (state) =>
        state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
        state.isoCode.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [states, stateSearch]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter((city) =>
      city.name.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch]);

  // Initialize with provided values
  useEffect(() => {
    if (country && !selectedCountry) {
      const foundCountry = countries.find(
        (c) => c.name === country || c.isoCode === country
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry);
      }
    }
  }, [country, countries, selectedCountry]);

  useEffect(() => {
    if (state && selectedCountry && !selectedState) {
      const foundState = State.getStatesOfCountry(selectedCountry.isoCode).find(
        (s) => s.name === state || s.isoCode === state
      );
      if (foundState) {
        setSelectedState(foundState);
      }
    }
  }, [state, selectedCountry, selectedState]);

  useEffect(() => {
    if (city && selectedCountry && selectedState && !selectedCity) {
      const foundCity = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      ).find((c) => c.name === city);
      if (foundCity) {
        setSelectedCity(foundCity);
      }
    }
  }, [city, selectedCountry, selectedState, selectedCity]);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.isoCode === countryCode);
    if (country) {
      setSelectedCountry(country);
      setSelectedState(null);
      setSelectedCity(null);
      setCountrySearch('');
      setStateSearch('');
      setCitySearch('');
      onLocationChange({
        country: country.name,
        state: '',
        city: '',
        countryCode: country.isoCode,
        stateCode: '',
      });
    }
  };

  const handleStateChange = (stateCode: string) => {
    const state = states.find((s) => s.isoCode === stateCode);
    if (state && selectedCountry) {
      setSelectedState(state);
      setSelectedCity(null);
      setStateSearch('');
      setCitySearch('');
      onLocationChange({
        country: selectedCountry.name,
        state: state.name,
        city: '',
        countryCode: selectedCountry.isoCode,
        stateCode: state.isoCode,
      });
    }
  };

  const handleCityChange = (cityName: string) => {
    const city = cities.find((c) => c.name === cityName);
    if (city && selectedCountry && selectedState) {
      setSelectedCity(city);
      setCitySearch('');
      onLocationChange({
        country: selectedCountry.name,
        state: selectedState.name,
        city: city.name,
        countryCode: selectedCountry.isoCode,
        stateCode: selectedState.isoCode,
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {showLabels && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          Location {required && <span className="text-destructive">*</span>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Country */}
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="country" className="text-sm">
              Country {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={selectedCountry?.isoCode || ''}
            onValueChange={handleCountryChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger
              className={cn(
                errors?.country
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              )}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="placeholder:text-muted-foreground border-0 bg-transparent px-0 py-2 text-sm outline-none focus-visible:ring-0"
                  />
                </div>
              </div>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground px-2 py-1 text-sm">
                  No countries found.
                </div>
              )}
            </SelectContent>
          </Select>
          {errors?.country && (
            <p className="text-destructive text-xs">{errors.country}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="state" className="text-sm">
              State/Province{' '}
              {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={selectedState?.isoCode || ''}
            onValueChange={handleStateChange}
            disabled={disabled || !selectedCountry || states.length === 0}
            required={required}
          >
            <SelectTrigger
              className={cn(
                errors?.state
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              )}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search states..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="placeholder:text-muted-foreground border-0 bg-transparent px-0 py-2 text-sm outline-none focus-visible:ring-0"
                  />
                </div>
              </div>
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground px-2 py-1 text-sm">
                  No states found.
                </div>
              )}
            </SelectContent>
          </Select>
          {errors?.state && (
            <p className="text-destructive text-xs">{errors.state}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="city" className="text-sm">
              City {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={selectedCity?.name || ''}
            onValueChange={handleCityChange}
            disabled={disabled || !selectedState || cities.length === 0}
            required={required}
          >
            <SelectTrigger
              className={cn(
                errors?.city
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              )}
            >
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="placeholder:text-muted-foreground border-0 bg-transparent px-0 py-2 text-sm outline-none focus-visible:ring-0"
                  />
                </div>
              </div>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <SelectItem
                    key={`${city.name}-${city.latitude}-${city.longitude}`}
                    value={city.name}
                  >
                    {city.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-muted-foreground px-2 py-1 text-sm">
                  No cities found.
                </div>
              )}
            </SelectContent>
          </Select>
          {errors?.city && (
            <p className="text-destructive text-xs">{errors.city}</p>
          )}
        </div>
      </div>
    </div>
  );
}
