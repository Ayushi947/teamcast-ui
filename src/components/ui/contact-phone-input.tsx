'use client';

import {
  type FC,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCountryByDialCode,
  validatePhoneNumber,
  isPhoneNumberLengthValid,
  formatInternationalPhone,
  parseInternationalPhone,
  searchCountries,
} from '@/lib/utils/phone-validation';

interface ContactPhoneInputProps {
  /** Phone number value in international format: +dialcode-actualnumber (e.g., "+1-5551234567") */
  value?: string;
  /** Callback when phone number changes, receives value in international format: +dialcode-actualnumber */
  onChange?: (value: string) => void;
  /** Callback when dial code/country changes */
  onDialCodeChange?: (dialCode: string, country: string) => void;
  /** Callback when validation error changes */
  onValidationError?: (error: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
  error?: string;
  required?: boolean;
}

export const ContactPhoneInput: FC<ContactPhoneInputProps> = ({
  value = '',
  onChange,
  onDialCodeChange,
  onValidationError,
  disabled = false,
  placeholder = 'Phone number',
  className,
  label = 'Contact Phone',
  showLabel = true,
  error,
  required = false,
}) => {
  const [_dialCode, setDialCode] = useState('+1');
  const [selectedDialCode, setSelectedDialCode] = useState('+1');
  const [dialCodeOpen, setDialCodeOpen] = useState(false);
  const [dialCodeSearch, setDialCodeSearch] = useState('');
  const [dialCodeError, setDialCodeError] = useState<string | null>(null);
  const [phoneLengthError, setPhoneLengthError] = useState<string | null>(null);
  const [localPhoneValue, setLocalPhoneValue] = useState('');
  const commandListRef = useRef<HTMLDivElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter countries based on search using our custom search function - memoized
  const filteredCountries = useMemo(
    () => searchCountries(dialCodeSearch),
    [dialCodeSearch]
  );

  // Scroll to top when search term changes
  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
  }, [dialCodeSearch]);

  // Validate dial code exists in countries list - memoized
  const validateDialCode = useCallback((dialCode: string) => {
    const country = getCountryByDialCode(dialCode);
    if (!country) {
      setDialCodeError('Invalid dial code. Please select a valid country.');
      return false;
    }
    setDialCodeError(null);
    return true;
  }, []);

  // Debounced validation to avoid lag
  const debouncedValidatePhoneLength = useCallback(
    (phoneNumber: string, dialCode: string) => {
      // Clear existing timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Set new timeout for validation
      validationTimeoutRef.current = setTimeout(() => {
        if (!phoneNumber || !dialCode) {
          setPhoneLengthError(null);
          if (onValidationError) {
            onValidationError(null);
          }
          return;
        }

        const result = validatePhoneNumber(dialCode, phoneNumber);

        if (!result.isValid && result.message !== 'Phone number is empty.') {
          setPhoneLengthError(result.message);
          if (onValidationError) {
            onValidationError(result.message);
          }
        } else {
          setPhoneLengthError(null);
          if (onValidationError) {
            onValidationError(null);
          }
        }
      }, 300); // 300ms debounce
    },
    [onValidationError]
  );

  // Immediate validation (for length limits only)
  const validatePhoneLength = useCallback(
    (phoneNumber: string, dialCode: string) => {
      if (!phoneNumber || !dialCode) {
        setPhoneLengthError(null);
        if (onValidationError) {
          onValidationError(null);
        }
        return true;
      }

      const result = validatePhoneNumber(dialCode, phoneNumber);

      if (!result.isValid && result.message !== 'Phone number is empty.') {
        setPhoneLengthError(result.message);
        if (onValidationError) {
          onValidationError(result.message);
        }
        return false;
      }

      setPhoneLengthError(null);
      if (onValidationError) {
        onValidationError(null);
      }
      return true;
    },
    [onValidationError]
  );

  const handleCountryChange = useCallback(
    (selectedDialCode: string) => {
      // Validate the dial code
      if (!validateDialCode(selectedDialCode)) {
        return;
      }

      const countryData = getCountryByDialCode(selectedDialCode);
      if (countryData) {
        setDialCode(selectedDialCode);
        setSelectedDialCode(selectedDialCode);

        // Parse current phone number to extract phone number without dial code
        const { phoneNumber: _phoneWithoutDialCode } = parseInternationalPhone(
          value || ''
        );

        // Format in international standard: +dialcode-actualnumber for payload
        const formattedValue = formatInternationalPhone(
          selectedDialCode,
          _phoneWithoutDialCode
        );

        if (onChange) {
          onChange(formattedValue);
        }

        if (onDialCodeChange) {
          onDialCodeChange(selectedDialCode, countryData.name);
        }

        // Validate phone length with new country
        validatePhoneLength(_phoneWithoutDialCode, selectedDialCode);

        setDialCodeOpen(false);
        setDialCodeSearch('');
      }
    },
    [value, onChange, onDialCodeChange, validateDialCode, validatePhoneLength]
  );

  const handlePhoneChange = useCallback(
    (phoneValue: string) => {
      // Clean the input value - only allow digits, spaces, hyphens, and parentheses
      const cleanValue = phoneValue.replace(/[^\d\s\-()]/g, '');

      // Check if the new value would exceed the length limit (immediate check)
      if (!isPhoneNumberLengthValid(selectedDialCode, cleanValue)) {
        return; // Don't update the value if it exceeds the limit
      }

      // Update local state immediately for responsive UI
      setLocalPhoneValue(cleanValue);

      // Format in international standard: +dialcode-actualnumber for payload
      if (onChange) {
        const formattedValue = formatInternationalPhone(
          selectedDialCode,
          cleanValue
        );
        onChange(formattedValue);
      }

      // Use debounced validation to avoid lag
      debouncedValidatePhoneLength(cleanValue, selectedDialCode);
    },
    [selectedDialCode, onChange, debouncedValidatePhoneLength]
  );

  // Parse initial value if it contains dial code
  useEffect(() => {
    const { dialCode: extractedDialCode, phoneNumber } =
      parseInternationalPhone(value || '');

    if (extractedDialCode) {
      // Validate the extracted dial code exists in our countries list
      const country = getCountryByDialCode(extractedDialCode);

      if (country) {
        setDialCode(extractedDialCode);
        setSelectedDialCode(extractedDialCode);
        setLocalPhoneValue(phoneNumber);

        // Validate the phone number if it exists
        if (phoneNumber) {
          debouncedValidatePhoneLength(phoneNumber, extractedDialCode);
        }
      } else {
        // If invalid dial code, reset to default
        setDialCode('+1');
        setSelectedDialCode('+1');
        setLocalPhoneValue('');
      }
    } else {
      // Sync local value with parsed phone number
      const { phoneNumber } = parseInternationalPhone(value || '');
      setLocalPhoneValue(phoneNumber);
    }
  }, [value, debouncedValidatePhoneLength]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <label className="flex items-center gap-1.5 text-sm font-medium">
          <Phone className="text-muted-foreground h-3.5 w-3.5" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="flex gap-1">
        <Popover
          open={dialCodeOpen}
          onOpenChange={(open) => {
            setDialCodeOpen(open);
            if (!open) {
              setDialCodeSearch('');
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={dialCodeOpen}
              className="h-9 w-[70px] shrink-0 justify-between px-2 text-sm"
              disabled={disabled}
            >
              <span className="font-mono text-xs">{selectedDialCode}</span>
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput
                placeholder="Search country or dial code..."
                value={dialCodeSearch}
                onValueChange={setDialCodeSearch}
              />
              <CommandList ref={commandListRef}>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.dialCode}
                      value={`${country.dialCode} ${country.name}`}
                      onSelect={() => handleCountryChange(country.dialCode)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {country.dialCode}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {country.name}
                        </span>
                      </div>
                      {selectedDialCode === country.dialCode && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          disabled={disabled}
          placeholder={placeholder}
          value={localPhoneValue}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="h-9 flex-1 text-sm"
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {dialCodeError && (
        <p className="text-destructive text-sm">{dialCodeError}</p>
      )}
      {phoneLengthError && (
        <p className="text-destructive text-sm">{phoneLengthError}</p>
      )}
    </div>
  );
};
