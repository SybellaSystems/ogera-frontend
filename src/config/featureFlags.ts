/**
 * Feature Flags Configuration
 * 
 * This file controls which features are visible to users in the application.
 * For V1 launch, certain features are hidden but not deleted - they can be enabled in V2
 * by simply toggling the flag to true.
 * 
 * These flags are used for:
 * - Conditional rendering in sidebars and UI components
 * - Route protection and redirection
 * - Feature availability checks
 */

export const FEATURES = {
  /** Resolution Center (Disputes) - Hidden in V1 */
  RESOLUTION_CENTER: false,
  
  /** Settings (Account/Profile) - Enabled in V1 so students/employers can manage their profile */
  SETTINGS: true,
} as const;

/**
 * Helper function to check if a feature is enabled
 * @param featureName - The name of the feature to check
 * @returns boolean - true if feature is enabled, false otherwise
 */
export const isFeatureEnabled = (featureName: keyof typeof FEATURES): boolean => {
  return FEATURES[featureName];
};

/**
 * Get all disabled features for debugging
 */
export const getDisabledFeatures = (): Array<keyof typeof FEATURES> => {
  return (Object.keys(FEATURES) as Array<keyof typeof FEATURES>).filter(
    (feature) => !FEATURES[feature]
  );
};
