/**
 * Mobile Validation Test Cases & Demonstration
 * 
 * This file contains test cases and demonstrations for the mobile number
 * validation system. You can use these to test your implementation or
 * verify that the validation is working correctly.
 */

import { validateMobileNumber, getCountriesList, getCountryMobileConfig, formatMobileNumber, extractMobileDigits } from '../utils/mobileValidation';

// ============================================================================
// TEST SUITE: Mobile Number Validation
// ============================================================================

export const MobileValidationTests = () => {
  console.log('🧪 Running Mobile Number Validation Tests...\n');

  // Test Group 1: Valid Mobile Numbers
  console.group('✅ TEST GROUP 1: Valid Mobile Numbers');
  
  const validTestCases = [
    { number: '3001234567', country: 'PK', name: 'Pakistan' },
    { number: '9876543210', country: 'IN', name: 'India' },
    { number: '01711234567', country: 'BD', name: 'Bangladesh' },
    { number: '2025551234', country: 'US', name: 'United States' },
    { number: '1234567890', country: 'GB', name: 'United Kingdom' },
    { number: '7123456789', country: 'BR', name: 'Brazil' },
    { number: '901234567', country: 'VN', name: 'Vietnam' },
    { number: '8012345678', country: 'SG', name: 'Singapore' },
  ];

  validTestCases.forEach(({ number, country, name }) => {
    const result = validateMobileNumber(number, country);
    console.log(`
    ${result.isValid ? '✓' : '✗'} ${name} (${country}): ${number}
    Valid: ${result.isValid}
    ${!result.isValid ? `Error: ${result.message}` : ''}
    `);
  });
  console.groupEnd();

  // Test Group 2: Invalid Mobile Numbers
  console.group('❌ TEST GROUP 2: Invalid Mobile Numbers');
  
  const invalidTestCases = [
    { number: '300123', country: 'PK', reason: 'Too few digits' },
    { number: '300123456789', country: 'PK', reason: 'Too many digits' },
    { number: '', country: 'PK', reason: 'Empty string' },
    { number: '9876543210', country: 'XY', reason: 'Unsupported country' },
    { number: '123456789', country: 'PK', reason: 'Wrong digit count for Pakistan' },
    { number: 'abcdefghij', country: 'IN', reason: 'Non-digit characters' },
  ];

  invalidTestCases.forEach(({ number, country, reason }) => {
    const result = validateMobileNumber(number, country);
    console.log(`
    ${!result.isValid ? '✓' : '✗'} ${reason}
    Number: ${number || '(empty)'}
    Country: ${country}
    Valid: ${result.isValid}
    Message: ${result.message || 'None'}
    `);
  });
  console.groupEnd();

  console.log('✅ Test Suite Completed!\n');
};

// ============================================================================
// DEMONSTRATION: Countries and Their Requirements
// ============================================================================

export const CountriesDemonstration = () => {
  console.log('🌍 Country Mobile Number Requirements\n');
  
  const countries = getCountriesList();
  
  // Show a sample of countries
  console.table(
    countries.slice(0, 10).map(country => ({
      'Country': country.country,
      'Code': country.code,
      'Dial Code': country.dialCode,
      'Expected Digits': getCountryMobileConfig(country.code)?.digitCount || 'N/A',
    }))
  );

  console.log(`\n📊 Total Supported Countries: ${countries.length}\n`);
};

// ============================================================================
// DEMONSTRATION: Helper Functions
// ============================================================================

export const HelperFunctionsDemonstration = () => {
  console.log('🔧 Helper Functions Demonstration\n');

  // Extract Digits
  console.group('Extract Mobile Digits');
  const testNumbers = [
    '+92-300-123-4567',
    '(300) 123-4567',
    '+92 300 123 4567',
    '300.123.4567',
  ];

  testNumbers.forEach(number => {
    const extracted = extractMobileDigits(number);
    console.log(`${number} → ${extracted}`);
  });
  console.groupEnd();

  // Format Mobile Number
  console.group('Format Mobile Number');
  const formatTestCases = [
    { number: '3001234567', country: 'PK' },
    { number: '9876543210', country: 'IN' },
    { number: '2025551234', country: 'US' },
  ];

  formatTestCases.forEach(({ number, country }) => {
    const formatted = formatMobileNumber(number, country);
    const _config = getCountryMobileConfig(country);
    void _config; // used for validation in test
    console.log(`${number} (${country}) → ${formatted}`);
  });
  console.groupEnd();
};

// ============================================================================
// INTERACTIVE DEMO: Real-time Validation Simulation
// ============================================================================

export const RealTimeValidationSimulation = () => {
  console.log('📱 Real-time Validation Simulation\n');

  // Simulate user typing a Pakistan number
  const userInput = '300123';
  const countryCode = 'PK';
  const expectedDigits = 10;

  console.group(`Simulating Pakistan phone number entry: "${userInput}"`);

  for (let i = 1; i <= userInput.length; i++) {
    const currentInput = userInput.substring(0, i);
    const validation = validateMobileNumber(currentInput, countryCode);
    
    console.log(`
After typing digit ${i}: "${currentInput}" (${i}/${expectedDigits} digits)
Status: ${validation.isValid ? '✓ Valid' : '⏳ Incomplete'}
    `);
  }

  // Complete the number
  const completeNumber = '3001234567';
  const finalValidation = validateMobileNumber(completeNumber, countryCode);
  console.log(`
Complete number: "${completeNumber}"
Status: ${finalValidation.isValid ? '✓ VALID - Ready to submit!' : '✗ Invalid'}
    `);
  console.groupEnd();
};

