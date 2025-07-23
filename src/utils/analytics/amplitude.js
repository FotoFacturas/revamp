// src/utils/analytics/amplitude.js
import { Amplitude, Identify } from '@amplitude/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appleSearchAdsAttribution from '../auth/appleSearchAdsAttribution';
import { Logger } from '../core';

// Create a singleton instance with error handling
let amplitude = null;

try {
  amplitude = new Amplitude();
  amplitude.init('964eb6b9283aae3c20691b67f3eb1028');
  Logger.success('ANALYTICS', 'Amplitude initialized successfully');
} catch (error) {
  Logger.error('ANALYTICS', 'Error initializing Amplitude:', error);
}

// UTM and Attribution Storage Keys
const UTM_STORAGE_KEY = 'fotofacturas_utm_data';
const ATTRIBUTION_STORAGE_KEY = 'fotofacturas_attribution_data';

// Helper function to ensure Amplitude is available
const ensureAmplitude = () => {
  if (!amplitude) {
    Logger.error('ANALYTICS', 'Amplitude instance is not available');
    return false;
  }
  
  if (typeof amplitude.logEvent !== 'function') {
    Logger.error('ANALYTICS', 'amplitude.logEvent is not a function:', typeof amplitude.logEvent);
    return false;
  }
  
  return true;
};

// Extract UTMs from URL
const extractUTMsFromURL = (url) => {
  if (!url) return {};
  
  try {
    // Split URL to get query string
    const parts = url.split('?');
    if (parts.length < 2) return {};
    
    const queryString = parts[1];
    const params = {};
    
    // Parse query parameters manually
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    
    const utmData = {
      utm_source: params.utm_source || null,
      utm_medium: params.utm_medium || null,
      utm_campaign: params.utm_campaign || null,
      utm_content: params.utm_content || null,
      utm_term: params.utm_term || null,
      gclid: params.gclid || null,
      fbclid: params.fbclid || null,
      // Additional attribution parameters
      ref: params.ref || null,
      source: params.source || null,
      medium: params.medium || null,
      campaign: params.campaign || null
    };
    
    // Filter out null values
    const filteredUtmData = {};
    Object.keys(utmData).forEach(key => {
      if (utmData[key] !== null) {
        filteredUtmData[key] = utmData[key];
      }
    });
    
    Logger.info('ANALYTICS', 'Extracted UTMs from URL:', filteredUtmData);
    return filteredUtmData;
  } catch (error) {
    Logger.error('ANALYTICS', 'Error extracting UTMs from URL:', error);
    return {};
  }
};

// Capture and store UTMs
const captureUTMs = async (url) => {
  try {
    const utmData = extractUTMsFromURL(url);
    
    if (Object.keys(utmData).length > 0) {
      // Store UTMs in AsyncStorage
      await AsyncStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      
      // Set user properties in Amplitude
      if (ensureAmplitude()) {
        const identify = new Identify();
        Object.keys(utmData).forEach(key => {
          identify.set(`first_${key}`, utmData[key]);
          identify.set(`last_${key}`, utmData[key]);
        });
        
        amplitude.identify(identify);
      }
      
      Logger.info('ANALYTICS', 'UTMs captured and stored:', utmData);
      return utmData;
    }
    
    return null;
  } catch (error) {
    Logger.error('ANALYTICS', 'Error capturing UTMs:', error);
    return null;
  }
};

// Handle deep links
const handleDeepLink = async (url) => {
  try {
    Logger.info('ANALYTICS', 'Handling deep link:', url);
    
    // Capture UTMs from deep link
    const utmData = await captureUTMs(url);
    
    // Track deep link event
    const deepLinkProperties = {
      deep_link_url: url,
      timestamp: new Date().toISOString(),
      platform: Platform.OS
    };
    
    if (utmData) {
      Object.assign(deepLinkProperties, utmData);
    }
    
    if (ensureAmplitude()) {
      amplitude.logEvent('Deep_Link_Opened', deepLinkProperties);
    }
    
    return utmData;
  } catch (error) {
    Logger.error('ANALYTICS', 'Error handling deep link:', error);
    return null;
  }
};

