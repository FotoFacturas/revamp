import { Platform } from 'react-native';
import appsFlyer from 'react-native-appsflyer';
import amplitudeService from './amplitude';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../core';

// AppsFlyer Configuration
const APPSFLYER_DEV_KEY = 'bETPLgmuc8ek4NDFhvWin7';
const APPSFLYER_APP_ID = Platform.select({
  ios: '1590322939', // SOLO el número, sin 'id'
  android: 'com.fotofactura'
});

// Storage keys for attribution data
const APPSFLYER_ATTRIBUTION_KEY = 'fotofacturas_appsflyer_attribution';
const APPSFLYER_UTM_KEY = 'fotofacturas_appsflyer_utm_data';

// Singleton instance
let appsFlyerInstance = null;
let isInitialized = false;

/**
 * Initialize AppsFlyer SDK
 */
const initAppsFlyer = async () => {
  if (isInitialized) {
    Logger.info('APPSFLYER', 'AppsFlyer already initialized');
    return;
  }

  try {
    // AppsFlyer configuration
    const appsFlyerOptions = {
      devKey: APPSFLYER_DEV_KEY,
      appId: APPSFLYER_APP_ID,
      isDebug: __DEV__,
      onInstallConversionDataListener: true,
      onDeepLinkListener: true,
      timeToWaitForATTUserAuthorization: 10, // iOS 14.5+ ATT
    };

    // Initialize AppsFlyer
    await appsFlyer.initSdk(appsFlyerOptions);
    
    // Set up conversion data listener
    appsFlyer.onInstallConversionData((res) => {
      Logger.info('APPSFLYER', 'AppsFlyer conversion data:', res);
      handleConversionData(res);
    });

    // Set up deep link listener
    appsFlyer.onDeepLink((res) => {
      Logger.info('APPSFLYER', 'AppsFlyer deep link:', res);
      handleDeepLink(res);
    });

    isInitialized = true;
    Logger.success('APPSFLYER', 'AppsFlyer initialized successfully');
    
    // Track app open with AppsFlyer
    await trackAppOpen();
    
  } catch (error) {
    Logger.error('APPSFLYER', 'Error initializing AppsFlyer:', error);
    amplitudeService.trackEvent('AppsFlyer_Init_Failed', {
      error: error.message || 'Unknown error',
      platform: Platform.OS
    });
  }
};

/**
 * Handle AppsFlyer conversion data
 */
