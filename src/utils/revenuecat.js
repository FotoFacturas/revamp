// src/utils/revenuecat.js
import Purchases from 'react-native-purchases';
import amplitudeService from './analytics/amplitude';
import { Platform } from 'react-native';

/**
 * Configuración e inicialización de RevenueCat con integración de Amplitude
 */
const setupRevenueCatSDK = async () => {
  const revCatApiKey = Platform.select({
    ios: 'appl_SjFjwBVBbOjasgVEXvVdDtACpVY',
    android: 'goog_CvNNBMJJgEFGOAATpkSamzAGexf',
  });

  if (__DEV__) {
    Purchases.setDebugLogsEnabled(true);
  }

  try {
    await Purchases.configure({
      apiKey: revCatApiKey,
      observerMode: false
    });

    // Configurar integración con Amplitude para seguimiento de eventos
    setupPurchaseEventTracking();

    const offerings = await Purchases.getOfferings();
    if (__DEV__) {
      console.log('✅ RevenueCat SDK configurado correctamente');
      console.log('Ofertas actuales:', offerings.current);
    }
    
    return offerings;
  } catch (error) {
    console.error('🚨 Error en configuración de RevenueCat:', error);
    amplitudeService.trackEvent('RevenueCat_Setup_Failed', {
      error: error.message || 'Unknown error'
    });
    return null;
  }
};

/**
 * Configurar escucha de eventos de compra/renovación de RevenueCat
 */
const setupPurchaseEventTracking = () => {
  // Escuchar cambios en la información del cliente
  Purchases.addCustomerInfoUpdateListener((info) => {
    // Cuando hay un cambio en suscripciones
    const activeEntitlements = Object.keys(info.entitlements?.active || {});
    
    if (activeEntitlements.length > 0) {
      // Rastrear derechos activos
      amplitudeService.trackEvent('Active_Entitlements_Updated', {
        entitlements: activeEntitlements,
        active_subscriptions: info.activeSubscriptions || [],
        latest_expiration_date: info.latestExpirationDate
          ? new Date(info.latestExpirationDate * 1000).toISOString()
          : null
      });
      
      // Actualizar propiedades del usuario
      amplitudeService.instance.setUserProperties({
        has_active_subscription: true,
        subscription_plan: activeEntitlements[0], // Plan principal
        subscription_expiry: info.latestExpirationDate
          ? new Date(info.latestExpirationDate * 1000).toISOString()
          : null
      });
    } else {
      // No hay suscripciones activas
      amplitudeService.instance.setUserProperties({
        has_active_subscription: false
      });
    }
  });
};

/**
 * Iniciar sesión de usuario en RevenueCat
 */
const loginUser = async (userId) => {
  if (!userId) {
    console.error('⚠️ Se requiere ID de usuario para iniciar sesión en RevenueCat');
    return null;
  }
  
  try {
    const { customerInfo, created } = await Purchases.logIn(userId);
    
    // Rastrea el inicio de sesión exitoso
    amplitudeService.trackEvent('RevenueCat_Login_Success', {
      is_new_customer: created,
      has_active_subscription: Object.keys(customerInfo.entitlements?.active || {}).length > 0
    });
    
    return customerInfo;
  } catch (error) {
    amplitudeService.trackEvent('RevenueCat_Login_Failed', {
      error: error.message || 'Unknown error'
    });
    console.error('🚨 Error al iniciar sesión en RevenueCat:', error);
    return null;
  }
};

/**
 * Comprar un paquete de suscripción
 */
const purchasePackage = async (packageItem) => {
  try {
    // Rastrear inicio de flujo de compra
    amplitudeService.trackEvent('Purchase_Flow_Started', {
      package_id: packageItem.identifier,
      offering_id: packageItem.offeringIdentifier,
      product_id: packageItem.product.identifier,
      price: packageItem.product.price,
      currency: packageItem.product.currencyCode
    });
    
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageItem);
    
    // Rastrear compra exitosa
    amplitudeService.trackEvent('Purchase_Completed', {
      product_id: productIdentifier,
      entitlements: Object.keys(customerInfo.entitlements?.active || {}),
      price: packageItem.product.price,
      currency: packageItem.product.currencyCode,
      is_trial: packageItem.product.introPrice != null
    });
    
    return { success: true, customerInfo };
  } catch (error) {
    // Si el usuario canceló, no es realmente un error
    if (error.userCancelled) {
      amplitudeService.trackEvent('Purchase_Cancelled', {
        package_id: packageItem.identifier,
        offering_id: packageItem.offeringIdentifier
      });
      return { success: false, cancelled: true };
    }
    
    // Rastrear error en la compra
    amplitudeService.trackEvent('Purchase_Failed', {
      package_id: packageItem.identifier,
      error_code: error.code,
      error_message: error.message
    });
    
    return { success: false, error };
  }
};