// Get stored UTMs
const getStoredUTMs = async () => {
  try {
    const utmData = await AsyncStorage.getItem(UTM_STORAGE_KEY);
    return utmData ? JSON.parse(utmData) : {};
  } catch (error) {
    Logger.error('ANALYTICS', 'Error getting stored UTMs:', error);
    return {};
  }
};

// Initialize attribution tracking
const initAttributionTracking = async () => {
  try {
    // Get stored UTMs
    const storedUtms = await getStoredUTMs();
    
    // Set user properties if UTMs exist
    if (Object.keys(storedUtms).length > 0 && ensureAmplitude()) {
      const identify = new Identify();
      Object.keys(storedUtms).forEach(key => {
        identify.set(`first_${key}`, storedUtms[key]);
        identify.set(`last_${key}`, storedUtms[key]);
      });
      
      amplitude.identify(identify);
      Logger.info('ANALYTICS', 'Attribution tracking initialized with stored UTMs:', storedUtms);
    }
    
    // Track app open event
    await trackAppOpen();
    
  } catch (error) {
    Logger.error('ANALYTICS', 'Error initializing attribution tracking:', error);
  }
};

// Track app open event
const trackAppOpen = async () => {
  try {
    const storedUtms = await getStoredUTMs();
    
    const appOpenProperties = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      app_version: '3.0.28' // Reemplazar con versión real de la app
    };
    
    // Add UTMs to app open event
    if (Object.keys(storedUtms).length > 0) {
      Object.assign(appOpenProperties, storedUtms);
    }
    
    if (ensureAmplitude()) {
      amplitude.logEvent('App_Opened', appOpenProperties);
      Logger.info('ANALYTICS', 'App open tracked:', appOpenProperties);
    }
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking app open:', error);
  }
};

// Enhanced trackEvent with Apple Search Ads support
const trackEvent = async (eventName, eventProperties = {}) => {
  try {
    // Ensure Amplitude is available
    if (!ensureAmplitude()) {
      Logger.error('ANALYTICS', 'Cannot track event - Amplitude not available');
      return;
    }

    // Get stored UTM data (includes Apple Search Ads attribution)
    const storedUTMData = await AsyncStorage.getItem(UTM_STORAGE_KEY);
    let utmData = {};

    if (storedUTMData) {
      try {
        utmData = JSON.parse(storedUTMData);
        Logger.info('ANALYTICS', 'UTM data found for event:', eventName, {
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign
        });
      } catch (parseError) {
        Logger.error('ANALYTICS', 'Error parsing stored UTM data:', parseError);
      }
    }

    // Merge UTM data with event properties
    const enhancedProperties = {
      ...eventProperties,
      ...utmData
    };

    // Solo incluir campos de Apple Search Ads si estamos en iOS y hay atribución
    if (Platform.OS === 'ios' && utmData.apple_campaign_id) {
      enhancedProperties.apple_search_ads_attributed = true;
      enhancedProperties.apple_campaign_id = utmData.apple_campaign_id;
      enhancedProperties.apple_org_id = utmData.apple_org_id;
      enhancedProperties.apple_country = utmData.apple_country;
      enhancedProperties.attribution_confidence = utmData.attribution_confidence;
      enhancedProperties.attribution_source = utmData.attribution_source;
    } else {
      // Eliminar cualquier campo de Apple Search Ads si no aplica
      delete enhancedProperties.apple_search_ads_attributed;
      delete enhancedProperties.apple_campaign_id;
      delete enhancedProperties.apple_org_id;
      delete enhancedProperties.apple_country;
      delete enhancedProperties.attribution_confidence;
      delete enhancedProperties.attribution_source;
    }

    // Track event with enhanced properties using logEvent (correct method for React Native)
    amplitude.logEvent(eventName, enhancedProperties);

    // Solo loggear Apple Search Ads attribution si aplica
    if (Platform.OS === 'ios' && utmData.apple_campaign_id) {
      Logger.info('ANALYTICS', 'Event tracked with Apple Search Ads attribution:', {
        event: eventName,
        has_attribution: true,
        utm_source: utmData.utm_source,
        utm_campaign: utmData.utm_campaign
      });
    } else {
      Logger.info('ANALYTICS', 'Event tracked:', {
        event: eventName,
        utm_source: utmData.utm_source,
        utm_campaign: utmData.utm_campaign
      });
    }

  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking event with Apple Search Ads attribution:', error);
    Logger.error('ANALYTICS', 'Error details:', {
      eventName,
      eventProperties,
      amplitudeType: typeof amplitude,
      logEventType: typeof amplitude?.logEvent
    });

    // Fallback to basic tracking
    try {
      if (ensureAmplitude()) {
        amplitude.logEvent(eventName, eventProperties);
        Logger.info('ANALYTICS', 'Fallback tracking successful');
      } else {
        Logger.error('ANALYTICS', 'Fallback tracking failed - amplitude not available');
      }
    } catch (fallbackError) {
      Logger.error('ANALYTICS', 'Fallback tracking also failed:', fallbackError);
    }
  }
};

