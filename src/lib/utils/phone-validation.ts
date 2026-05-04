import countryPhoneData from '@/data/country-phone-data.json';

export interface CountryPhoneData {
  name: string;
  isoCode: string;
  dialCode: string;
  phoneNumberLength: number;
  format: string;
  regex: string;
}

export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  maxLength?: number;
  format?: string;
}

/**
 * Get all country phone data
 */
export const getCountryPhoneData = (): CountryPhoneData[] => {
  return countryPhoneData as CountryPhoneData[];
};

/**
 * Get country data by dial code
 */
export const getCountryByDialCode = (
  dialCode: string
): CountryPhoneData | null => {
  return (
    countryPhoneData.find((country) => country.dialCode === dialCode) || null
  );
};

/**
 * Get country data by ISO code
 */
export const getCountryByIsoCode = (
  isoCode: string
): CountryPhoneData | null => {
  return (
    countryPhoneData.find((country) => country.isoCode === isoCode) || null
  );
};

/**
 * Get all unique dial codes sorted
 */
export const getAllDialCodes = (): string[] => {
  return [
    ...new Set(countryPhoneData.map((country) => country.dialCode)),
  ].sort();
};

/**
 * Validate phone number for a specific country
 */
export const validatePhoneNumber = (
  dialCode: string,
  phoneNumber: string
): PhoneValidationResult => {
  // Find the country by dial code
  const country = getCountryByDialCode(dialCode);

  if (!country) {
    return {
      isValid: false,
      message: 'Invalid country dial code.',
    };
  }

  // Clean the phone number - remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Check if phone number is empty
  if (!digitsOnly) {
    return {
      isValid: true,
      message: 'Phone number is empty.',
      maxLength: country.phoneNumberLength,
      format: country.format,
    };
  }

  // Check length
  if (digitsOnly.length > country.phoneNumberLength) {
    return {
      isValid: false,
      message: `Phone number cannot exceed ${country.phoneNumberLength} digits for this country.`,
      maxLength: country.phoneNumberLength,
      format: country.format,
    };
  }

  if (digitsOnly.length < country.phoneNumberLength) {
    return {
      isValid: false,
      message: `Phone number should be ${country.phoneNumberLength} digits long for this country.`,
      maxLength: country.phoneNumberLength,
      format: country.format,
    };
  }

  // Validate with regex pattern if available
  if (country.regex) {
    const regex = new RegExp(country.regex);
    if (!regex.test(digitsOnly)) {
      return {
        isValid: false,
        message: 'Invalid phone number format for this country.',
        maxLength: country.phoneNumberLength,
        format: country.format,
      };
    }
  }

  return {
    isValid: true,
    message: 'Valid phone number.',
    maxLength: country.phoneNumberLength,
    format: country.format,
  };
};

/**
 * Check if phone number length is valid (for real-time validation)
 */
export const isPhoneNumberLengthValid = (
  dialCode: string,
  phoneNumber: string
): boolean => {
  const country = getCountryByDialCode(dialCode);
  if (!country) return false;

  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return digitsOnly.length <= country.phoneNumberLength;
};

/**
 * Get maximum phone number length for a country
 */
export const getMaxPhoneLength = (dialCode: string): number => {
  const country = getCountryByDialCode(dialCode);
  return country ? country.phoneNumberLength : 15; // Default fallback
};

/**
 * Format phone number according to country format
 */
export const formatPhoneNumber = (
  dialCode: string,
  phoneNumber: string
): string => {
  const country = getCountryByDialCode(dialCode);
  if (!country || !phoneNumber) return phoneNumber;

  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const format = country.format;

  let formatted = '';
  let digitIndex = 0;

  for (let i = 0; i < format.length && digitIndex < digitsOnly.length; i++) {
    if (format[i] === 'X') {
      formatted += digitsOnly[digitIndex];
      digitIndex++;
    } else {
      formatted += format[i];
    }
  }

  return formatted;
};

/**
 * Parse international phone number format (+dialcode-number)
 */
export const parseInternationalPhone = (
  internationalPhone: string
): {
  dialCode: string;
  phoneNumber: string;
} => {
  if (!internationalPhone) {
    return { dialCode: '', phoneNumber: '' };
  }

  // Handle format: +dialcode-number
  const phoneMatch = internationalPhone.match(/^(\+\d{1,4})-(.*)$/);
  if (phoneMatch) {
    return {
      dialCode: phoneMatch[1],
      phoneNumber: phoneMatch[2],
    };
  }

  // Handle format: +dialcode (without number)
  const dialCodeMatch = internationalPhone.match(/^(\+\d{1,4})$/);
  if (dialCodeMatch) {
    return {
      dialCode: dialCodeMatch[1],
      phoneNumber: '',
    };
  }

  return { dialCode: '', phoneNumber: internationalPhone };
};

/**
 * Format phone number in international standard format
 */
export const formatInternationalPhone = (
  dialCode: string,
  phoneNumber: string
): string => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return dialCode;
  }
  return `${dialCode}-${phoneNumber}`;
};

/**
 * Search countries by name, dial code, or ISO code
 */
export const searchCountries = (searchTerm: string): CountryPhoneData[] => {
  if (!searchTerm) return countryPhoneData as CountryPhoneData[];

  const term = searchTerm.toLowerCase();
  return countryPhoneData.filter(
    (country) =>
      country.name.toLowerCase().includes(term) ||
      country.dialCode.includes(searchTerm) ||
      country.isoCode.toLowerCase().includes(term)
  ) as CountryPhoneData[];
};