const handleConversionData = async (conversionData) => {
  try {
    Logger.info('APPSFLYER', 'Processing AppsFlyer conversion data:', conversionData);
    
    if (conversionData.data && conversionData.data.af_status === 'Non-organic') {
      // 🎯 NON-ORGANIC INSTALL (Facebook Ads, etc.)
      Logger.info('APPSFLYER', 'Non-organic install detected - Processing attribution data');
      
      const attributionData = {
        // AppsFlyer attribution data
        af_status: conversionData.data.af_status,
        af_message: conversionData.data.af_message,
        af_source: conversionData.data.af_source,
        af_media_source: conversionData.data.af_media_source,
        af_campaign: conversionData.data.af_campaign,
        af_campaign_id: conversionData.data.af_campaign_id,
        af_adset: conversionData.data.af_adset,
        af_adset_id: conversionData.data.af_adset_id,
        af_ad: conversionData.data.af_ad,
        af_ad_id: conversionData.data.af_ad_id,
        af_keywords: conversionData.data.af_keywords,
        af_cost_model: conversionData.data.af_cost_model,
        af_cost_value: conversionData.data.af_cost_value,
        af_cost_currency: conversionData.data.af_cost_currency,
        
        // Facebook Ads specific data
        fb_campaign_id: conversionData.data.fb_campaign_id,
        fb_adset_id: conversionData.data.fb_adset_id,
        fb_ad_id: conversionData.data.fb_ad_id,
        fb_placement: conversionData.data.fb_placement,
        
        // Attribution confidence for Facebook
        attribution_confidence: conversionData.data.attribution_confidence || 'medium',
        
        // Additional metadata
        attribution_timestamp: new Date().toISOString(),
        attribution_source: 'appsflyer',
        platform: Platform.OS
      };
      
      // Store attribution data
      await storeAttributionData(attributionData);
      
      // Convert to UTM parameters for compatibility
      const utmData = convertAppsFlyerToUTM(attributionData);
      await storeUTMData(utmData);
      
      // Track attribution event in Amplitude
      await amplitudeService.trackEvent('AppsFlyer_Attribution_Found', {
        af_status: attributionData.af_status,
        af_media_source: attributionData.af_media_source,
        af_campaign: attributionData.af_campaign,
        fb_campaign_id: attributionData.fb_campaign_id,
        attribution_source: 'appsflyer'
      });
      
      // ✅ NUEVO: Track specific attribution by source
      if (attributionData.af_media_source) {
        await amplitudeService.trackEvent(`AppsFlyer_Attribution_${attributionData.af_media_source}`, {
          campaign: attributionData.af_campaign,
          campaign_id: attributionData.af_campaign_id,
          ad_id: attributionData.af_ad_id,
          cost_value: attributionData.af_cost_value
        });
      }
      
      Logger.success('APPSFLYER', 'AppsFlyer NON-ORGANIC attribution processed and stored');
    } else {
      // 📊 ORGANIC INSTALL
      Logger.info('APPSFLYER', 'Organic install detected - No paid attribution');
      
      // Store organic status
      const organicData = {
        af_status: 'Organic',
        attribution_timestamp: new Date().toISOString(),
        attribution_source: 'appsflyer',
        platform: Platform.OS
      };
      
      await storeAttributionData(organicData);
      await amplitudeService.trackEvent('AppsFlyer_Organic_Install', {
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      });
    }
    
  } catch (error) {
    Logger.error('APPSFLYER', 'Error handling AppsFlyer conversion data:', error);
    
    // Track error in Amplitude
    await amplitudeService.trackEvent('AppsFlyer_Attribution_Error', {
      error: error.message,
      platform: Platform.OS
    });
  }
};

/**
 * Handle AppsFlyer deep links
 */
const handleDeepLink = async (deepLinkData) => {
  try {
    Logger.info('APPSFLYER', 'Processing AppsFlyer deep link:', deepLinkData);
    
    if (deepLinkData.data) {
      // Extract UTM parameters from deep link
      const utmData = extractUTMsFromDeepLink(deepLinkData.data);
      
      if (Object.keys(utmData).length > 0) {
        // Store UTM data
        await storeUTMData(utmData);
        
        // Track deep link event
        await amplitudeService.trackEvent('Deep_Link_Opened_AppsFlyer', {
          deep_link_url: deepLinkData.data.deep_link_value,
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign,
          attribution_source: 'appsflyer'
        });
        
        Logger.success('APPSFLYER', 'AppsFlyer deep link processed');
      }
    }
    
  } catch (error) {
    Logger.error('APPSFLYER', 'Error handling AppsFlyer deep link:', error);
  }
};

/**
 * Convert AppsFlyer data to UTM parameters
 */
const convertAppsFlyerToUTM = (attributionData) => {
  const utmData = {};
  
  // Map AppsFlyer fields to UTM parameters
  if (attributionData.af_media_source) {
    utmData.utm_source = attributionData.af_media_source;
  }
  
  if (attributionData.af_campaign) {
    utmData.utm_campaign = attributionData.af_campaign;
  }
  
  // Set medium based on source
  if (attributionData.af_media_source) {
    if (attributionData.af_media_source.toLowerCase().includes('facebook')) {
      utmData.utm_medium = 'social';
    } else if (attributionData.af_media_source.toLowerCase().includes('google')) {
      utmData.utm_medium = 'search';
    } else {
      utmData.utm_medium = 'referral';
    }
  }
  
  // Add content and term if available
  if (attributionData.af_ad) {
    utmData.utm_content = attributionData.af_ad;
  }
  
  if (attributionData.af_keywords) {
    utmData.utm_term = attributionData.af_keywords;
  }
  
  return utmData;
};

/**
 * Extract UTM parameters from deep link data
 */