const identifyUser = async (userId, userProperties = {}) => {
  try {
    // Get stored UTMs
    const storedUtms = await getStoredUTMs();
    
    // Combine user properties with UTMs
    const enhancedUserProperties = {
      ...userProperties,
      ...storedUtms
    };
    
    Logger.info('ANALYTICS', 'Setting user properties:', enhancedUserProperties);
    
    const identify = new Identify();
    
    // Set each property individually
    Object.keys(enhancedUserProperties).forEach(key => {
      const value = enhancedUserProperties[key];
      if (value !== null && value !== undefined && value !== '') {
        identify.set(key, value);
      }
    });
    
    // Set user ID and call identify
    amplitude.setUserId(userId);
    amplitude.identify(identify);
    
    Logger.success('ANALYTICS', 'Amplitude user identified:', { userId, properties: enhancedUserProperties });
  } catch (error) {
    Logger.error('ANALYTICS', 'Amplitude identify error:', error);
  }
};

// Nuevo método para trackear retención
const trackRetentionEvent = async (eventName, userId, eventProperties = {}) => {
  try {
    const storedUtms = await getStoredUTMs();
    
    // Agregar propiedades comunes para análisis de retención
    const retentionProperties = {
      ...eventProperties,
      timestamp: new Date().toISOString(),
      user_id: userId,
      platform: Platform.OS,
      app_version: '3.0.28', // Reemplazar con versión real de la app
      ...storedUtms
    };
    
    Logger.info('ANALYTICS', `Tracking retention event: ${eventName}`, { userId, ...retentionProperties });
    
    if (ensureAmplitude()) {
      amplitude.logEvent(eventName, retentionProperties);
    }
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking retention event:', error);
  }
};

// Método para trackear primer ticket
const trackFirstTicket = async (userId, ticketId, ticketProperties = {}) => {
  try {
    const storedUtms = await getStoredUTMs();
    
    const enhancedTicketProperties = {
      ...ticketProperties,
      ...storedUtms
    };
    
    Logger.info('ANALYTICS', `Tracking first ticket upload for user ${userId}`, enhancedTicketProperties);
    
    // Evento para primer ticket
    amplitude.logEvent('First_Ticket_Uploaded', {
      user_id: userId,
      ticket_id: ticketId,
      timestamp: new Date().toISOString(),
      ...enhancedTicketProperties
    });
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking first ticket:', error);
  }
};

// Método para trackear uso de tickets
const trackTicketUsage = async (userId, currentCount, maxCount) => {
  try {
    const storedUtms = await getStoredUTMs();
    const usagePercentage = maxCount > 0 ? (currentCount / maxCount) * 100 : 0;
    
    amplitude.logEvent('Ticket_Usage_Updated', {
      user_id: userId,
      current_count: currentCount,
      max_count: maxCount,
      usage_percentage: usagePercentage,
      usage_threshold: usagePercentage > 80 ? 'high' : 
                       usagePercentage > 50 ? 'medium' : 'low',
      timestamp: new Date().toISOString(),
      ...storedUtms
    });
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking ticket usage:', error);
  }
};

// Método para trackear actividad del usuario
const trackUserEngagement = async (userId, engagementProperties = {}) => {
  try {
    const storedUtms = await getStoredUTMs();
    
    amplitude.logEvent('User_Engagement', {
      user_id: userId,
      timestamp: new Date().toISOString(),
      ...engagementProperties,
      ...storedUtms
    });
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking user engagement:', error);
  }
};

