// src/utils/firebaseRetention.js
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sistema de retención usando Firebase Analytics
 */
class FirebaseRetentionService {
  
  /**
   * Inicializar propiedades de usuario en Firebase basado en segmentación
   */
  async setUserSegmentInFirebase(userId, segment, attributionData = {}) {
    try {
      if (__DEV__) console.log('🔥 Setting Firebase user properties for segment:', segment);
      
      // Set user properties in Firebase
      await analytics().setUserProperties({
        acquisition_channel: segment,
        attribution_source: 'appsflyer',
        af_media_source: attributionData.af_media_source || 'unknown',
        af_campaign: attributionData.af_campaign || 'unknown',
        af_status: attributionData.af_status || 'unknown',
        platform: Platform.OS,
        segmentation_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      });
      
      // Set user ID
      await analytics().setUserId(userId.toString());
      
      // Track segmentation event
      await analytics().logEvent('user_segmented', {
        segment: segment,
        attribution_source: 'appsflyer',
        af_media_source: attributionData.af_media_source || 'unknown',
        af_campaign: attributionData.af_campaign || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      if (__DEV__) console.log('✅ Firebase user properties set for segment:', segment);
      return true;
      
    } catch (error) {
      console.error('🚨 Error setting Firebase user segment:', error);
      return false;
    }
  }
  
  /**
   * Track eventos específicos por segmento
   */
  async trackSegmentedEvent(eventName, segment, properties = {}) {
    try {
      // Clean event name for Firebase (no special characters)
      const cleanEventName = eventName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      const eventProperties = {
        ...properties,
        user_segment: segment,
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      };
      
      // Remove undefined values
      Object.keys(eventProperties).forEach(key => {
        if (eventProperties[key] === undefined || eventProperties[key] === null) {
          delete eventProperties[key];
        }
      });
      
      await analytics().logEvent(cleanEventName, eventProperties);
      if (__DEV__) console.log(`🔥 Firebase event tracked for ${segment}:`, cleanEventName);
      
    } catch (error) {
      console.error('🚨 Error tracking segmented event in Firebase:', error);
    }
  }
  
  /**
   * Track engagement por segmento
   */
  async trackEngagementBySegment(userId, engagementLevel, segment, properties = {}) {
    try {
      await analytics().logEvent('user_engagement_analyzed', {
        user_id: userId.toString(),
        engagement_level: engagementLevel,
        user_segment: segment,
        ...properties,
        timestamp: new Date().toISOString()
      });
      
      // Set updated user property
      await analytics().setUserProperty('engagement_level', engagementLevel);
      
      if (__DEV__) console.log(`🔥 Engagement tracked in Firebase: ${engagementLevel} for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 Error tracking engagement in Firebase:', error);
    }
  }
  
  /**
   * Track conversión de primer ticket por segmento
   */
  async trackFirstTicketBySegment(userId, segment, ticketProperties = {}) {
    try {
      await analytics().logEvent('first_ticket_created', {
        user_id: userId.toString(),
        user_segment: segment,
        ticket_id: ticketProperties.ticket_id,
        amount: ticketProperties.amount,
        type: ticketProperties.type || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      // Update user property
      await analytics().setUserProperty('has_created_first_ticket', 'true');
      await analytics().setUserProperty('first_ticket_date', new Date().toISOString().split('T')[0]);
      
      if (__DEV__) console.log(`🔥 First ticket tracked in Firebase for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 Error tracking first ticket in Firebase:', error);
    }
  }
  
  /**
   * Track subscription events por segmento
   */
  async trackSubscriptionBySegment(userId, segment, subscriptionEvent, properties = {}) {
    try {
      // Clean event name
      const cleanEventName = `subscription_${subscriptionEvent}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      await analytics().logEvent(cleanEventName, {
        user_id: userId.toString(),
        user_segment: segment,
        ...properties,
        timestamp: new Date().toISOString()
      });
      
      // Update user property based on event
      if (subscriptionEvent === 'started' || subscriptionEvent === 'renewed') {
        await analytics().setUserProperty('subscription_status', 'active');
        await analytics().setUserProperty('subscription_user_segment', segment);
      }
      
      if (__DEV__) console.log(`🔥 Subscription ${subscriptionEvent} tracked in Firebase for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 Error tracking subscription event in Firebase:', error);
    }
  }
  
  /**
   * Track ticket creation with segmentation
   */
  async trackTicketCreatedBySegment(userId, segment, ticketProperties = {}) {
    try {
      await analytics().logEvent('ticket_created_segmented', {
        user_id: userId.toString(),
        user_segment: segment,
        ticket_id: ticketProperties.ticket_id,
        amount: ticketProperties.amount || 0,
        type: ticketProperties.type || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      if (__DEV__) console.log(`🔥 Ticket creation tracked in Firebase for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 Error tracking ticket creation in Firebase:', error);
    }
  }
  
  /**
   * Track screen views with segmentation
   */
  async trackScreenViewBySegment(userId, segment, screenName, properties = {}) {
    try {
      await analytics().logEvent('screen_view_segmented', {
        user_id: userId.toString(),
        user_segment: segment,
        screen_name: screenName,
        ...properties,
        timestamp: new Date().toISOString()
      });
      
      if (__DEV__) console.log(`🔥 Screen view tracked in Firebase for ${segment} user: ${screenName}`);
      
    } catch (error) {
      console.error('🚨 Error tracking screen view in Firebase:', error);
    }
  }
}

export default new FirebaseRetentionService(); 