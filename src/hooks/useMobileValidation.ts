import { useCallback } from 'react';
import { validateMobileNumber, getCountryMobileConfig, getCountriesList, COUNTRY_MOBILE_CONFIGS } from '../utils/mobileValidation';

export interface UseMobileValidationReturn {
  validateMobileNumber: (mobileNumber: string, countryCode: string) => { isValid: boolean; message?: string };
  getCountryMobileConfig: (countryCode: string) => typeof COUNTRY_MOBILE_CONFIGS[0] | undefined;
  getCountriesList: () => Array<{ code: string; country: string; dialCode: string }>;
  getExpectedDigitCount: (countryCode: string) => string | number | undefined;
}

/**
 * Custom hook for mobile number validation based on country code
 * @returns Object with validation functions and country utilities
 */
export const useMobileValidation = (): UseMobileValidationReturn => {
  const validate = useCallback(
    (mobileNumber: string, countryCode: string) => {
      return validateMobileNumber(mobileNumber, countryCode);
    },
    []
  );

  const getConfig = useCallback((countryCode: string) => {
    return getCountryMobileConfig(countryCode);
  }, []);

  const getCountries = useCallback(() => {
    return getCountriesList();
  }, []);

  const getExpectedDigits = useCallback((countryCode: string) => {
    const config = getCountryMobileConfig(countryCode);
    if (!config) return undefined;
    
    if (config.digitCountRange) {
      return `${config.digitCountRange.min}-${config.digitCountRange.max}`;
    }
    return config.digitCount;
  }, []);

  return {
    validateMobileNumber: validate,
    getCountryMobileConfig: getConfig,
    getCountriesList: getCountries,
    getExpectedDigitCount: getExpectedDigits,
  };
};