// Método para trackear interacciones con notificaciones
const trackNotificationInteraction = async (userId, notificationType, action, properties = {}) => {
  try {
    const storedUtms = await getStoredUTMs();
    
    amplitude.logEvent('Notification_Interaction', {
      user_id: userId,
      notification_type: notificationType,
      action: action,
      timestamp: new Date().toISOString(),
      ...properties,
      ...storedUtms
    });
  } catch (error) {
    Logger.error('ANALYTICS', 'Error tracking notification interaction:', error);
  }
};

// Get stored attribution data
const getStoredAttributionData = async () => {
  try {
    const storedData = await getStoredUTMs();
    
    // Check if we have Apple Search Ads attribution data
    if (storedData.apple_campaign_id) {
      return {
        utm_source: storedData.utm_source,
        utm_medium: storedData.utm_medium,
        utm_campaign: storedData.utm_campaign,
        apple_campaign_id: storedData.apple_campaign_id,
        apple_org_id: storedData.apple_org_id,
        apple_country: storedData.apple_country,
        attribution_confidence: storedData.attribution_confidence,
        attribution_source: storedData.attribution_source,
        attribution_timestamp: storedData.attribution_timestamp
      };
    }
    
    return null;
  } catch (error) {
    Logger.error('ANALYTICS', 'Error getting stored attribution data:', error);
    return null;
  }
};

// Create UTM query string from attribution data
const createUTMQuery = (attributionData) => {
  try {
    const params = new URLSearchParams();
    
    if (attributionData.utm_source) params.append('utm_source', attributionData.utm_source);
    if (attributionData.utm_medium) params.append('utm_medium', attributionData.utm_medium);
    if (attributionData.utm_campaign) params.append('utm_campaign', attributionData.utm_campaign);
    if (attributionData.utm_content) params.append('utm_content', attributionData.utm_content);
    if (attributionData.utm_term) params.append('utm_term', attributionData.utm_term);
    
    // Add Apple Search Ads specific parameters
    if (attributionData.apple_campaign_id) params.append('apple_campaign_id', attributionData.apple_campaign_id);
    if (attributionData.apple_org_id) params.append('apple_org_id', attributionData.apple_org_id);
    if (attributionData.apple_country) params.append('apple_country', attributionData.apple_country);
    if (attributionData.attribution_confidence) params.append('attribution_confidence', attributionData.attribution_confidence);
    if (attributionData.attribution_source) params.append('attribution_source', attributionData.attribution_source);
    
    return params.toString();
  } catch (error) {
    Logger.error('ANALYTICS', 'Error creating UTM query:', error);
    return '';
  }
};

// Handle Apple Search Ads attribution
const handleAppleSearchAdsAttribution = async (userId, userData) => {
  try {
    Logger.info('ANALYTICS', 'Starting Apple Search Ads attribution for user:', userId);
    
    // Get attribution data
    const attributionData = await appleSearchAdsAttribution.getAttributionForUser(userData);
    
    if (attributionData) {
      Logger.info('ANALYTICS', 'Apple Search Ads attribution found:', attributionData);
      
      // Convert attribution data to UTM parameters
      const utmData = convertAttributionToUTM(attributionData);
      
      // Store attribution data directly in AsyncStorage (same as UTMs)
      const attributionStorageData = {
        // UTM parameters
        utm_source: utmData.utm_source,
        utm_medium: utmData.utm_medium,
        utm_campaign: utmData.utm_campaign,
        utm_content: utmData.utm_content,
        
        // Apple Search Ads specific data
        apple_campaign_id: attributionData.apple_campaign_id,
        apple_org_id: attributionData.apple_org_id,
        apple_country: attributionData.apple_country,
        attribution_confidence: attributionData.attribution_confidence,
        attribution_source: attributionData.attribution_source,
        attribution_timestamp: new Date().toISOString(),
        
        // Additional metadata
        attribution_details: attributionData.attribution_details,
        user_data: userData
      };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attributionStorageData));
      Logger.info('ANALYTICS', 'Attribution data stored with UTM conversion:', utmData);
      
      // Set user properties in Amplitude
      const identify = new Identify();
      Object.keys(attributionStorageData).forEach(key => {
        if (key !== 'user_data' && key !== 'attribution_details') {
          identify.set(`first_${key}`, attributionStorageData[key]);
          identify.set(`last_${key}`, attributionStorageData[key]);
        }
      });
      
      amplitude.identify(identify);
      
      // Track attribution event
      await trackEvent('Apple_Search_Ads_Attribution', {
        user_id: userId,
        attribution_data: attributionData,
        attribution_confidence: attributionData.attribution_confidence,
        apple_campaign_id: attributionData.apple_campaign_id,
        apple_org_id: attributionData.apple_org_id,
        apple_country: attributionData.apple_country,
        utm_source: utmData.utm_source,
        utm_medium: utmData.utm_medium,
        utm_campaign: utmData.utm_campaign,
        utm_content: utmData.utm_content
      });
      
      Logger.success('ANALYTICS', 'Apple Search Ads attribution stored and tracked successfully with UTM conversion');
      return attributionData;
    } else {
      Logger.info('ANALYTICS', 'No Apple Search Ads attribution found for user:', userId);
      return null;
    }
  } catch (error) {
    Logger.error('ANALYTICS', 'Error handling Apple Search Ads attribution:', error);
    return null;
  }
};

