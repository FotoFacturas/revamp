// src/utils/retention.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import amplitudeService from './analytics/amplitude';
import notificationsService from './notifications';
import { Logger } from './core';
import * as API from '../lib/api';

/**
 * Servicio para gestionar estrategias de retención
 */

// Constantes para la retención
const RETENTION_KEYS = {
  FLOW_STARTED: 'RETENTION_FLOW_STARTED',
  FIRST_TICKET_REMINDER_SENT: 'FIRST_TICKET_REMINDER_SENT',
  SUBSCRIPTION_REMINDER_SENT: 'SUBSCRIPTION_REMINDER_SENT',
  WELCOME_SHOWN: 'WELCOME_TIPS_SHOWN',
  ENGAGEMENT_LAST_DATE: 'ENGAGEMENT_LAST_DATE'
};

/**
 * Inicia el flujo de retención para un nuevo usuario
 */
const startRetentionFlow = async (userId, userEmail) => {
  try {
    // Verificar si ya se inició
    const flowStarted = await AsyncStorage.getItem(`${RETENTION_KEYS.FLOW_STARTED}_${userId}`);
    if (flowStarted === 'true') {
      Logger.info('RETENTION', 'Flujo de retención ya iniciado para el usuario:', userId);
      return false;
    }
    
    // Marcar como iniciado
    await AsyncStorage.setItem(`${RETENTION_KEYS.FLOW_STARTED}_${userId}`, 'true');
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Retention_Flow_Started', {
      user_id: userId,
      email: userEmail
    });
    
    Logger.success('RETENTION', 'Flujo de retención iniciado para usuario:', userId);
    
    // Programar recordatorios
    scheduleFirstTicketReminder(userId);
    scheduleTrialEndReminder(userId);
    
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al iniciar flujo de retención:', error);
    return false;
  }
};

/**
 * Programa un recordatorio para subir el primer ticket
 */
const scheduleFirstTicketReminder = async (userId) => {
  try {
    // Verificar si ya se envió
    const reminderSent = await AsyncStorage.getItem(`${RETENTION_KEYS.FIRST_TICKET_REMINDER_SENT}_${userId}`);
    if (reminderSent === 'true') return;
    
    // Programar recordatorio para 3 días después si no ha subido ticket
    setTimeout(async () => {
      try {
        // Verificar si ha subido ticket
        const userInfo = await API.accountsUserInfo(userId);
        const hasUploadedTicket = userInfo?.user?.tickets_count > 0;
        
        if (!hasUploadedTicket) {
          // Enviar notificación push
          notificationsService.sendLocalNotification(
            '¡Hola! Aún no has subido tu primer ticket',
            'Empieza a facturar automáticamente con solo una foto',
            { action: 'ADD_TICKET', userId }
          );
          
          // Registrar en Amplitude
          amplitudeService.trackEvent('First_Ticket_Reminder_Sent', {
            user_id: userId,
            channel: 'push_notification',
            days_after_signup: 3
          });
          
          // Marcar como enviado
          await AsyncStorage.setItem(`${RETENTION_KEYS.FIRST_TICKET_REMINDER_SENT}_${userId}`, 'true');
        }
      } catch (error) {
        Logger.error('RETENTION', 'Error al enviar recordatorio de primer ticket:', error);
      }
    }, 3 * 24 * 60 * 60 * 1000); // 3 días
    
    Logger.info('RETENTION', 'Recordatorio de primer ticket programado para usuario:', userId);
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al programar recordatorio de primer ticket:', error);
    return false;
  }
};

/**
 * Programa un recordatorio para el fin de prueba
 */
const scheduleTrialEndReminder = async (userId) => {
  try {
    // Verificar si ya se envió
    const reminderSent = await AsyncStorage.getItem(`${RETENTION_KEYS.SUBSCRIPTION_REMINDER_SENT}_${userId}`);
    if (reminderSent === 'true') return;
    
    // Programar recordatorio para 5 días después
    setTimeout(async () => {
      try {
        // Verificar si ya tiene suscripción
        const customerInfo = await API.getCustomerInfo(userId);
        const hasActiveSubscription = customerInfo?.entitlements?.active && 
                                     Object.keys(customerInfo.entitlements.active).length > 0;
        
        if (!hasActiveSubscription) {
          // Enviar notificación push
          notificationsService.sendLocalNotification(
            'Tu prueba gratuita está por terminar',
            'Suscríbete ahora para seguir facturando automáticamente',
            { action: 'VIEW_SUBSCRIPTION', userId }
          );
          
          // Registrar en Amplitude
          amplitudeService.trackEvent('Trial_End_Reminder_Sent', {
            user_id: userId,
            channel: 'push_notification',
            days_after_signup: 5
          });
          
          // Marcar como enviado
          await AsyncStorage.setItem(`${RETENTION_KEYS.SUBSCRIPTION_REMINDER_SENT}_${userId}`, 'true');
        }
      } catch (error) {
        Logger.error('RETENTION', 'Error al enviar recordatorio de fin de prueba:', error);
      }
    }, 5 * 24 * 60 * 60 * 1000); // 5 días
    
    Logger.info('RETENTION', 'Recordatorio de fin de prueba programado para usuario:', userId);
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al programar recordatorio de fin de prueba:', error);
    return false;
  }
};

