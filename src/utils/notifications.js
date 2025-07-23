// src/utils/notifications.js
//import { Notifications } from 'react-native-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import amplitudeService from './analytics/amplitude';
import * as API from '../lib/api';

/**
 * Configura las notificaciones para la aplicación
 */
const setupNotifications = async (userId) => {
  // Registrar para notificaciones remotas
  Notifications.registerRemoteNotifications();
  
  // Listener para token recibido
  Notifications.events().registerRemoteNotificationsRegistered((event) => {
    console.log('✅ Notificaciones registradas con éxito:', event.deviceToken);
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Push_Token_Registered', {
      token_length: event.deviceToken?.length || 0,
      user_id: userId
    });
    
    // Enviar token al servidor
    if (userId) {
      API.updateDevicePushToken(userId, event.deviceToken);
    }
  });
  
  // Listener para error de registro
  Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
    console.error('🚨 Error al registrar notificaciones:', event);
    
    amplitudeService.trackEvent('Push_Token_Registration_Failed', {
      error: event.message || 'Unknown error',
      user_id: userId
    });
  });
  
  // Listener para notificación recibida en primer plano
  Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
    console.log('📬 Notificación recibida en primer plano:', notification);
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Notification_Received_Foreground', {
      notification_title: notification.title,
      notification_body: notification.body,
      notification_data: notification.payload?.data || {},
      user_id: userId
    });
    
    // Actualizar contador de notificaciones no leídas
    incrementUnreadNotifications();
    
    // Completar procesamiento
    completion({alert: true, sound: true, badge: true});
  });
  
  // Listener para notificación recibida en segundo plano
  Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
    console.log('📬 Notificación recibida en segundo plano:', notification);
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Notification_Received_Background', {
      notification_title: notification.title,
      notification_body: notification.body,
      notification_data: notification.payload?.data || {},
      user_id: userId
    });
    
    // Completar procesamiento
    completion({alert: true, sound: true, badge: true});
  });
  
  // Listener para notificación abierta
  Notifications.events().registerNotificationOpened((notification, completion) => {
    console.log('👆 Notificación abierta:', notification);
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Notification_Opened', {
      notification_title: notification.title,
      notification_body: notification.body,
      notification_data: notification.payload?.data || {},
      user_id: userId
    });
    
    // Procesar acción de la notificación
    processNotificationAction(notification);
    
    // Marcar como leída y actualizar contador
    markNotificationAsRead(notification.identifier);
    
    completion();
  });
  
  // Verificar si ya se han solicitado permisos
  const hasRequestedPermissions = await isNotificationsPermissionsRequested();
  
  return hasRequestedPermissions;
};

/**
 * Verifica si ya se han solicitado permisos de notificaciones
 */
const isNotificationsPermissionsRequested = async () => {
  try {
    const value = await AsyncStorage.getItem('NOTIFICATIONS_PERMISSIONS_REQUESTED');
    return value === 'true';
  } catch (error) {
    console.error('Error al verificar permisos de notificaciones:', error);
    return false;
  }
};

/**
 * Marca que se han solicitado permisos de notificaciones
 */
const setNotificationsPermissionsRequested = async () => {
  try {
    await AsyncStorage.setItem('NOTIFICATIONS_PERMISSIONS_REQUESTED', 'true');
    return true;
  } catch (error) {
    console.error('Error al guardar estado de permisos de notificaciones:', error);
    return false;
  }
};

/**
 * Solicita permisos de notificaciones al usuario
 */
const requestNotificationsPermissions = async (userId) => {
  // Si ya se solicitaron, no volver a pedir
  if (await isNotificationsPermissionsRequested()) {
    return true;
  }
  
  // Marcar como solicitados
  await setNotificationsPermissionsRequested();
  
  // Registrar en Amplitude
  amplitudeService.trackEvent('Push_Permission_Requested', {
    user_id: userId
  });
  
  // Solicitar permisos a nivel de SO
  Notifications.registerRemoteNotifications();
  
  return true;
};

/**
 * Envía una notificación local
 */
const sendLocalNotification = (title, body, data = {}) => {
  Notifications.postLocalNotification({
    title,
    body,
    data,
    silent: false
  });
  
  // Registrar en Amplitude
  amplitudeService.trackEvent('Local_Notification_Sent', {
    notification_title: title,
    notification_body: body,
    notification_data: data
  });
};

/**
 * Incrementa el contador de notificaciones no leídas
 */
