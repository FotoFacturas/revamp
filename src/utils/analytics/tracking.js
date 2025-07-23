// src/utils/analytics/tracking.js
// Unified tracking service for Amplitude and AppsFlyer
import { Platform } from 'react-native';
import amplitudeService from './amplitude';
import appsFlyerService from './appsflyer';
import { Logger } from '../core';

/**
 * Unified tracking service that sends events to both Amplitude and AppsFlyer
 */
class UnifiedTrackingService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize both tracking services
   */
  async init() {
    try {
      // Initialize Amplitude attribution tracking
      await amplitudeService.initAttributionTracking();
      
      // Initialize AppsFlyer
      await appsFlyerService.initAppsFlyer();
      
      this.isInitialized = true;
      Logger.success('ANALYTICS', 'Unified tracking service initialized');
    } catch (error) {
      Logger.error('ANALYTICS', 'Error initializing unified tracking:', error);
    }
  }

  /**
   * Track event with both Amplitude and AppsFlyer
   */
  async trackEvent(eventName, eventProperties = {}) {
    try {
      const enrichedProperties = {
        ...eventProperties,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        tracking_source: 'unified'
      };

      // Track with Amplitude
      await amplitudeService.trackEvent(eventName, enrichedProperties);
      
      // Track with AppsFlyer
      await appsFlyerService.trackEvent(eventName, enrichedProperties);
      
      Logger.info('ANALYTICS', 'Event tracked with both services:', eventName, enrichedProperties);
    } catch (error) {
      Logger.error('ANALYTICS', 'Error tracking event:', error);
      
      // Fallback to individual tracking
      try {
        await amplitudeService.trackEvent(eventName, eventProperties);
      } catch (ampError) {
        Logger.error('ANALYTICS', 'Amplitude fallback failed:', ampError);
      }
      
      try {
        await appsFlyerService.trackEvent(eventName, eventProperties);
      } catch (afError) {
        Logger.error('ANALYTICS', 'AppsFlyer fallback failed:', afError);
      }
    }
  }

  /**
   * Identify user with both services
   */
  async identifyUser(userId, userProperties = {}) {
    try {
      // Identify with Amplitude
      await amplitudeService.identifyUser(userId, userProperties);
      
      // Identify with AppsFlyer
      await appsFlyerService.initAppsFlyerWithUser(userId, userProperties);
      
      Logger.success('ANALYTICS', 'User identified with both services:', userId);
    } catch (error) {
      Logger.error('ANALYTICS', 'Error identifying user:', error);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName, additionalProperties = {}) {
    await this.trackEvent('Screen_Viewed', {
      screen_name: screenName,
      ...additionalProperties
    });
  }

  /**
   * Track deep link
   */
  async trackDeepLink(url, additionalProperties = {}) {
    await this.trackEvent('Deep_Link_Opened', {
      deep_link_url: url,
      ...additionalProperties
    });
  }

  /**
   * Track subscription events
   */
  async trackSubscriptionEvent(eventName, subscriptionData = {}) {
    await this.trackEvent(eventName, {
      subscription_type: subscriptionData.type,
      subscription_status: subscriptionData.status,
      subscription_price: subscriptionData.price,
      subscription_currency: subscriptionData.currency,
      ...subscriptionData
    });
  }

  /**
   * Track ticket events
   */
  async trackTicketEvent(eventName, ticketData = {}) {
    await this.trackEvent(eventName, {
      ticket_type: ticketData.type,
      ticket_status: ticketData.status,
      ticket_amount: ticketData.amount,
      ticket_currency: ticketData.currency,
      ...ticketData
    });
  }

  /**
   * Track user engagement
   */
  async trackUserEngagement(action, additionalProperties = {}) {
    await this.trackEvent('User_Engagement', {
      action: action,
      ...additionalProperties
    });
  }

  /**
   * Get attribution data from both services
   */
  async getAttributionData() {
    try {
      const [amplitudeAttribution, appsFlyerAttribution] = await Promise.all([
        amplitudeService.getStoredUTMs(),
        appsFlyerService.getAttributionDataForUser()
      ]);

      return {
        amplitude: amplitudeAttribution,
        appsFlyer: appsFlyerAttribution,
        combined: {
          ...amplitudeAttribution,
          ...appsFlyerAttribution
        }
      };
    } catch (error) {
      Logger.error('ANALYTICS', 'Error getting attribution data:', error);
      return {
        amplitude: {},
        appsFlyer: {},
        combined: {}
      };
    }
  }

  /**
   * Check if user has attribution from any source
   */
  async hasAttribution() {
    const attributionData = await this.getAttributionData();
    
    return {
      hasAmplitudeAttribution: Object.keys(attributionData.amplitude).length > 0,
      hasAppsFlyerAttribution: Object.keys(attributionData.appsFlyer).length > 0,
      hasAnyAttribution: Object.keys(attributionData.combined).length > 0
    };
  }
}

// Create singleton instance
const unifiedTracking = new UnifiedTrackingService();

export default unifiedTracking; 