// Convert Apple Search Ads attribution to UTM parameters
const convertAttributionToUTM = (attributionData) => {
  try {
    const utmData = {
      utm_source: 'apple_search_ads',
      utm_medium: 'app_store_search',
      utm_campaign: `campaign_${attributionData.apple_campaign_id}_${attributionData.apple_country}`,
      utm_content: `installs_${attributionData.attribution_details?.installs || 0}`
    };
    
    Logger.info('ANALYTICS', 'Converted attribution to UTM:', utmData);
    return utmData;
  } catch (error) {
    Logger.error('ANALYTICS', 'Error converting attribution to UTM:', error);
    return {
      utm_source: 'apple_search_ads',
      utm_medium: 'app_store_search',
      utm_campaign: 'campaign_unknown',
      utm_content: 'installs_0'
    };
  }
};

// Enhanced identifyUser with Apple Search Ads support
const identifyUserWithAttribution = async (userId, userProperties = {}) => {
  try {
    // Get stored UTMs
    const storedUtms = await getStoredUTMs();
    
    // Combine user properties with UTMs and attribution data
    const enhancedUserProperties = {
      ...userProperties,
      ...storedUtms
    };
    
    // Add Apple Search Ads attribution properties if available
    if (storedUtms.apple_campaign_id) {
      Object.assign(enhancedUserProperties, {
        apple_search_ads_attributed: true,
        apple_campaign_id: storedUtms.apple_campaign_id,
        apple_org_id: storedUtms.apple_org_id,
        apple_country: storedUtms.apple_country,
        attribution_confidence: storedUtms.attribution_confidence,
        attribution_source: storedUtms.attribution_source || 'apple_search_ads_api'
      });
    }
    
    Logger.info('ANALYTICS', 'Setting user properties with attribution:', enhancedUserProperties);
    
    const identify = new Identify();
    
    // Set each property individually
    Object.keys(enhancedUserProperties).forEach(key => {
      const value = enhancedUserProperties[key];
      if (value !== null && value !== undefined && value !== '') {
        identify.set(key, value);
      }
    });
    
    // Set user ID and call identify
    amplitude.setUserId(userId);
    amplitude.identify(identify);
    
    Logger.success('ANALYTICS', 'Amplitude user identified with attribution:', { userId, properties: enhancedUserProperties });
  } catch (error) {
    Logger.error('ANALYTICS', 'Amplitude identify with attribution error:', error);
    // Fallback to original identify
    identifyUser(userId, userProperties);
  }
};

export default {
  instance: amplitude,
  trackEvent,
  identifyUser,
  identifyUserWithAttribution,
  trackRetentionEvent,
  trackFirstTicket,
  trackTicketUsage,
  trackUserEngagement,
  trackNotificationInteraction,
  // UTM and attribution methods
  extractUTMsFromURL,
  captureUTMs,
  handleDeepLink,
  getStoredUTMs,
  initAttributionTracking,
  trackAppOpen,
  // Apple Search Ads methods
  handleAppleSearchAdsAttribution,
  createUTMQuery,
  getStoredAttributionData
};