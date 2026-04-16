import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FEATURES } from "../config/featureFlags";

interface FeatureGateProps {
  children: React.ReactNode;
  feature: keyof typeof FEATURES;
  fallback?: string | null;
}

/**
 * FeatureGate Component
 *
 * Protects routes based on feature flags. If a feature is disabled,
 * redirects to the fallback route (default: /dashboard).
 *
 * Usage:
 * <FeatureGate feature="RESOLUTION_CENTER">
 *   <DisputesPage />
 * </FeatureGate>
 */
const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  fallback = "/dashboard",
}) => {
  const location = useLocation();

  // If feature is disabled, redirect to fallback
  if (!FEATURES[feature]) {
    console.warn(
      `🚫 [FEATURE GATE] Access denied to ${feature}. Redirecting to ${fallback}`
    );
    return (
      <Navigate
        to={fallback || "/dashboard"}
        replace
        state={{ from: location }}
      />
    );
  }

  // Feature is enabled, render children
  return <>{children}</>;
};

export default FeatureGate;
