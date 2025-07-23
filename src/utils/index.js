// src/utils/index.js
// Exports principales organizados por categorías

import DeviceInfo from 'react-native-device-info';

export const GetAppVersion = () => DeviceInfo.getVersion();

// Analytics
export { default as amplitudeService } from './analytics/amplitude';
export { default as appsFlyerService } from './analytics/appsflyer';
export { default as trackingService } from './analytics/tracking';

// Retention System
export { default as retentionManager } from './retention';
export { default as retentionAdvanced } from './retention/retentionAdvanced';
export { default as firebaseRetention } from './retention/firebaseRetention';

// Core utilities
export * from './core';

// Other services
export { default as revenuecatService } from './revenuecat';
export { default as notificationsService } from './notifications';
export { default as facebookTrackingService } from './facebookTracking';

// Apple Search Ads
export { default as appleSearchAdsAPI } from './auth/appleSearchAdsAPI';
export { default as appleSearchAdsAttribution } from './auth/appleSearchAdsAttribution';
export { default as appleSearchAdsAuth } from './auth/appleSearchAdsAuth';

// Legacy exports (for backward compatibility)
export { default as retention } from './retention';
export { default as amplitude } from './analytics/amplitude';
export { default as appsflyer } from './analytics/appsflyer';

export function CompareAppVersions(v1, v2) {
  // Devuelve -1 si v1 < v2, 0 si igual, 1 si v1 > v2
  if (!v1 || !v2) return 0;
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const n1 = a[i] || 0;
    const n2 = b[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}
