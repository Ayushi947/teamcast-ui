'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  CURRENCY_CONFIGS,
  SALARY_UNITS,
  SalaryUnit,
  getAvailableUnits,
  convertToBaseValue,
  convertFromBaseValue,
  getSalaryInputPlaceholder,
  formatSalaryDisplay,
} from '@/lib/utils/currency-utils';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SalaryInputProps {
  label: string;
  currencyCode: string;
  value: number;
  onChange: (value: number) => void;
  unit: SalaryUnit;
  onUnitChange: (unit: SalaryUnit) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showTooltip?: boolean;
  tooltipContent?: string;
}

export function SalaryInput({
  label,
  currencyCode,
  value,
  onChange,
  unit,
  onUnitChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className,
  showTooltip = false,
  tooltipContent,
}: SalaryInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const currencyConfig = CURRENCY_CONFIGS[currencyCode];
  const availableUnits = getAvailableUnits(currencyCode);

  // Update display value when value or unit changes
  useEffect(() => {
    if (value > 0) {
      const converted = convertFromBaseValue(value, unit);
      setDisplayValue(converted.toString());
    } else {
      setDisplayValue('');
    }
  }, [value, unit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Convert to base value for parent component
    const numericValue = parseFloat(inputValue) || 0;
    const baseValue = convertToBaseValue(numericValue, unit);
    onChange(baseValue);
  };

  const handleUnitChange = (newUnit: SalaryUnit) => {
    // Convert current value to new unit
    if (value > 0) {
      const currentDisplayValue = convertFromBaseValue(value, newUnit);
      setDisplayValue(currentDisplayValue.toString());
    }
    onUnitChange(newUnit);
  };

  const getFormattedPreview = () => {
    if (!displayValue || parseFloat(displayValue) === 0) return '';
    const numericValue = parseFloat(displayValue) || 0;
    const baseValue = convertToBaseValue(numericValue, unit);
    return formatSalaryDisplay(baseValue, currencyCode, 'thousands', false);
  };

  const inputPlaceholder =
    placeholder || getSalaryInputPlaceholder(currencyCode, unit);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {showTooltip && tooltipContent && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 cursor-help text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Currency Code */}
          <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>{currencyConfig?.code || 'USD'}</span>
          </div>

          {/* Input Field */}
          <div className="flex-1">
            <Input
              type="number"
              value={displayValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={inputPlaceholder}
              disabled={disabled}
              data-tour={
                label === 'Minimum Salary'
                  ? 'min-salary-input'
                  : label === 'Maximum Salary'
                    ? 'max-salary-input'
                    : undefined
              }
              className={cn(
                'h-10 text-base',
                error &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
              step="0.01"
              min="0"
            />
          </div>

          {/* Unit Selector */}
          <Select
            value={unit}
            onValueChange={handleUnitChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((unitKey) => (
                <SelectItem key={unitKey} value={unitKey}>
                  {SALARY_UNITS[unitKey].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview of actual value */}
        {!isFocused && displayValue && parseFloat(displayValue) > 0 && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Actual value: {getFormattedPreview()}
          </div>
        )}
      </div>

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}

interface SalaryRangeInputProps {
  currencyCode: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  unit: SalaryUnit;
  onUnitChange: (unit: SalaryUnit) => void;
  minError?: string;
  maxError?: string;
  disabled?: boolean;
  className?: string;
}

export function SalaryRangeInput({
  currencyCode,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
  onUnitChange,
  minError,
  maxError,
  disabled = false,
  className,
}: SalaryRangeInputProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SalaryInput
          label="Minimum Salary"
          currencyCode={currencyCode}
          value={minValue}
          onChange={onMinChange}
          unit={unit}
          onUnitChange={onUnitChange}
          error={minError}
          required
          disabled={disabled}
          showTooltip
          tooltipContent="Enter the minimum salary for this position. This will be the lower bound of your salary range."
        />

        <SalaryInput
          label="Maximum Salary"
          currencyCode={currencyCode}
          value={maxValue}
          onChange={onMaxChange}
          unit={unit}
          onUnitChange={onUnitChange}
          error={maxError}
          required
          disabled={disabled}
          showTooltip
          tooltipContent="Enter the maximum salary for this position. This should be higher than the minimum salary."
        />
      </div>

      {/* Display range preview */}
      {minValue > 0 && maxValue > 0 && (
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Salary Range:
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatSalaryDisplay(minValue, currencyCode, 'units', true)} -{' '}
            {formatSalaryDisplay(maxValue, currencyCode, 'units', true)}
          </div>
        </div>
      )}
    </div>
  );
}