const extractUTMsFromDeepLink = (deepLinkData) => {
  const utmData = {};
  
  // Extract UTM parameters from deep link
  if (deepLinkData.utm_source) utmData.utm_source = deepLinkData.utm_source;
  if (deepLinkData.utm_medium) utmData.utm_medium = deepLinkData.utm_medium;
  if (deepLinkData.utm_campaign) utmData.utm_campaign = deepLinkData.utm_campaign;
  if (deepLinkData.utm_content) utmData.utm_content = deepLinkData.utm_content;
  if (deepLinkData.utm_term) utmData.utm_term = deepLinkData.utm_term;
  
  return utmData;
};

/**
 * Store attribution data
 */
const storeAttributionData = async (attributionData) => {
  try {
    await AsyncStorage.setItem(APPSFLYER_ATTRIBUTION_KEY, JSON.stringify(attributionData));
    Logger.info('APPSFLYER', 'AppsFlyer attribution data stored');
  } catch (error) {
    Logger.error('APPSFLYER', 'Error storing AppsFlyer attribution data:', error);
  }
};

/**
 * Store UTM data
 */
const storeUTMData = async (utmData) => {
  try {
    await AsyncStorage.setItem(APPSFLYER_UTM_KEY, JSON.stringify(utmData));
    Logger.info('APPSFLYER', 'AppsFlyer UTM data stored');
  } catch (error) {
    Logger.error('APPSFLYER', 'Error storing AppsFlyer UTM data:', error);
  }
};

/**
 * Get stored attribution data
 */
