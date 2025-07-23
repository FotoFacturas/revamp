// src/utils/retentionAdvanced.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import amplitudeService from '../analytics/amplitude';
import appsFlyerService from '../analytics/appsflyer';
import notificationsService from '../notifications';

/**
 * Servicio avanzado de retención basado en canal de adquisición
 */

// Constantes para retención avanzada
const ADVANCED_RETENTION_KEYS = {
  USER_SEGMENT: 'ADVANCED_RETENTION_USER_SEGMENT',
  FLOW_CONFIG: 'ADVANCED_RETENTION_FLOW_CONFIG',
  ENGAGEMENT_LEVEL: 'ADVANCED_RETENTION_ENGAGEMENT_LEVEL',
  LAST_ANALYSIS: 'ADVANCED_RETENTION_LAST_ANALYSIS'
};

class AdvancedRetentionService {
  
  /**
   * Inicializar retención basada en canal de adquisición
   */
  async initRetentionByChannel(userId, userEmail) {
    try {
      if (__DEV__) console.log('🎯 Initializing advanced retention for user:', userId);
      
      // Get attribution data
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      if (__DEV__) console.log('📊 Attribution data for retention:', attributionData);
      
      // Determine user segment
      const userSegment = this.determineUserSegment(attributionData);
      if (__DEV__) console.log('📊 User segment determined:', userSegment);
      
      // Store segment
      await AsyncStorage.setItem(`${ADVANCED_RETENTION_KEYS.USER_SEGMENT}_${userId}`, userSegment);
      
      // Start appropriate retention flow
      await this.startSegmentedRetentionFlow(userId, userEmail, userSegment, attributionData);
      
      // Track segmentation
      await amplitudeService.trackRetentionEvent('Retention_Segmentation_Applied', userId, {
        segment: userSegment,
        attribution_source: attributionData.attribution_source || 'unknown',
        af_media_source: attributionData.af_media_source,
        af_campaign: attributionData.af_campaign,
        af_status: attributionData.af_status
      });
      
      if (__DEV__) console.log(`✅ Advanced retention started for ${userSegment} user:`, userId);
      return { success: true, segment: userSegment };
      
    } catch (error) {
      console.error('🚨 Error initializing advanced retention:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Determinar segmento de usuario basado en attribution
   */
  determineUserSegment(attributionData) {
    if (__DEV__) console.log('🔍 Determining user segment from attribution:', attributionData);
    
    if (!attributionData || !attributionData.af_status) {
      if (__DEV__) console.log('📊 No attribution data - marking as unknown');
      return 'unknown';
    }
    
    if (attributionData.af_status === 'Non-organic') {
      // Paid user - segment by source
      const source = attributionData.af_media_source?.toLowerCase() || '';
      
      if (__DEV__) console.log('📊 Non-organic user detected, source:', source);
      
      if (source.includes('facebook')) return 'facebook_ads';
      if (source.includes('google')) return 'google_ads'; 
      if (source.includes('tiktok')) return 'tiktok_ads';
      if (source.includes('apple')) return 'apple_search_ads';
      
      return 'paid_other';
    }
    
    if (__DEV__) console.log('📊 Organic user detected');
    return 'organic';
  }
  
  /**
   * Iniciar flujo de retención segmentado
   */
  async startSegmentedRetentionFlow(userId, userEmail, segment, attributionData) {
    try {
      const retentionConfig = this.getRetentionConfigBySegment(segment);
      if (__DEV__) console.log(`📋 Starting ${retentionConfig.name} retention flow for user:`, userId);
      
      // Store config
      await AsyncStorage.setItem(
        `${ADVANCED_RETENTION_KEYS.FLOW_CONFIG}_${userId}`, 
        JSON.stringify(retentionConfig)
      );
      
      // Schedule notifications based on segment
      for (const notification of retentionConfig.notifications) {
        await this.scheduleSegmentedNotification(
          userId, 
          notification, 
          segment, 
          attributionData
        );
      }
      
      // Track flow start
      await amplitudeService.trackRetentionEvent('Segmented_Retention_Flow_Started', userId, {
        segment,
        config_name: retentionConfig.name,
        total_notifications: retentionConfig.notifications.length,
        attribution_source: attributionData.attribution_source || 'unknown'
      });
      
      if (__DEV__) console.log('✅ Segmented retention flow configured successfully');
      
    } catch (error) {
      console.error('🚨 Error starting segmented retention flow:', error);
    }
  }
  
  /**
   * Configuración de retención por segmento
   */
  getRetentionConfigBySegment(segment) {
    const configs = {
      facebook_ads: {
        name: 'Facebook Ads Premium',
        priority: 'high',
        notifications: [
          { 
            day: 0, 
            type: 'welcome_premium', 
            title: '¡Bienvenido!', 
            message: 'Creamos FotoFacturas pensando en ti 🎯',
            action: 'ONBOARDING_PREMIUM'
          },
          { 
            day: 1, 
            type: 'first_ticket_premium', 
            title: 'Tu primera factura', 
            message: 'Te toma solo 30 segundos ⚡',
            action: 'CREATE_FIRST_TICKET'
          },
          { 
            day: 3, 
            type: 'help_offer', 
            title: '¿Necesitas ayuda?', 
            message: 'Estamos aquí para ti 🤝',
            action: 'CONTACT_SUPPORT'
          },
          { 
            day: 7, 
            type: 'advanced_tips', 
            title: 'Tips avanzados', 
            message: 'Maximiza tu ahorro de tiempo 💡',
            action: 'VIEW_TIPS'
          },
          { 
            day: 14, 
            type: 'upgrade_evaluation', 
            title: 'Tu progreso', 
            message: 'Mira cuánto tiempo has ahorrado 📊',
            action: 'VIEW_STATS'
          }
        ]
      },
      
      organic: {
        name: 'Organic Growth',
        priority: 'medium',
        notifications: [
          { 
            day: 0, 
            type: 'welcome_standard', 
            title: '¡Bienvenido!', 
            message: '¡Bienvenido a FotoFacturas! 👋',
            action: 'ONBOARDING_STANDARD'
          },
          { 
            day: 2, 
            type: 'discovery_question', 
            title: 'Ayúdanos a mejorar', 
            message: '¿Cómo nos encontraste? 🔍',
            action: 'FEEDBACK_SURVEY'
          },
          { 
            day: 5, 
            type: 'tutorial_complete', 
            title: 'Tutorial completo', 
            message: 'Domina FotoFacturas en 5 min 📚',
            action: 'VIEW_TUTORIAL'
          },
          { 
            day: 10, 
            type: 'referral_invite', 
            title: 'Invita amigos', 
            message: 'Obtén tickets gratis 🎁',
            action: 'REFER_FRIENDS'
          },
          { 
            day: 21, 
            type: 'conversion_evaluation', 
            title: 'Tu impacto', 
            message: 'Ve el impacto en tu contabilidad 📈',
            action: 'VIEW_IMPACT'
          }
        ]
      },
      
      paid_other: {
        name: 'Paid Premium',
        priority: 'high',
        notifications: [
          { 
            day: 0, 
            type: 'welcome_premium', 
            title: '¡Gracias!', 
            message: '¡Gracias por confiar en nosotros! 🙏',
            action: 'ONBOARDING_PREMIUM'
          },
          { 
            day: 1, 
            type: 'quick_start', 
            title: 'Guía rápida', 
            message: 'Tu primera factura en 2 minutos ⚡',
            action: 'QUICK_START'
          },
          { 
            day: 5, 
            type: 'feature_showcase', 
            title: 'Funciones premium', 
            message: 'Que te van a encantar ⭐',
            action: 'FEATURE_TOUR'
          },
          { 
            day: 12, 
            type: 'roi_calculation', 
            title: 'Tu ROI', 
            message: 'Calcula tu ROI con FotoFacturas 💰',
            action: 'CALCULATE_ROI'
          }
        ]
      },
      
      unknown: {
        name: 'Standard Flow',
        priority: 'low',
        notifications: [
          { 
            day: 0, 
            type: 'welcome_standard', 
            title: '¡Bienvenido!', 
            message: 'Empecemos con FotoFacturas 👋',
            action: 'ONBOARDING_STANDARD'
          },
          { 
            day: 3, 
            type: 'first_ticket_help', 
            title: 'Primera factura', 
            message: '¿Te ayudamos con tu primera factura? 🤝',
            action: 'HELP_FIRST_TICKET'
          },
          { 
            day: 7, 
            type: 'check_progress', 
            title: 'Tu progreso', 
            message: '¿Cómo va tu experiencia? 📊',
            action: 'CHECK_PROGRESS'
          }
        ]
      }
    };
    
    return configs[segment] || configs.unknown;
  }
  
  /**
   * Programar notificación segmentada
   */
  async scheduleSegmentedNotification(userId, notification, segment, attributionData) {
    try {
      // Calculate notification date
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + notification.day);
      
      // Enhanced notification properties
      const notificationData = {
        userId,
        segment,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        action: notification.action,
        scheduledFor: notificationDate.toISOString(),
        attribution_source: attributionData.attribution_source || 'unknown',
        af_media_source: attributionData.af_media_source,
        af_campaign: attributionData.af_campaign
      };
      
      // Schedule with notification service
      await notificationsService.scheduleNotification(
        `retention_${segment}_${notification.type}_${userId}`,
        notification.title,
        notification.message,
        notificationDate,
        { 
          action: notification.action,
          userId,
          segment,
          type: 'retention_segmented'
        }
      );
      
      // Track scheduled notification
      await amplitudeService.trackRetentionEvent('Retention_Notification_Scheduled', userId, {
        notification_type: notification.type,
        segment,
        scheduled_for: notificationDate.toISOString(),
        days_from_signup: notification.day
      });
      
      console.log(`📅 Scheduled ${notification.type} notification for ${segment} user:`, userId);
      
    } catch (error) {
      console.error('🚨 Error scheduling segmented notification:', error);
    }
  }
  
  /**
   * Analizar engagement y ajustar retención
   */
  async analyzeEngagementAndAdjust(userId) {
    try {
      if (__DEV__) console.log('📊 Analyzing engagement for user:', userId);
      
      // Get user behavior data
      const engagementData = await this.getUserEngagementData(userId);
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      const currentSegment = await AsyncStorage.getItem(`${ADVANCED_RETENTION_KEYS.USER_SEGMENT}_${userId}`);
      
      // Determine engagement level
      const engagementLevel = this.calculateEngagementLevel(engagementData);
      
      // Store engagement level
      await AsyncStorage.setItem(`${ADVANCED_RETENTION_KEYS.ENGAGEMENT_LEVEL}_${userId}`, engagementLevel);
      
      // Adjust retention strategy based on engagement
      await this.adjustRetentionStrategy(userId, engagementLevel, attributionData, currentSegment);
      
      // Store analysis timestamp
      await AsyncStorage.setItem(`${ADVANCED_RETENTION_KEYS.LAST_ANALYSIS}_${userId}`, new Date().toISOString());
      
      // Track analysis
      await amplitudeService.trackRetentionEvent('Retention_Strategy_Adjusted', userId, {
        engagement_level: engagementLevel,
        current_segment: currentSegment,
        tickets_created: engagementData.ticketsCreated,
        days_since_last_activity: engagementData.daysSinceLastActivity,
        sessions_this_week: engagementData.sessionsThisWeek,
        attribution_source: attributionData.attribution_source || 'unknown'
      });
      
      console.log(`✅ Engagement analysis completed for ${engagementLevel} user:`, userId);
      return { success: true, engagement_level: engagementLevel };
      
    } catch (error) {
      console.error('🚨 Error analyzing engagement:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtener datos de engagement del usuario
   */
  async getUserEngagementData(userId) {
    // This would typically come from your analytics service or database
    // For now, we'll create a mock implementation
    try {
      // You would replace this with actual data fetching
      const mockData = {
        ticketsCreated: 0, // Get from your API
        daysSinceLastActivity: 0, // Calculate from last app open
        sessionsThisWeek: 0, // Get from analytics
        subscriptionStatus: 'free', // Get from RevenueCat
        lastTicketDate: null, // Get from your API
        totalSessions: 0 // Get from analytics
      };
      
      if (__DEV__) console.log('📊 User engagement data:', mockData);
      return mockData;
      
    } catch (error) {
      console.error('🚨 Error getting user engagement data:', error);
      return {
        ticketsCreated: 0,
        daysSinceLastActivity: 999,
        sessionsThisWeek: 0,
        subscriptionStatus: 'unknown',
        lastTicketDate: null,
        totalSessions: 0
      };
    }
  }
  
  /**
   * Calcular nivel de engagement
   */
  calculateEngagementLevel(engagementData) {
    const { ticketsCreated, daysSinceLastActivity, sessionsThisWeek } = engagementData;
    
    console.log('🔍 Calculating engagement level:', { ticketsCreated, daysSinceLastActivity, sessionsThisWeek });
    
    // Power user
    if (ticketsCreated >= 5 && daysSinceLastActivity <= 2 && sessionsThisWeek >= 4) {
      return 'power_user';
    }
    
    // Active user
    if (ticketsCreated >= 2 && daysSinceLastActivity <= 7 && sessionsThisWeek >= 2) {
      return 'active';
    }
    
    // Moderate user
    if (ticketsCreated >= 1 && daysSinceLastActivity <= 14) {
      return 'moderate';
    }
    
    // At risk
    if (daysSinceLastActivity > 14) {
      return 'at_risk';
    }
    
    return 'inactive';
  }
  
  /**
   * Ajustar estrategia de retención basada en engagement
   */
  async adjustRetentionStrategy(userId, engagementLevel, attributionData, currentSegment) {
    try {
      console.log(`🎯 Adjusting retention strategy for ${engagementLevel} user:`, userId);
      
      const adjustmentActions = {
        power_user: async () => {
          // Reduce notification frequency, focus on advanced features
          await this.scheduleAdvancedFeatureNotifications(userId);
          await this.enableReferralProgram(userId);
        },
        
        active: async () => {
          // Continue standard flow but optimize timing
          await this.optimizeNotificationTiming(userId);
        },
        
        moderate: async () => {
          // Increase engagement notifications
          await this.scheduleEngagementBoostNotifications(userId);
        },
        
        at_risk: async () => {
          // Activate re-engagement campaign
          await this.startReEngagementCampaign(userId);
        },
        
        inactive: async () => {
          // Last chance re-engagement
          await this.startLastChanceReEngagement(userId);
        }
      };
      
      const action = adjustmentActions[engagementLevel];
      if (action) {
        await action();
      }
      
      // Track adjustment
      await amplitudeService.trackRetentionEvent('Retention_Strategy_Adjustment_Applied', userId, {
        engagement_level: engagementLevel,
        current_segment: currentSegment,
        adjustment_type: engagementLevel,
        attribution_source: attributionData.attribution_source || 'unknown'
      });
      
    } catch (error) {
      console.error('🚨 Error adjusting retention strategy:', error);
    }
  }
  
  /**
   * Programar notificaciones de funciones avanzadas
   */
  async scheduleAdvancedFeatureNotifications(userId) {
    // Implementation for power users
    console.log('⭐ Scheduling advanced feature notifications for power user:', userId);
  }
  
  /**
   * Habilitar programa de referidos
   */
  async enableReferralProgram(userId) {
    // Implementation for referral program
    console.log('🎁 Enabling referral program for user:', userId);
  }
  
  /**
   * Optimizar timing de notificaciones
   */
  async optimizeNotificationTiming(userId) {
    // Implementation for timing optimization
    console.log('⏰ Optimizing notification timing for user:', userId);
  }
  
  /**
   * Programar notificaciones de boost de engagement
   */
  async scheduleEngagementBoostNotifications(userId) {
    // Implementation for engagement boost
    console.log('🚀 Scheduling engagement boost notifications for user:', userId);
  }
  
  /**
   * Iniciar campaña de re-engagement
   */
  async startReEngagementCampaign(userId) {
    // Implementation for re-engagement
    console.log('🔄 Starting re-engagement campaign for user:', userId);
  }
  
  /**
   * Iniciar última oportunidad de re-engagement
   */
  async startLastChanceReEngagement(userId) {
    // Implementation for last chance
    console.log('⚠️ Starting last chance re-engagement for user:', userId);
  }
  
  /**
   * Obtener métricas de retención por segmento
   */
  async getRetentionMetricsBySegment() {
    try {
      // This would typically query your analytics service
      // For now, return mock data structure
      return {
        facebook_ads: {
          day1: 0.75,
          day7: 0.45,
          day30: 0.25,
          total_users: 0
        },
        organic: {
          day1: 0.65,
          day7: 0.35,
          day30: 0.20,
          total_users: 0
        },
        paid_other: {
          day1: 0.70,
          day7: 0.40,
          day30: 0.22,
          total_users: 0
        }
      };
    } catch (error) {
      console.error('🚨 Error getting retention metrics:', error);
      return {};
    }
  }
}

// Export singleton instance
export default new AdvancedRetentionService(); 