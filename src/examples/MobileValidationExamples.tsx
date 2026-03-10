/**
 * Example: Mobile Number Validation Implementation
 * 
 * This file demonstrates different ways to use the mobile number validation
 * system in your React components.
 */

import React, { useState } from 'react';
import { validateMobileNumber, getCountriesList } from '../utils/mobileValidation';
import { useMobileValidation } from '../hooks/useMobileValidation';
import toast from 'react-hot-toast';

// ============================================================================
// EXAMPLE 1: Simple Form Component with Mobile Validation
// ============================================================================

export const Example1_SimpleForm: React.FC = () => {
  const [countryCode, setCountryCode] = useState<string>('PK');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number
    const validation = validateMobileNumber(mobileNumber, countryCode);
    
    if (!validation.isValid) {
      const msg = validation.message ?? 'Invalid mobile number';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    // If valid, submit the form
    setError(null);
    console.log('Valid mobile number:', mobileNumber);
    console.log('Country:', countryCode);
    toast.success('Mobile number is valid!');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Country</label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          {getCountriesList().map((country) => (
            <option key={country.code} value={country.code}>
              {country.country} ({country.dialCode})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Mobile Number</label>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="Enter mobile number"
          className="w-full px-3 py-2 border rounded"
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Submit
      </button>
    </form>
  );
};

// ============================================================================
// EXAMPLE 2: Real-time Validation with Feedback
// ============================================================================

export const Example2_RealTimeValidation: React.FC = () => {
  const [countryCode, setCountryCode] = useState<string>('IN');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const { validateMobileNumber: validate, getCountryMobileConfig: getConfig } = useMobileValidation();

  const validation = mobileNumber 
    ? validate(mobileNumber, countryCode) 
    : { isValid: true };

  const countryConfig = getConfig(countryCode);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Country</label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          {/* dropdown options */}
        </select>
        <p className="text-xs text-gray-600 mt-1">
          Expected format: {countryConfig?.digitCount} digits ({countryConfig?.dialCode})
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Mobile Number</label>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="Enter mobile number"
          className={`w-full px-3 py-2 border rounded ${
            !validation.isValid && mobileNumber ? 'border-red-500' : 'border-green-500'
          }`}
        />
        
        {/* Real-time feedback */}
        {mobileNumber && (
          <div className="mt-2">
            {validation.isValid ? (
              <p className="text-green-600 text-sm">✓ Valid mobile number</p>
            ) : (
              <p className="text-red-600 text-sm">✗ {validation.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: With Formik Integration (Like EditProfileModal)
// ============================================================================

export const Example3_FormikIntegration: React.FC = () => {
  const [countryCode, setCountryCode] = useState<string>('US');
  const [mobileValidationError, setMobileValidationError] = useState<string | null>(null);

  const handleMobileChange = (value: string) => {
    if (value.trim()) {
      const validation = validateMobileNumber(value, countryCode);
      if (!validation.isValid) {
        setMobileValidationError(validation.message || 'Invalid mobile number');
      } else {
        setMobileValidationError(null);
      }
    } else {
      setMobileValidationError(null);
    }
  };

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Phone Number <span className="text-red-600">*</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Selector */}
          <select
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-24 px-2 py-2 border rounded"
          >
            {getCountriesList().map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.dialCode}
              </option>
            ))}
          </select>

          {/* Phone Input */}
          <input
            type="tel"
            placeholder="Enter phone number"
            onChange={(e) => handleMobileChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
        </div>

        {/* Validation Messages */}
        {mobileValidationError && (
          <p className="text-red-600 text-sm mt-2">⚠️ {mobileValidationError}</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Advanced - Multiple Country Support
// ============================================================================

interface MultiCountryFormData {
  [key: string]: {
    countryCode: string;
    mobileNumber: string;
    isValid: boolean;
  };
}

export const Example4_MultiCountry: React.FC = () => {
  const [contacts, setContacts] = useState<MultiCountryFormData>({
    primary: { countryCode: 'PK', mobileNumber: '', isValid: false },
    secondary: { countryCode: 'IN', mobileNumber: '', isValid: false },
  });

  const handleContactChange = (
    key: string,
    field: 'countryCode' | 'mobileNumber',
    value: string
  ) => {
    const updated = {
      ...contacts,
      [key]: {
        ...contacts[key],
        [field]: value,
      },
    };

    if (field === 'mobileNumber' || field === 'countryCode') {
      const validation = validateMobileNumber(
        updated[key].mobileNumber,
        updated[key].countryCode
      );
      updated[key].isValid = validation.isValid;
    }

    setContacts(updated);
  };

  const handleSubmit = () => {
    // Validate all contacts
    const allValid = Object.values(contacts).every(
      (contact) => !contact.mobileNumber || contact.isValid
    );

    if (allValid) {
      console.log('All contacts are valid:', contacts);
      toast.success('All contacts validated successfully!');
    } else {
      toast.error('Some contacts have invalid phone numbers');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {Object.entries(contacts).map(([key, contact]) => (
        <div key={key} className="mb-6 p-4 border rounded">
          <h3 className="font-medium mb-3 capitalize">{key} Contact</h3>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={contact.countryCode}
              onChange={(e) =>
                handleContactChange(key, 'countryCode', e.target.value)
              }
              className="px-2 py-2 border rounded"
            >
              {getCountriesList().map((c) => (
                <option key={c.code} value={c.code}>
                  {c.country}
                </option>
              ))}
            </select>

            <input
              type="tel"
              value={contact.mobileNumber}
              onChange={(e) =>
                handleContactChange(key, 'mobileNumber', e.target.value)
              }
              placeholder="Mobile number"
              className="px-2 py-2 border rounded"
            />
          </div>

          {contact.mobileNumber && (
            <p
              className={`text-sm ${
                contact.isValid ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {contact.isValid ? '✓ Valid' : '✗ Invalid'}
            </p>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium"
      >
        Validate All Contacts
      </button>
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Custom Hook Usage
// ============================================================================

export const Example5_CustomHookUsage: React.FC = () => {
  const { validateMobileNumber, getCountriesList, getExpectedDigitCount } = useMobileValidation();
  const [mobileInput, setMobileInput] = useState('');
  const [countryCode, setCountryCode] = useState('PK');

  const handleValidate = () => {
    const result = validateMobileNumber(mobileInput, countryCode);
    if (result.isValid) {
      toast.success('✓ Mobile number is valid!');
    } else {
      toast.error(`✗ ${result.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          {getCountriesList().map((country) => (
            <option key={country.code} value={country.code}>
              {country.country} - {getExpectedDigitCount(country.code)} digits
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <input
          type="tel"
          value={mobileInput}
          onChange={(e) => setMobileInput(e.target.value)}
          placeholder="Enter mobile number"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={handleValidate}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Validate
      </button>
    </div>
  );
};

// ============================================================================
// Export all examples
// ============================================================================

export default {
  Example1_SimpleForm,
  Example2_RealTimeValidation,
  Example3_FormikIntegration,
  Example4_MultiCountry,
  Example5_CustomHookUsage,
};