const getStoredAttributionData = async () => {
  try {
    const data = await AsyncStorage.getItem(APPSFLYER_ATTRIBUTION_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    Logger.error('APPSFLYER', 'Error getting stored AppsFlyer attribution data:', error);
    return {};
  }
};

/**
 * Get stored UTM data
 */
const getStoredUTMData = async () => {
  try {
    const data = await AsyncStorage.getItem(APPSFLYER_UTM_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    Logger.error('APPSFLYER', 'Error getting stored AppsFlyer UTM data:', error);
    return {};
  }
};

/**
 * Track app open with AppsFlyer
 */
const trackAppOpen = async () => {
  try {
    if (isInitialized) {
      await appsFlyer.logEvent('af_app_open', {
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      });
      Logger.info('APPSFLYER', 'AppsFlyer app open tracked');
    }
  } catch (error) {
    Logger.error('APPSFLYER', 'Error tracking AppsFlyer app open:', error);
  }
};

/**
 * Track custom event with AppsFlyer
 */
const trackEvent = async (eventName, eventProperties = {}) => {
  try {
    if (!isInitialized) {
      Logger.warning('APPSFLYER', 'AppsFlyer not initialized, skipping event:', eventName);
      return;
    }
    
    // Get stored attribution data to enrich events
    const attributionData = await getStoredAttributionData();
    const utmData = await getStoredUTMData();
    
    // Enrich event properties with attribution data
    const enrichedProperties = {
      ...eventProperties,
      ...utmData,
      attribution_source: 'appsflyer',
      timestamp: new Date().toISOString(),
      platform: Platform.OS
    };
    
    // Add AppsFlyer specific attribution data if available
    if (attributionData.af_media_source) {
      enrichedProperties.af_media_source = attributionData.af_media_source;
      enrichedProperties.af_campaign = attributionData.af_campaign;
      enrichedProperties.af_status = attributionData.af_status;
    }
    
    // Track event with AppsFlyer
    await appsFlyer.logEvent(eventName, enrichedProperties);
    
    Logger.info('APPSFLYER', 'AppsFlyer event tracked:', eventName, enrichedProperties);
    
  } catch (error) {
    Logger.error('APPSFLYER', 'Error tracking AppsFlyer event:', error);
  }
};

/**
 * Set user ID in AppsFlyer
 */
const setUserId = async (userId) => {
  try {
    if (isInitialized) {
      await appsFlyer.setCustomerUserId(userId);
      Logger.info('APPSFLYER', 'AppsFlyer user ID set:', userId);
    }
  } catch (error) {
    Logger.error('APPSFLYER', 'Error setting AppsFlyer user ID:', error);
  }
};

/**
 * Get AppsFlyer attribution data for user identification
 */
const getAttributionDataForUser = async () => {
  try {
    const attributionData = await getStoredAttributionData();
    const utmData = await getStoredUTMData();
    
    return {
      ...attributionData,
      ...utmData,
      attribution_source: 'appsflyer'
    };
  } catch (error) {
    Logger.error('APPSFLYER', 'Error getting AppsFlyer attribution data:', error);
    return {};
  }
};

/**
 * Initialize AppsFlyer with user data
 */
const initAppsFlyerWithUser = async (userId, userProperties = {}) => {
  try {
    // Initialize AppsFlyer if not already done
    if (!isInitialized) {
      await initAppsFlyer();
    }
    
    // Set user ID
    await setUserId(userId);
    
    // Get attribution data
    const attributionData = await getAttributionDataForUser();
    
    // Track user identification event
    await trackEvent('User_Identified', {
      user_id: userId,
      user_properties: userProperties,
      has_attribution: Object.keys(attributionData).length > 0
    });
    
    Logger.success('APPSFLYER', 'AppsFlyer initialized with user:', userId);
    return attributionData;
    
  } catch (error) {
    Logger.error('APPSFLYER', 'Error initializing AppsFlyer with user:', error);
    return {};
  }
};

/**
 * NUEVAS FUNCIONES - REVENUE TRACKING
 * Agregar antes del export default
 */

// Función para determinar tipo de suscripción
const getSubscriptionType = (productId) => {
  if (!productId) return 'individual';
  
  const id = productId.toLowerCase();
  
  // Basado en product IDs reales del proyecto
  if (id.includes('ahorro')) return 'ahorro';
  if (id.includes('individual')) return 'individual'; 
  if (id.includes('empresarial')) return 'empresarial';
  
  return 'individual'; // default
};

// Función para obtener precio por tipo
const getSubscriptionPrice = (subscriptionType) => {
  const prices = {
    'ahorro': 99,
    'individual': 299,
    'empresarial': 999
  };
  return prices[subscriptionType] || 299;
};

// Función para eventos con revenue
const trackRevenueEvent = async (eventName, eventProperties = {}) => {
  try {
    if (!isInitialized) {
      Logger.warning('APPSFLYER', 'AppsFlyer not initialized, skipping revenue event:', eventName);
      return;
    }
    
    // Copiar propiedades base
    const revenueProperties = { ...eventProperties };
    
    // Agregar af_revenue y af_currency según el evento
    if (eventName === 'rc_trial_converted_event' || eventName === 'rc_renewal_event') {
      const subscriptionType = getSubscriptionType(eventProperties.product_id || eventProperties.$productId);
      revenueProperties.af_revenue = eventProperties.revenue || eventProperties.$revenue || getSubscriptionPrice(subscriptionType);
      revenueProperties.af_currency = eventProperties.currency || 'MXN';
      revenueProperties.subscription_type = subscriptionType;
    } else if (eventName === 'Ticket_Created') {
      revenueProperties.af_revenue = 0; // Conversión sin revenue
      revenueProperties.af_currency = 'MXN';
    } else {
      revenueProperties.af_revenue = 0;
      revenueProperties.af_currency = 'MXN';
    }
    
    // Usar la función trackEvent existente
    await trackEvent(eventName, revenueProperties);
    
    Logger.info('APPSFLYER REVENUE', `Revenue event tracked: ${eventName}`, {
      revenue: revenueProperties.af_revenue,
      currency: revenueProperties.af_currency
    });
    
  } catch (error) {
    Logger.error('APPSFLYER REVENUE', 'Error tracking revenue event:', error);
  }
};

export default {
  // Core methods
  initAppsFlyer,
  initAppsFlyerWithUser,
  trackEvent,
  setUserId,
  trackAppOpen,
  
  // Attribution methods
  getAttributionDataForUser,
  getStoredAttributionData,
  getStoredUTMData,
  
  // Utility methods
  isInitialized: () => isInitialized,
  instance: appsFlyerInstance,
  // NUEVAS FUNCIONES
  trackRevenueEvent,
  getSubscriptionType,
  getSubscriptionPrice
}; 