// ============================================================================
// PERFORMANCE TEST: Validation Speed
// ============================================================================

export const PerformanceTest = () => {
  console.log('⚡ Performance Test\n');

  const iterations = 10000;
  const testCases = [
    { number: '3001234567', country: 'PK' },
    { number: '9876543210', country: 'IN' },
    { number: '2025551234', country: 'US' },
  ];

  console.group(`Running ${iterations} validation iterations`);

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    testCases.forEach(({ number, country }) => {
      validateMobileNumber(number, country);
    });
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / (iterations * testCases.length);

  console.log(`
Total validations: ${iterations * testCases.length}
Total time: ${totalTime.toFixed(2)}ms
Average time per validation: ${avgTime.toFixed(4)}ms
Performance: ${(1000 / avgTime).toFixed(0)} validations/second
  `);
  console.groupEnd();
};

// ============================================================================
// EDGE CASES TEST
// ============================================================================

export const EdgeCasesTest = () => {
  console.log('🔍 Edge Cases Test\n');

  const edgeCases = [
    { 
      description: 'Number with spaces',
      number: '300 123 4567',
      country: 'PK',
    },
    { 
      description: 'Number with dashes',
      number: '300-123-4567',
      country: 'PK',
    },
    { 
      description: 'Number with plus sign',
      number: '+923001234567',
      country: 'PK',
    },
    { 
      description: 'Number with parentheses',
      number: '(300) 123-4567',
      country: 'PK',
    },
    { 
      description: 'Number with dots',
      number: '300.123.4567',
      country: 'PK',
    },
    { 
      description: 'Leading zeros',
      number: '00923001234567',
      country: 'PK',
    },
    { 
      description: 'Number with letters',
      number: '300A234B567',
      country: 'PK',
    },
    { 
      description: 'Very long input',
      number: '30012345678901234567890',
      country: 'PK',
    },
  ];

  console.table(
    edgeCases.map(({ description, number, country }) => {
      const result = validateMobileNumber(number, country);
      return {
        'Test Case': description,
        'Input': number,
        'Valid': result.isValid ? 'Yes' : 'No',
        'Message': result.message || 'Valid',
      };
    })
  );
};

// ============================================================================
// INTEGRATION TEST: Form Submission Scenario
// ============================================================================

export interface ValidationScenario {
  step: number;
  action: string;
  countryCode: string;
  mobileNumber: string;
  expectedResult: 'valid' | 'invalid';
  description: string;
}

export const FormSubmissionScenario = () => {
  console.log('📋 Form Submission Scenario Test\n');

  const scenario: ValidationScenario[] = [
    {
      step: 1,
      action: 'User opens form',
      countryCode: 'PK',
      mobileNumber: '',
      expectedResult: 'invalid',
      description: 'Empty mobile number',
    },
    {
      step: 2,
      action: 'User selects United States',
      countryCode: 'US',
      mobileNumber: '',
      expectedResult: 'invalid',
      description: 'Empty field after country change',
    },
    {
      step: 3,
      action: 'User enters first 3 digits',
      countryCode: 'US',
      mobileNumber: '202',
      expectedResult: 'invalid',
      description: 'Incomplete number (3/10 digits)',
    },
    {
      step: 4,
      action: 'User enters full number',
      countryCode: 'US',
      mobileNumber: '2025551234',
      expectedResult: 'valid',
      description: 'Complete valid US number',
    },
    {
      step: 5,
      action: 'User adds extra digit',
      countryCode: 'US',
      mobileNumber: '20255512345',
      expectedResult: 'invalid',
      description: 'Too many digits (11 instead of 10)',
    },
    {
      step: 6,
      action: 'User corrects number',
      countryCode: 'US',
      mobileNumber: '2025551234',
      expectedResult: 'valid',
      description: 'Back to valid state',
    },
    {
      step: 7,
      action: 'User submits form',
      countryCode: 'US',
      mobileNumber: '2025551234',
      expectedResult: 'valid',
      description: 'Submission allowed',
    },
  ];

  scenario.forEach(
    ({
      step,
      action,
      countryCode,
      mobileNumber,
      expectedResult,
      description,
    }) => {
      const result = validateMobileNumber(mobileNumber, countryCode);
      const isCorrect = result.isValid === (expectedResult === 'valid');

      console.log(`
Step ${step}: ${action}
Description: ${description}
Country: ${countryCode}
Mobile: "${mobileNumber}"
Expected: ${expectedResult.toUpperCase()}
Actual: ${result.isValid ? 'VALID' : 'INVALID'}
Test Status: ${isCorrect ? '✓ PASS' : '✗ FAIL'}
      `);
    }
  );
};

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export const RunAllTests = () => {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Mobile Number Validation - Complete Test Suite           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  MobileValidationTests();
  CountriesDemonstration();
  HelperFunctionsDemonstration();
  RealTimeValidationSimulation();
  PerformanceTest();
  EdgeCasesTest();
  FormSubmissionScenario();

  console.log(
    '\n✅ All tests completed! Open browser console (F12) to view detailed results.'
  );
};

// Export for use in React components
export default {
  MobileValidationTests,
  CountriesDemonstration,
  HelperFunctionsDemonstration,
  RealTimeValidationSimulation,
  PerformanceTest,
  EdgeCasesTest,
  FormSubmissionScenario,
  RunAllTests,
};
