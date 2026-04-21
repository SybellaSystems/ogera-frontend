/**
 * Country-based mobile number validation utility
 * Contains country codes, expected digit lengths, and validation logic
 */

export interface CountryMobileConfig {
  code: string;
  country: string;
  dialCode: string;
  digitCount: number;
  digitCountRange?: { min: number; max: number }; // For countries with variable length
}

// List of countries with their mobile number digit requirements
export const COUNTRY_MOBILE_CONFIGS: CountryMobileConfig[] = [
  // Asia
  { code: "PK", country: "Pakistan", dialCode: "+92", digitCount: 10 },
  { code: "IN", country: "India", dialCode: "+91", digitCount: 10 },
  { code: "BD", country: "Bangladesh", dialCode: "+880", digitCount: 10 },
  { code: "LK", country: "Sri Lanka", dialCode: "+94", digitCount: 9 },
  { code: "NP", country: "Nepal", dialCode: "+977", digitCount: 10 },
  { code: "AF", country: "Afghanistan", dialCode: "+93", digitCount: 9 },
  { code: "BT", country: "Bhutan", dialCode: "+975", digitCount: 8 },
  { code: "MM", country: "Myanmar", dialCode: "+95", digitCount: 9 },
  { code: "TH", country: "Thailand", dialCode: "+66", digitCount: 9 },
  { code: "VN", country: "Vietnam", dialCode: "+84", digitCount: 9 },
  { code: "ID", country: "Indonesia", dialCode: "+62", digitCount: 10 },
  { code: "PH", country: "Philippines", dialCode: "+63", digitCount: 10 },
  { code: "MY", country: "Malaysia", dialCode: "+60", digitCount: 10 },
  { code: "SG", country: "Singapore", dialCode: "+65", digitCount: 8 },
  { code: "TW", country: "Taiwan", dialCode: "+886", digitCount: 9 },
  { code: "CN", country: "China", dialCode: "+86", digitCount: 11 },
  { code: "JP", country: "Japan", dialCode: "+81", digitCount: 10 },
  { code: "KR", country: "South Korea", dialCode: "+82", digitCount: 10 },

  // Middle East
  { code: "AE", country: "United Arab Emirates", dialCode: "+971", digitCount: 9 },
  { code: "SA", country: "Saudi Arabia", dialCode: "+966", digitCount: 9 },
  { code: "KW", country: "Kuwait", dialCode: "+965", digitCount: 8 },
  { code: "QA", country: "Qatar", dialCode: "+974", digitCount: 8 },
  { code: "BH", country: "Bahrain", dialCode: "+973", digitCount: 8 },
  { code: "OM", country: "Oman", dialCode: "+968", digitCount: 8 },
  { code: "JO", country: "Jordan", dialCode: "+962", digitCount: 9 },
  { code: "LB", country: "Lebanon", dialCode: "+961", digitCount: 8 },
  { code: "PS", country: "Palestine", dialCode: "+970", digitCount: 9 },
  { code: "IL", country: "Israel", dialCode: "+972", digitCount: 9 },
  { code: "IQ", country: "Iraq", dialCode: "+964", digitCount: 10 },
  { code: "IR", country: "Iran", dialCode: "+98", digitCount: 10 },
  { code: "TR", country: "Turkey", dialCode: "+90", digitCount: 10 },
  { code: "EG", country: "Egypt", dialCode: "+20", digitCount: 10 },

  // Europe
  { code: "GB", country: "United Kingdom", dialCode: "+44", digitCount: 10 },
  { code: "US", country: "United States", dialCode: "+1", digitCount: 10 },
  { code: "CA", country: "Canada", dialCode: "+1", digitCount: 10 },
  { code: "FR", country: "France", dialCode: "+33", digitCount: 9 },
  { code: "DE", country: "Germany", dialCode: "+49", digitCount: 10 },
  { code: "IT", country: "Italy", dialCode: "+39", digitCount: 10 },
  { code: "ES", country: "Spain", dialCode: "+34", digitCount: 9 },
  { code: "NL", country: "Netherlands", dialCode: "+31", digitCount: 9 },
  { code: "BE", country: "Belgium", dialCode: "+32", digitCount: 9 },
  { code: "CH", country: "Switzerland", dialCode: "+41", digitCount: 9 },
  { code: "AT", country: "Austria", dialCode: "+43", digitCount: 10 },
  { code: "CZ", country: "Czech Republic", dialCode: "+420", digitCount: 9 },
  { code: "PL", country: "Poland", dialCode: "+48", digitCount: 9 },
  { code: "SE", country: "Sweden", dialCode: "+46", digitCount: 9 },
  { code: "NO", country: "Norway", dialCode: "+47", digitCount: 8 },
  { code: "DK", country: "Denmark", dialCode: "+45", digitCount: 8 },
  { code: "FI", country: "Finland", dialCode: "+358", digitCount: 9 },
  { code: "IE", country: "Ireland", dialCode: "+353", digitCount: 9 },
  { code: "PT", country: "Portugal", dialCode: "+351", digitCount: 9 },
  { code: "GR", country: "Greece", dialCode: "+30", digitCount: 10 },
  { code: "RO", country: "Romania", dialCode: "+40", digitCount: 10 },
  { code: "HU", country: "Hungary", dialCode: "+36", digitCount: 9 },
  { code: "CY", country: "Cyprus", dialCode: "+357", digitCount: 8 },

  // Africa
  { code: "NG", country: "Nigeria", dialCode: "+234", digitCount: 10 },
  { code: "KE", country: "Kenya", dialCode: "+254", digitCount: 9 },
  { code: "RW", country: "Rwanda", dialCode: "+250", digitCount: 9 },
  { code: "ZA", country: "South Africa", dialCode: "+27", digitCount: 9 },
  { code: "GH", country: "Ghana", dialCode: "+233", digitCount: 9 },
  { code: "TZ", country: "Tanzania", dialCode: "+255", digitCount: 9 },
  { code: "UG", country: "Uganda", dialCode: "+256", digitCount: 9 },
  { code: "ET", country: "Ethiopia", dialCode: "+251", digitCount: 9 },
  { code: "MA", country: "Morocco", dialCode: "+212", digitCount: 9 },
  { code: "DZ", country: "Algeria", dialCode: "+213", digitCount: 9 },
  { code: "TN", country: "Tunisia", dialCode: "+216", digitCount: 8 },

  // Others
  { code: "AU", country: "Australia", dialCode: "+61", digitCount: 9 },
  { code: "NZ", country: "New Zealand", dialCode: "+64", digitCount: 9 },
  { code: "BR", country: "Brazil", dialCode: "+55", digitCount: 11 },
  { code: "MX", country: "Mexico", dialCode: "+52", digitCount: 10 },
];