/**
 * Comprar un producto de la tienda
 */
const purchaseStoreProduct = async (product) => {
  try {
    // Rastrear inicio de flujo de compra
    amplitudeService.trackEvent('Store_Purchase_Started', {
      product_id: product.identifier,
      price: product.price,
      currency: product.currencyCode
    });
    
    const purchase = await Purchases.purchaseStoreProduct(product);
    
    // Rastrear compra exitosa
    amplitudeService.trackEvent('Store_Purchase_Completed', {
      product_id: product.identifier,
      entitlements: Object.keys(purchase.customerInfo.entitlements?.active || {}),
      price: product.price,
      currency: product.currencyCode
    });
    
    return purchase;
  } catch (error) {
    // Si el usuario canceló, no es realmente un error
    if (error.userCancelled) {
      amplitudeService.trackEvent('Store_Purchase_Cancelled', {
        product_id: product.identifier
      });
      return null;
    }
    
    // Rastrear error en la compra
    amplitudeService.trackEvent('Store_Purchase_Failed', {
      product_id: product.identifier,
      error_code: error.code,
      error_message: error.message
    });
    
    throw error;
  }
};

/**
 * Restaurar compras del usuario
 */
const restorePurchases = async () => {
  try {
    amplitudeService.trackEvent('Restore_Purchases_Started');
    
    const customerInfo = await Purchases.restorePurchases();
    const hasActiveSubscription = Object.keys(customerInfo.entitlements?.active || {}).length > 0;
    
    amplitudeService.trackEvent('Restore_Purchases_Completed', {
      has_active_subscription: hasActiveSubscription,
      active_entitlements: Object.keys(customerInfo.entitlements?.active || {})
    });
    
    return { success: true, customerInfo, hasActiveSubscription };
  } catch (error) {
    amplitudeService.trackEvent('Restore_Purchases_Failed', {
      error: error.message || 'Unknown error'
    });
    
    return { success: false, error };
  }
};

/**
 * Comprobar si un usuario tiene derecho a una función premium
 */
const checkEntitlement = async (entitlementId) => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement = customerInfo.entitlements.active[entitlementId] !== undefined;
    
    // Opcionalmente rastrea la comprobación de derechos
    amplitudeService.trackEvent('Entitlement_Check', {
      entitlement_id: entitlementId,
      has_entitlement: hasEntitlement
    });
    
    return hasEntitlement;
  } catch (error) {
    console.error(`Error comprobando derecho ${entitlementId}:`, error);
    return false;
  }
};

/**
 * Obtener información acerca del límite de tickets mensuales
 */
const getTicketLimitInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements = customerInfo.entitlements.active;
    
    // Mapeo de derechos a límites de tickets
    const entitlementLimits = {
      'entitlement_empresarial': 100,
      'entitlement_individual': 60,
      '100_tickets_mensuales': 30,
      'entitlement_ahorro': 10
    };
    
    // Encontrar el derecho activo con el límite más alto
    let highestLimit = 0;
    let activePlan = null;
    
    for (const [entitlement, limit] of Object.entries(entitlementLimits)) {
      if (entitlements[entitlement] && limit > highestLimit) {
        highestLimit = limit;
        activePlan = entitlement;
      }
    }
    
    return {
      hasSubscription: highestLimit > 0,
      ticketLimit: highestLimit,
      planType: activePlan,
      customerInfo
    };
  } catch (error) {
    console.error('Error obteniendo información de límite de tickets:', error);
    
    amplitudeService.trackEvent('Ticket_Limit_Check_Failed', {
      error: error.message || 'Unknown error'
    });
    
    return {
      hasSubscription: false,
      ticketLimit: 0,
      planType: null,
      error: error.message
    };
  }
};

/**
 * Mostrar la pantalla de paywall
 */
const showPaywall = async (navigation, source) => {
  amplitudeService.trackEvent('Paywall_Shown', {
    source: source || 'manual',
    platform: Platform.OS
  });
  
  navigation.navigate('paywallScreenV2');
};

/**
 * Formatear precio para mostrar
 */
const formatPrice = (price, currencyCode) => {
  if (!price) return '';
  
  try {
    // Para México (MXN)
    if (currencyCode === 'MXN') {
      return `$${parseFloat(price).toFixed(2)} MXN`;
    }
    
    // Para dólares (USD)
    if (currencyCode === 'USD') {
      return `$${parseFloat(price).toFixed(2)} USD`;
    }
    
    // Otros casos
    return `${parseFloat(price).toFixed(2)} ${currencyCode}`;
  } catch (e) {
    return `${price} ${currencyCode}`;
  }
};

export default {
  setupRevenueCatSDK,
  loginUser,
  purchasePackage,
  purchaseStoreProduct,
  restorePurchases,
  checkEntitlement,
  getTicketLimitInfo,
  showPaywall,
  formatPrice
};