/**
 * Muestra tips de bienvenida para nuevos usuarios
 */
const showWelcomeTips = async (userId, navigation) => {
  try {
    // Verificar si ya se mostró
    const tipsShown = await AsyncStorage.getItem(`${RETENTION_KEYS.WELCOME_SHOWN}_${userId}`);
    if (tipsShown === 'true') return false;
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Welcome_Tips_Shown', {
      user_id: userId
    });
    
    // Marcar como mostrado
    await AsyncStorage.setItem(`${RETENTION_KEYS.WELCOME_SHOWN}_${userId}`, 'true');
    
    // Aquí iría la lógica para mostrar los tips
    // Por ejemplo, a través de un modal o notificación
    
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al mostrar tips de bienvenida:', error);
    return false;
  }
};

/**
 * Maneja el evento de primer ticket subido
 */
const handleFirstTicketUploaded = async (userId, ticketId) => {
  try {
    // Enviar notificación de celebración
    notificationsService.sendLocalNotification(
      '¡Felicidades! 🎉',
      'Has subido tu primer ticket. Te avisaremos cuando esté lista tu factura.',
      { action: 'VIEW_TICKET', ticketId }
    );
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('First_Ticket_Celebration_Shown', {
      user_id: userId,
      ticket_id: ticketId
    });
    
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al manejar evento de primer ticket:', error);
    return false;
  }
};

/**
 * Actualiza la fecha de última interacción
 */
const updateLastEngagementDate = async (userId) => {
  try {
    await AsyncStorage.setItem(`${RETENTION_KEYS.ENGAGEMENT_LAST_DATE}_${userId}`, new Date().toISOString());
    
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al actualizar fecha de último engagement:', error);
    return false;
  }
};

/**
 * Verifica si un usuario está inactivo
 */
const isUserInactive = async (userId, days = 7) => {
  try {
    const lastDate = await AsyncStorage.getItem(`${RETENTION_KEYS.ENGAGEMENT_LAST_DATE}_${userId}`);
    if (!lastDate) return true;
    
    const lastEngagement = new Date(lastDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastEngagement);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > days;
  } catch (error) {
    Logger.error('RETENTION', 'Error al verificar inactividad del usuario:', error);
    return false;
  }
};

/**
 * Envía recordatorio a usuarios inactivos
 */
const sendInactiveUserReminder = async (userId) => {
  try {
    // Verificar si está inactivo
    const inactive = await isUserInactive(userId);
    if (!inactive) return false;
    
    // Enviar notificación
    notificationsService.sendLocalNotification(
      '¡Te extrañamos!',
      'Vuelve a Fotofacturas y sigue ahorrando tiempo en tus facturas',
      { action: 'REENGAGEMENT', userId }
    );
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Inactive_User_Reminder_Sent', {
      user_id: userId,
      days_inactive: await getInactiveDays(userId)
    });
    
    return true;
  } catch (error) {
    Logger.error('RETENTION', 'Error al enviar recordatorio a usuario inactivo:', error);
    return false;
  }
};

/**
 * Obtiene días de inactividad
 */
const getInactiveDays = async (userId) => {
  try {
    const lastDate = await AsyncStorage.getItem(`${RETENTION_KEYS.ENGAGEMENT_LAST_DATE}_${userId}`);
    if (!lastDate) return 999; // Un valor alto por defecto
    
    const lastEngagement = new Date(lastDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastEngagement);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    Logger.error('RETENTION', 'Error al obtener días de inactividad:', error);
    return 0;
  }
};

/**
 * Notifica cuando un usuario está cerca del límite de tickets
 */
const checkTicketLimitAndNotify = async (userId, currentCount, maxCount) => {
  try {
    // Calcular porcentaje de uso
    const usagePercentage = (currentCount / maxCount) * 100;
    
    // Notificar si está por encima del 80%
    if (usagePercentage >= 80) {
      notificationsService.sendLocalNotification(
        'Estás por alcanzar tu límite de tickets',
        `Has usado ${currentCount} de ${maxCount} tickets este mes. Considera actualizar tu plan.`,
        { action: 'VIEW_SUBSCRIPTION', userId }
      );
      
      // Registrar en Amplitude
      amplitudeService.trackEvent('Ticket_Limit_Warning', {
        user_id: userId,
        current_count: currentCount,
        max_count: maxCount,
        usage_percentage: usagePercentage
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    Logger.error('RETENTION', 'Error al verificar límite de tickets:', error);
    return false;
  }
};

export default {
  startRetentionFlow,
  scheduleFirstTicketReminder,
  scheduleTrialEndReminder,
  showWelcomeTips,
  handleFirstTicketUploaded,
  updateLastEngagementDate,
  isUserInactive,
  sendInactiveUserReminder,
  checkTicketLimitAndNotify
};