const incrementUnreadNotifications = async () => {
  try {
    const currentCount = await AsyncStorage.getItem('UNREAD_NOTIFICATIONS_COUNT');
    const newCount = (parseInt(currentCount) || 0) + 1;
    await AsyncStorage.setItem('UNREAD_NOTIFICATIONS_COUNT', newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error al incrementar notificaciones no leídas:', error);
    return 0;
  }
};

/**
 * Marca una notificación como leída
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    // Aquí podría haber una lógica para marcar la notificación específica
    // Por ahora solo decrementar el contador
    const currentCount = await AsyncStorage.getItem('UNREAD_NOTIFICATIONS_COUNT');
    const newCount = Math.max((parseInt(currentCount) || 0) - 1, 0);
    await AsyncStorage.setItem('UNREAD_NOTIFICATIONS_COUNT', newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return 0;
  }
};

/**
 * Obtiene el número de notificaciones no leídas
 */
const getUnreadNotificationsCount = async () => {
  try {
    const count = await AsyncStorage.getItem('UNREAD_NOTIFICATIONS_COUNT');
    return parseInt(count) || 0;
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    return 0;
  }
};

/**
 * Procesa la acción de una notificación
 */
const processNotificationAction = (notification) => {
  const data = notification.payload?.data || {};
  const action = data.action;
  
  if (!action) return;
  
  // Registrar acción en Amplitude
  amplitudeService.trackEvent('Notification_Action_Processed', {
    action,
    notification_data: data
  });
  
  // Aquí podrías implementar la lógica para navegar a diferentes pantallas
  // según el tipo de acción (por ejemplo, ver un ticket, actualizar suscripción, etc.)
  
  // Este es un ejemplo que deberías adaptar a tu navegación:
  /*
  const navigationRef = require('../navigation/navigationRef').default;
  
  switch (action) {
    case 'VIEW_TICKET':
      if (data.ticketId) {
        navigationRef.navigate('invoiceScreen', { 
          invoiceID: data.ticketId 
        });
      }
      break;
    case 'VIEW_SUBSCRIPTION':
      navigationRef.navigate('paywallScreenV2');
      break;
    case 'ADD_TICKET':
      navigationRef.navigate('mainScreen', {}, {
        onComplete: () => {
          // Simular click en botón de agregar
          setTimeout(() => {
            // Lógica para activar el botón de agregar
          }, 500);
        }
      });
      break;
    default:
      break;
  }
  */
};

/**
 * Programa una notificación para una fecha específica
 * Esta función es requerida por el sistema de retención avanzada
 */
const scheduleNotification = async (notificationId, title, body, scheduledDate, data = {}) => {
  try {
    console.log(`📅 Scheduling notification: ${notificationId} for ${scheduledDate}`);
    
    // Calcular el delay en milisegundos
    const now = new Date();
    const scheduledTime = new Date(scheduledDate);
    const delay = scheduledTime.getTime() - now.getTime();
    
    // Si la fecha ya pasó, no programar
    if (delay <= 0) {
      console.log(`⚠️ Notification ${notificationId} scheduled date has passed, skipping`);
      return false;
    }
    
    // Guardar la notificación programada en AsyncStorage para persistencia
    const scheduledNotification = {
      id: notificationId,
      title,
      body,
      scheduledDate,
      data,
      createdAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(
      `SCHEDULED_NOTIFICATION_${notificationId}`, 
      JSON.stringify(scheduledNotification)
    );
    
    // Programar notificación local usando setTimeout
    // Nota: En producción, deberías usar react-native-push-notification o similar
    // para notificaciones programadas más robustas
    const timeoutId = setTimeout(() => {
      sendLocalNotification(title, body, {
        ...data,
        notificationId,
        scheduledDate: scheduledDate,
        type: 'scheduled_retention'
      });
      
      // Limpiar la notificación programada después de enviarla
      AsyncStorage.removeItem(`SCHEDULED_NOTIFICATION_${notificationId}`);
    }, delay);
    
    // Guardar el timeout ID para poder cancelarlo si es necesario
    await AsyncStorage.setItem(
      `NOTIFICATION_TIMEOUT_${notificationId}`, 
      timeoutId.toString()
    );
    
    // Registrar en Amplitude
    amplitudeService.trackEvent('Notification_Scheduled', {
      notification_id: notificationId,
      title,
      body,
      scheduled_date: scheduledDate,
      delay_ms: delay,
      notification_data: data,
      type: 'retention_segmented'
    });
    
    console.log(`✅ Notification ${notificationId} scheduled successfully for ${scheduledDate}`);
    return true;
    
  } catch (error) {
    console.error(`🚨 Error scheduling notification ${notificationId}:`, error);
    
    // Registrar error en Amplitude
    amplitudeService.trackEvent('Notification_Scheduling_Error', {
      notification_id: notificationId,
      error: error.message,
      scheduled_date: scheduledDate
    });
    
    return false;
  }
};

/**
 * Cancela una notificación programada
 */
const cancelScheduledNotification = async (notificationId) => {
  try {
    console.log(`🚫 Canceling scheduled notification: ${notificationId}`);
    
    // Obtener el timeout ID
    const timeoutId = await AsyncStorage.getItem(`NOTIFICATION_TIMEOUT_${notificationId}`);
    
    if (timeoutId) {
      // Cancelar el timeout
      clearTimeout(parseInt(timeoutId));
      
      // Limpiar datos almacenados
      await AsyncStorage.removeItem(`NOTIFICATION_TIMEOUT_${notificationId}`);
      await AsyncStorage.removeItem(`SCHEDULED_NOTIFICATION_${notificationId}`);
      
      console.log(`✅ Notification ${notificationId} canceled successfully`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`🚨 Error canceling notification ${notificationId}:`, error);
    return false;
  }
};

/**
 * Obtiene todas las notificaciones programadas
 */
const getScheduledNotifications = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const scheduledKeys = keys.filter(key => key.startsWith('SCHEDULED_NOTIFICATION_'));
    
    const scheduledNotifications = [];
    
    for (const key of scheduledKeys) {
      const notificationData = await AsyncStorage.getItem(key);
      if (notificationData) {
        scheduledNotifications.push(JSON.parse(notificationData));
      }
    }
    
    return scheduledNotifications;
  } catch (error) {
    console.error('🚨 Error getting scheduled notifications:', error);
    return [];
  }
};

export default {
  setupNotifications,
  isNotificationsPermissionsRequested,
  setNotificationsPermissionsRequested,
  requestNotificationsPermissions,
  sendLocalNotification,
  scheduleNotification,
  cancelScheduledNotification,
  getScheduledNotifications,
  getUnreadNotificationsCount
};