/**
 * Get mobile validation config by country code
 * @param countryCode - ISO country code (e.g., 'PK', 'IN')
 * @returns CountryMobileConfig or undefined if not found
 */
export const getCountryMobileConfig = (
  countryCode: string
): CountryMobileConfig | undefined => {
  return COUNTRY_MOBILE_CONFIGS.find(
    (config) => config.code.toUpperCase() === countryCode.toUpperCase()
  );
};

/**
 * Validate mobile number against country code
 * @param mobileNumber - Mobile number (digits only)
 * @param countryCode - ISO country code
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateMobileNumber = (
  mobileNumber: string,
  countryCode: string
): { isValid: boolean; message?: string } => {
  // Remove any non-digit characters
  const cleanNumber = mobileNumber.replace(/\D/g, "");

  if (!cleanNumber) {
    return { isValid: false, message: "Please enter a mobile number" };
  }

  if (!countryCode) {
    return { isValid: false, message: "Please select a country" };
  }

  const config = getCountryMobileConfig(countryCode);

  if (!config) {
    return { isValid: false, message: `Country code ${countryCode} is not supported` };
  }

  // Check if digit count matches
  if (config.digitCountRange) {
    const { min, max } = config.digitCountRange;
    if (cleanNumber.length < min || cleanNumber.length > max) {
      return {
        isValid: false,
        message: `${config.country} phone numbers should have ${min}-${max} digits. You entered ${cleanNumber.length} digits.`,
      };
    }
  } else {
    if (cleanNumber.length !== config.digitCount) {
      return {
        isValid: false,
        message: `${config.country} phone numbers should have ${config.digitCount} digits. You entered ${cleanNumber.length} digits.`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Format mobile number with country code
 * @param mobileNumber - Mobile number
 * @param countryCode - ISO country code
 * @returns Formatted number with dial code
 */
export const formatMobileNumber = (
  mobileNumber: string,
  countryCode: string
): string => {
  const cleanNumber = mobileNumber.replace(/\D/g, "");
  const config = getCountryMobileConfig(countryCode);

  if (!config) return cleanNumber;

  return `${config.dialCode}${cleanNumber}`;
};

/**
 * Extract only digits from mobile number
 * @param mobileNumber - Mobile number with or without formatting
 * @returns Clean number with only digits
 */
export const extractMobileDigits = (mobileNumber: string): string => {
  return mobileNumber.replace(/\D/g, "");
};

/**
 * Get list of countries sorted by name
 * @returns Array of countries with their codes
 */
export const getCountriesList = (): Array<{
  code: string;
  country: string;
  dialCode: string;
}> => {
  return COUNTRY_MOBILE_CONFIGS.map((config) => ({
    code: config.code,
    country: config.country,
    dialCode: config.dialCode,
  }))
    .sort((a, b) => a.country.localeCompare(b.country));
};

/**
 * Get expected digit message for a country
 * @param countryCode - ISO country code
 * @returns Friendly message about expected digits
 */
export const getExpectedDigitMessage = (countryCode: string): string => {
  const config = getCountryMobileConfig(countryCode);

  if (!config) {
    return "Enter phone number";
  }

  if (config.digitCountRange) {
    const { min, max } = config.digitCountRange;
    return `Phone number must be between ${min} and ${max} digits for ${config.country}`;
  }

  return `Phone number must be exactly ${config.digitCount} digits for ${config.country}`;
};

/**
 * Get country code from dial code
 * @param dialCode - International dial code (e.g., "+92", "+91")
 * @returns Country code or undefined
 */
export const getCountryCodeFromDialCode = (dialCode: string): string | undefined => {
  const config = COUNTRY_MOBILE_CONFIGS.find(
    (config) => config.dialCode === dialCode
  );
  return config?.code;
};

/**
 * Get expected digit range/count as object for a country
 * @param countryCode - ISO country code
 * @returns Object with min/max or exact count
 */
export const getExpectedDigitRange = (
  countryCode: string
): { min: number; max: number } | { exact: number } | null => {
  const config = getCountryMobileConfig(countryCode);

  if (!config) return null;

  if (config.digitCountRange) {
    return config.digitCountRange;
  }

  return { exact: config.digitCount };
};
