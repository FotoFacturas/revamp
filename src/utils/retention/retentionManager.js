// src/utils/retentionManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import retentionAdvanced from './retentionAdvanced';
import firebaseRetentionService from './firebaseRetention';
import amplitudeService from '../analytics/amplitude';
import appsFlyerService from '../analytics/appsflyer';

/**
 * Manager central de retención que coordina todos los servicios
 */
class RetentionManager {
  
  constructor() {
    this.SEGMENT_KEY = 'ADVANCED_RETENTION_USER_SEGMENT';
    this.INITIALIZED_KEY = 'RETENTION_MANAGER_INITIALIZED';
  }
  
  /**
   * Inicializar retención completa para usuario
   */
  async initializeUserRetention(userId, userEmail) {
    try {
      if (__DEV__) console.log('🎯 RetentionManager: Initializing complete retention for user:', userId);
      
      // Check if already initialized for this user
      const alreadyInitialized = await AsyncStorage.getItem(`${this.INITIALIZED_KEY}_${userId}`);
      if (alreadyInitialized === 'true') {
        if (__DEV__) console.log('⚠️ Retention already initialized for user:', userId);
        const segment = await this.getUserSegment(userId);
        return { success: true, segment, already_initialized: true };
      }
      
      // Wait for attribution data to be available
      await this.waitForAttributionData();
      
      // 1. Get attribution data
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      if (__DEV__) console.log('📊 Attribution data for retention:', attributionData);
      
      // 2. Initialize advanced retention (analytics + notifications scheduling)
      const retentionResult = await retentionAdvanced.initRetentionByChannel(userId, userEmail);
      if (__DEV__) console.log('🎯 Advanced retention result:', retentionResult);
      
      if (retentionResult.success) {
        // 3. Set Firebase user properties
        const firebaseResult = await firebaseRetentionService.setUserSegmentInFirebase(
          userId, 
          retentionResult.segment, 
          attributionData
        );
        
        // 4. Track complete initialization in Amplitude
        await amplitudeService.trackRetentionEvent('Complete_Retention_Initialized', userId, {
          segment: retentionResult.segment,
          attribution_source: attributionData.attribution_source || 'appsflyer',
          firebase_properties_set: firebaseResult,
          af_status: attributionData.af_status,
          af_media_source: attributionData.af_media_source,
          af_campaign: attributionData.af_campaign
        });
        
        // 5. Mark as initialized
        await AsyncStorage.setItem(`${this.INITIALIZED_KEY}_${userId}`, 'true');
        
        if (__DEV__) console.log('✅ Complete retention initialized successfully for segment:', retentionResult.segment);
        return retentionResult;
      } else {
        console.error('🚨 Advanced retention initialization failed:', retentionResult.error);
        return retentionResult;
      }
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error initializing complete retention:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Wait for attribution data to be processed
   */
  async waitForAttributionData(maxWaitTime = 3000) {
    return new Promise((resolve) => {
      let waited = 0;
      const checkInterval = 500;
      
      const checkAttributionData = async () => {
        try {
          const attributionData = await appsFlyerService.getAttributionDataForUser();
          
          if (Object.keys(attributionData).length > 0 || waited >= maxWaitTime) {
            if (__DEV__) console.log(`📊 Attribution data ready after ${waited}ms:`, attributionData);
            resolve();
          } else {
            waited += checkInterval;
            setTimeout(checkAttributionData, checkInterval);
          }
        } catch (error) {
          if (__DEV__) console.log('⚠️ Waiting for attribution data...');
          waited += checkInterval;
          if (waited >= maxWaitTime) {
            resolve();
          } else {
            setTimeout(checkAttributionData, checkInterval);
          }
        }
      };
      
      checkAttributionData();
    });
  }
  
  /**
   * Track evento importante con contexto de segmentación
   */
  async trackImportantEvent(userId, eventName, properties = {}) {
    try {
      // Get user segment
      const segment = await this.getUserSegment(userId);
      
      if (__DEV__) console.log(`📊 RetentionManager: Tracking important event ${eventName} for ${segment} user`);
      
      // Track in all services
      await Promise.all([
        // Amplitude with retention context
        amplitudeService.trackRetentionEvent(eventName, userId, { 
          ...properties, 
          segment,
          event_context: 'retention_manager'
        }),
        
        // Firebase with segmentation
        firebaseRetentionService.trackSegmentedEvent(eventName, segment, properties)
      ]);
      
      if (__DEV__) console.log(`✅ Important event tracked across all services: ${eventName}`);
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error tracking important event:', error);
    }
  }
  
  /**
   * Track primer ticket con segmentación completa
   */
  async trackFirstTicket(userId, ticketProperties = {}) {
    try {
      const segment = await this.getUserSegment(userId);
      
      if (__DEV__) console.log(`🎯 RetentionManager: Tracking first ticket for ${segment} user`);
      
      // Track first ticket in all services
      await Promise.all([
        // Amplitude
        amplitudeService.trackFirstTicket(userId, ticketProperties.ticket_id, { 
          ...ticketProperties, 
          segment,
          is_first_ticket: true 
        }),
        
        // Firebase
        firebaseRetentionService.trackFirstTicketBySegment(userId, segment, ticketProperties),
        
        // AppsFlyer
        appsFlyerService.trackEvent('First_Ticket_Created', {
          user_id: userId,
          segment: segment,
          ...ticketProperties
        })
      ]);
      
      // Track retention event
      await amplitudeService.trackRetentionEvent('First_Ticket_Milestone_Reached', userId, {
        segment,
        segment,
        ticket_id: ticketProperties.ticket_id,
        amount: ticketProperties.amount
      });
      
      if (__DEV__) console.log(`✅ First ticket tracked across all services for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error tracking first ticket:', error);
    }
  }
  
  /**
   * Track ticket creation con segmentación
   */
  async trackTicketCreated(userId, ticketProperties = {}) {
    try {
      const segment = await this.getUserSegment(userId);
      
      if (__DEV__) console.log(`📝 RetentionManager: Tracking ticket creation for ${segment} user`);
      
      // Track in all services
      await Promise.all([
        // Amplitude
        amplitudeService.trackEvent('Ticket_Created', {
          user_id: userId,
          segment: segment,
          ...ticketProperties
        }),
        
        // Firebase
        firebaseRetentionService.trackTicketCreatedBySegment(userId, segment, ticketProperties),
        
        // AppsFlyer
        appsFlyerService.trackRevenueEvent('Ticket_Created', {
          user_id: userId,
          segment: segment,
          ...ticketProperties
        })
      ]);
      
      if (__DEV__) console.log(`✅ Ticket creation tracked for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error tracking ticket creation:', error);
    }
  }
  
  /**
   * Track subscription events con segmentación
   */
  async trackSubscriptionEvent(userId, eventType, subscriptionProperties = {}) {
    try {
      const segment = await this.getUserSegment(userId);
      
      if (__DEV__) console.log(`💰 RetentionManager: Tracking subscription ${eventType} for ${segment} user`);
      
      // Track in all services
      await Promise.all([
        // Amplitude
        amplitudeService.trackRetentionEvent(`Subscription_${eventType}`, userId, {
          segment,
          ...subscriptionProperties
        }),
        
        // Firebase
        firebaseRetentionService.trackSubscriptionBySegment(userId, segment, eventType, subscriptionProperties),
        
        // AppsFlyer
        appsFlyerService.trackEvent(`Subscription_${eventType}`, {
          user_id: userId,
          segment: segment,
          ...subscriptionProperties
        })
      ]);
      
      if (__DEV__) console.log(`✅ Subscription ${eventType} tracked for ${segment} user`);
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error tracking subscription event:', error);
    }
  }
  
  /**
   * Track screen views con segmentación
   */
  async trackScreenView(userId, screenName, properties = {}) {
    try {
      const segment = await this.getUserSegment(userId);
      
      // Track in Firebase with segmentation
      await firebaseRetentionService.trackScreenViewBySegment(userId, segment, screenName, properties);
      
      // Track in Amplitude
      await amplitudeService.trackEvent('Screen_Viewed', {
        user_id: userId,
        screen_name: screenName,
        segment: segment,
        ...properties
      });
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error tracking screen view:', error);
    }
  }
  
  /**
   * Analyze engagement and adjust strategy
   */
  async analyzeAndAdjustEngagement(userId) {
    try {
      if (__DEV__) console.log('📈 RetentionManager: Analyzing engagement for user:', userId);
      
      const segment = await this.getUserSegment(userId);
      const analysis = await retentionAdvanced.analyzeEngagementAndAdjust(userId);
      
      if (analysis.success) {
        // Track engagement analysis in Firebase
        await firebaseRetentionService.trackEngagementBySegment(
          userId, 
          analysis.engagement_level, 
          segment,
          { analysis_timestamp: new Date().toISOString() }
        );
        
        if (__DEV__) console.log(`📈 Engagement analyzed: ${analysis.engagement_level} for ${segment} user`);
      }
      
      return analysis;
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error analyzing engagement:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtener segmento de usuario
   */
  async getUserSegment(userId) {
    try {
      const storedSegment = await AsyncStorage.getItem(`${this.SEGMENT_KEY}_${userId}`);
      return storedSegment || 'unknown';
    } catch (error) {
      console.error('🚨 RetentionManager: Error getting user segment:', error);
      return 'unknown';
    }
  }
  
  /**
   * Check if user retention is initialized
   */
  async isUserRetentionInitialized(userId) {
    try {
      const initialized = await AsyncStorage.getItem(`${this.INITIALIZED_KEY}_${userId}`);
      return initialized === 'true';
    } catch (error) {
      console.error('🚨 RetentionManager: Error checking initialization status:', error);
      return false;
    }
  }
  
  /**
   * Get retention summary for user
   */
  async getRetentionSummary(userId) {
    try {
      const segment = await this.getUserSegment(userId);
      const isInitialized = await this.isUserRetentionInitialized(userId);
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      
      return {
        user_id: userId,
        segment: segment,
        is_initialized: isInitialized,
        attribution_data: attributionData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('🚨 RetentionManager: Error getting retention summary:', error);
      return { error: error.message };
    }
  }
}

export default new RetentionManager(); 