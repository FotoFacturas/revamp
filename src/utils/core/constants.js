// src/utils/core/constants.js
// Constantes comunes de la aplicación

// Storage keys
export const STORAGE_KEYS = {
  // UTM y Attribution
  UTM_DATA: 'fotofacturas_utm_data',
  ATTRIBUTION_DATA: 'fotofacturas_attribution_data',
  APPSFLYER_ATTRIBUTION: 'fotofacturas_appsflyer_attribution',
  APPSFLYER_UTM: 'fotofacturas_appsflyer_utm_data',
  
  // Retention
  ADVANCED_RETENTION_USER_SEGMENT: 'ADVANCED_RETENTION_USER_SEGMENT',
  ADVANCED_RETENTION_FLOW_CONFIG: 'ADVANCED_RETENTION_FLOW_CONFIG',
  ADVANCED_RETENTION_ENGAGEMENT_LEVEL: 'ADVANCED_RETENTION_ENGAGEMENT_LEVEL',
  ADVANCED_RETENTION_LAST_ANALYSIS: 'ADVANCED_RETENTION_LAST_ANALYSIS',
  RETENTION_MANAGER_INITIALIZED: 'RETENTION_MANAGER_INITIALIZED',
  
  // User data
  USER_SESSION: 'user_session',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed'
};

// Platform constants
export const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android'
};

// Analytics event names
export const ANALYTICS_EVENTS = {
  // App lifecycle
  APP_OPENED: 'App_Opened',
  APP_FOREGROUND: 'App_Foreground',
  APP_BACKGROUND: 'App_Background',
  
  // User actions
  USER_LOGIN: 'User_Login',
  USER_LOGOUT: 'User_Logout',
  USER_SIGNUP: 'User_Signup',
  
  // Ticket events
  TICKET_CREATED: 'Ticket_Created',
  FIRST_TICKET_CREATED: 'First_Ticket_Created',
  TICKET_UPLOADED: 'Ticket_Uploaded',
  
  // Subscription events
  SUBSCRIPTION_STARTED: 'Subscription_Started',
  SUBSCRIPTION_RENEWED: 'Subscription_Renewed',
  SUBSCRIPTION_CANCELLED: 'Subscription_Cancelled',
  
  // Retention events
  RETENTION_INITIALIZED: 'Retention_Initialized',
  RETENTION_SEGMENTATION_APPLIED: 'Retention_Segmentation_Applied',
  ENGAGEMENT_ANALYZED: 'Engagement_Analyzed'
};

// User segments
export const USER_SEGMENTS = {
  ORGANIC: 'organic',
  FACEBOOK_ADS: 'facebook_ads',
  GOOGLE_ADS: 'google_ads',
  TIKTOK_ADS: 'tiktok_ads',
  APPLE_SEARCH_ADS: 'apple_search_ads',
  PAID_OTHER: 'paid_other',
  UNKNOWN: 'unknown'
};

// Engagement levels
export const ENGAGEMENT_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  CHURN_RISK: 'churn_risk'
};

// Attribution sources
export const ATTRIBUTION_SOURCES = {
  APPSFLYER: 'appsflyer',
  APPLE_SEARCH_ADS: 'apple_search_ads',
  FACEBOOK: 'facebook',
  GOOGLE: 'google'
};

// Time constants
export const TIME_CONSTANTS = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH_MS: 30 * 24 * 60 * 60 * 1000,
  
  // Retention windows
  ATTRIBUTION_WINDOW_DAYS: 7,
  ENGAGEMENT_ANALYSIS_INTERVAL_DAYS: 3,
  RE_ENGAGEMENT_WINDOW_DAYS: 14
};

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.fotofacturas.com',
  TICKETS: '/api/tickets',
  USERS: '/api/users',
  SUBSCRIPTIONS: '/api/subscriptions',
  ANALYTICS: '/api/analytics'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor intenta nuevamente.',
  UPLOAD_ERROR: 'Error al subir el archivo. Por favor intenta nuevamente.',
  AUTH_ERROR: 'Error de autenticación. Por favor inicia sesión nuevamente.',
  SUBSCRIPTION_ERROR: 'Error con la suscripción. Por favor contacta soporte.',
  GENERAL_ERROR: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.'
}; 