// src/utils/facebookTracking.js
// Enhanced Facebook tracking with AppsFlyer attribution
import { Platform } from 'react-native';
import appsFlyerService from './analytics/appsflyer';
import amplitudeService from './analytics/amplitude';

/**
 * Enhanced Facebook tracking service with AppsFlyer attribution
 * Integrates with existing AppsFlyer and Amplitude setup
 */
class FacebookTrackingService {
  
  constructor() {
    this.isInitialized = false;
    this.facebookProperties = {
      currency: 'MXN',
      content_language: 'es_MX',
      platform: Platform.OS
    };
  }

  /**
   * Initialize Facebook tracking service
   */
  async init() {
    try {
      // Ensure AppsFlyer is initialized
      if (!appsFlyerService.isInitialized()) {
        await appsFlyerService.initAppsFlyer();
      }
      
      this.isInitialized = true;
      console.log('✅ Facebook tracking service initialized');
    } catch (error) {
      console.error('❌ Error initializing Facebook tracking:', error);
    }
  }

  /**
   * Track Facebook-specific conversion events with enhanced attribution
   */
  async trackFacebookConversion(eventName, eventProperties = {}) {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Get AppsFlyer attribution data
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      
      // Enhanced properties for Facebook optimization
      const facebookProperties = {
        ...eventProperties,
        ...this.facebookProperties,
        
        // Facebook-specific attribution properties
        fb_campaign_id: attributionData.fb_campaign_id,
        fb_adset_id: attributionData.fb_adset_id,
        fb_ad_id: attributionData.fb_ad_id,
        fb_placement: attributionData.fb_placement,
        
        // AppsFlyer attribution data
        af_media_source: attributionData.af_media_source,
        af_campaign: attributionData.af_campaign,
        af_status: attributionData.af_status,
        af_adset: attributionData.af_adset,
        af_ad: attributionData.af_ad,
        
        // Revenue data for Facebook optimization
        value: this.calculateEventValue(eventName, eventProperties),
        currency: 'MXN',
        
        // Content categorization for Facebook
        content_type: this.getContentType(eventName),
        content_category: this.getContentCategory(eventName),
        content_name: this.getContentName(eventName),
        
        // User properties
        user_type: eventProperties.user_type || 'new',
        subscription_status: eventProperties.subscription_status || 'none',
        
        // Timestamp
        timestamp: new Date().toISOString(),
        tracking_source: 'facebook_enhanced'
      };
      
      // Track with both AppsFlyer and Amplitude
      await appsFlyerService.trackEvent(eventName, facebookProperties);
      await amplitudeService.trackEvent(eventName, facebookProperties);
      
      console.log('📊 Facebook conversion tracked:', {
        event: eventName,
        has_attribution: !!attributionData.af_media_source,
        value: facebookProperties.value,
        media_source: attributionData.af_media_source
      });
      
      return facebookProperties;
      
    } catch (error) {
      console.error('❌ Error tracking Facebook conversion:', error);
      
      // Fallback to basic tracking
      try {
        await appsFlyerService.trackEvent(eventName, eventProperties);
        await amplitudeService.trackEvent(eventName, eventProperties);
      } catch (fallbackError) {
        console.error('❌ Fallback tracking also failed:', fallbackError);
      }
    }
  }
  
  /**
   * Calculate event value for Facebook optimization
   */
  calculateEventValue(eventName, eventProperties) {
    const valueMap = {
      'Ticket_Created': 0, // No revenue from ticket creation
      'Purchase_Completed': eventProperties.price || eventProperties.subscription_price || 299,
      'rc_renewal_event': eventProperties.subscription_price || 299,
      'Subscription_Status_Updated': 0,
      'First_Ticket_Uploaded': 0,
      'Upload_Completed': 0
    };
    
    return valueMap[eventName] || 0;
  }
  
  /**
   * Get content type for Facebook
   */
  getContentType(eventName) {
    const contentTypes = {
      'Ticket_Created': 'product',
      'Purchase_Completed': 'subscription',
      'Subscription_Status_Updated': 'subscription',
      'rc_renewal_event': 'subscription',
      'First_Ticket_Uploaded': 'product',
      'Upload_Completed': 'product'
    };
    return contentTypes[eventName] || 'product';
  }
  
  /**
   * Get content category for Facebook
   */
  getContentCategory(eventName) {
    const categories = {
      'Ticket_Created': 'invoice_automation',
      'Purchase_Completed': 'initial_purchase',
      'Subscription_Status_Updated': 'status_change',
      'rc_renewal_event': 'renewal',
      'First_Ticket_Uploaded': 'first_use',
      'Upload_Completed': 'file_upload'
    };
    return categories[eventName] || 'general';
  }
  
  /**
   * Get content name for Facebook
   */
  getContentName(eventName) {
    const contentNames = {
      'Ticket_Created': 'Ticket Creation',
      'Purchase_Completed': 'Subscription Purchase',
      'Subscription_Status_Updated': 'Subscription Update',
      'rc_renewal_event': 'Subscription Renewal',
      'First_Ticket_Uploaded': 'First Ticket',
      'Upload_Completed': 'File Upload'
    };
    return contentNames[eventName] || eventName;
  }
  
  /**
   * Track ticket creation with Facebook optimization
   */
  async trackTicketCreated(ticketData) {
    return await this.trackFacebookConversion('Ticket_Created', {
      ticket_id: ticketData.ticket_id,
      ticket_type: ticketData.type || 'invoice',
      ticket_amount: ticketData.amount || 0,
      processing_time_ms: ticketData.processing_time,
      total_time_ms: ticketData.total_time,
      user_type: ticketData.user_type || 'new',
      subscription_status: ticketData.subscription_status || 'none'
    });
  }
  
  /**
   * Track subscription purchase with Facebook optimization
   */
  async trackSubscriptionPurchase(subscriptionData) {
    return await this.trackFacebookConversion('Purchase_Completed', {
      product_id: subscriptionData.product_id,
      price: subscriptionData.price,
      currency: subscriptionData.currency || 'MXN',
      is_trial: subscriptionData.is_trial || false,
      subscription_type: subscriptionData.type,
      user_type: subscriptionData.user_type || 'new'
    });
  }
  
  /**
   * Track subscription renewal with Facebook optimization
   */
  async trackSubscriptionRenewal(subscriptionData) {
    return await this.trackFacebookConversion('rc_renewal_event', {
      subscription_type: subscriptionData.type,
      subscription_price: subscriptionData.price,
      subscription_currency: subscriptionData.currency || 'MXN',
      renewal_count: subscriptionData.renewal_count || 1,
      user_type: subscriptionData.user_type || 'existing'
    });
  }
  
  /**
   * Track subscription status update
   */
  async trackSubscriptionStatusUpdate(subscriptionData) {
    return await this.trackFacebookConversion('Subscription_Status_Updated', {
      active_entitlements: subscriptionData.active_entitlements,
      subscription_status: subscriptionData.status,
      previous_status: subscriptionData.previous_status,
      user_type: subscriptionData.user_type || 'existing'
    });
  }
  
  /**
   * Track first ticket upload (important for retention)
   */
  async trackFirstTicketUpload(ticketData) {
    return await this.trackFacebookConversion('First_Ticket_Uploaded', {
      ticket_id: ticketData.ticket_id,
      ticket_type: ticketData.type || 'invoice',
      user_type: ticketData.user_type || 'new',
      days_since_install: ticketData.days_since_install || 0
    });
  }
  
  /**
   * Track file upload completion
   */
  async trackUploadCompleted(uploadData) {
    return await this.trackFacebookConversion('Upload_Completed', {
      file_type: uploadData.file_type,
      file_size: uploadData.file_size,
      upload_time_ms: uploadData.upload_time,
      user_type: uploadData.user_type || 'existing'
    });
  }
  
  /**
   * Track user engagement for Facebook optimization
   */
  async trackUserEngagement(engagementData) {
    return await this.trackFacebookConversion('User_Engagement', {
      action: engagementData.action,
      screen_name: engagementData.screen_name,
      engagement_type: engagementData.type || 'interaction',
      user_type: engagementData.user_type || 'existing'
    });
  }
  
  /**
   * Get Facebook attribution data for analysis
   */
  async getFacebookAttributionData() {
    try {
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      
      return {
        has_facebook_attribution: !!attributionData.fb_campaign_id,
        facebook_campaign_id: attributionData.fb_campaign_id,
        facebook_adset_id: attributionData.fb_adset_id,
        facebook_ad_id: attributionData.fb_ad_id,
        facebook_placement: attributionData.fb_placement,
        media_source: attributionData.af_media_source,
        campaign: attributionData.af_campaign,
        attribution_status: attributionData.af_status,
        attribution_timestamp: attributionData.attribution_timestamp
      };
    } catch (error) {
      console.error('❌ Error getting Facebook attribution data:', error);
      return {};
    }
  }
  
  /**
   * Check if user came from Facebook Ads
   */
  async isFacebookAttributed() {
    try {
      const attributionData = await this.getFacebookAttributionData();
      return attributionData.has_facebook_attribution && 
             attributionData.media_source === 'facebook';
    } catch (error) {
      console.error('❌ Error checking Facebook attribution:', error);
      return false;
    }
  }
  
  /**
   * Track Facebook-specific user properties
   */
  async setFacebookUserProperties(userProperties) {
    try {
      const attributionData = await this.getFacebookAttributionData();
      
      const enhancedProperties = {
        ...userProperties,
        facebook_attributed: attributionData.has_facebook_attribution,
        facebook_campaign: attributionData.facebook_campaign_id,
        facebook_media_source: attributionData.media_source,
        attribution_source: attributionData.attribution_status === 'Non-organic' ? 'paid' : 'organic'
      };
      
      // Set properties in both services
      await amplitudeService.identifyUser(userProperties.user_id, enhancedProperties);
      await appsFlyerService.setUserId(userProperties.user_id);
      
      console.log('📊 Facebook user properties set:', enhancedProperties);
      
    } catch (error) {
      console.error('❌ Error setting Facebook user properties:', error);
    }
  }
  
  /**
   * Track Facebook campaign performance
   */
  async trackCampaignPerformance(campaignData) {
    try {
      const attributionData = await this.getFacebookAttributionData();
      
      if (attributionData.has_facebook_attribution) {
        await this.trackFacebookConversion('Campaign_Performance', {
          campaign_id: attributionData.facebook_campaign_id,
          adset_id: attributionData.facebook_adset_id,
          ad_id: attributionData.facebook_ad_id,
          placement: attributionData.facebook_placement,
          media_source: attributionData.media_source,
          campaign_name: attributionData.campaign,
          performance_metric: campaignData.metric,
          performance_value: campaignData.value
        });
      }
    } catch (error) {
      console.error('❌ Error tracking campaign performance:', error);
    }
  }
}

// Export singleton instance
export default new FacebookTrackingService(); 