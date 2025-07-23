# Facebook Business Manager + AppsFlyer Configuration
## FotoFacturas - Sistema de Attribution Completo

### STATUS ACTUAL ✅
- **AppsFlyer SDK**: Funcionando 100%
- **Dev Key**: `bETPLgmuc8ek4NDFhvWin7`
- **Events Tracking**: Screen_Viewed, conversion data
- **Attribution Detection**: Funcionando
- **Dual Tracking**: Con Amplitude integrado

---

## 1. CONFIGURACIÓN FACEBOOK BUSINESS MANAGER

### 1.1 Crear Facebook Business Manager
```
1. Ir a business.facebook.com
2. Crear nuevo Business Manager: "FotoFacturas Business"
3. Configurar información de contacto y verificación
4. Agregar dominio: fotofacturas.ai
```

### 1.2 Configurar Apps en Facebook
```
iOS App:
- Bundle ID: com.fotofactura
- App Store ID: 1590322939
- Platform: iOS

Android App:
- Package Name: com.fotofactura
- Play Store ID: [Buscar en Google Play]
- Platform: Android
```

### 1.3 Configurar Pixel de Facebook
```
1. Crear Pixel: "FotoFacturas_Pixel"
2. Pixel ID: [Generado automáticamente]
3. Configurar eventos personalizados:
   - Ticket_Created (conversión principal)
   - rc_renewal_event (evento de renovación)
   - Subscription_Status_Updated
   - Purchase_Completed
```

---

## 2. CONEXIÓN APPSFLYER + FACEBOOK

### 2.1 Configuración en AppsFlyer Dashboard
```
1. Ir a AppsFlyer Dashboard
2. Seleccionar app: FotoFacturas
3. Integrations > Facebook Ads
4. Configurar:
   - Facebook App ID: [ID de la app de Facebook]
   - Facebook App Secret: [Secret de la app]
   - Enable Facebook Attribution: ✅
   - Enable Facebook Cost Data: ✅
```

### 2.2 Configurar Eventos de Conversión
```javascript
// Eventos principales para Facebook Ads
const FACEBOOK_CONVERSION_EVENTS = {
  // Evento principal de conversión
  'Ticket_Created': {
    value: 'ticket_amount',
    currency: 'MXN',
    content_type: 'product',
    content_category: 'invoice_automation'
  },
  
  // Evento de renovación de suscripción
  'rc_renewal_event': {
    value: 'subscription_price',
    currency: 'MXN',
    content_type: 'subscription',
    content_category: 'renewal'
  },
  
  // Evento de compra inicial
  'Purchase_Completed': {
    value: 'price',
    currency: 'MXN',
    content_type: 'subscription',
    content_category: 'initial_purchase'
  },
  
  // Evento de suscripción activa
  'Subscription_Status_Updated': {
    content_type: 'subscription',
    content_category: 'status_change'
  }
};
```

### 2.3 Configurar Attribution Windows
```
AppsFlyer Attribution Windows:
- View-through: 1 día
- Click-through: 7 días
- Install: 7 días

Facebook Attribution Windows:
- 1-day click
- 7-day click
- 1-day view
- 7-day view
```

---

## 3. ESTRUCTURA DE CAMPAÑAS FACEBOOK ADS

### 3.1 Campaña Principal: App Installs
```
Campaña: "FotoFacturas_App_Installs"
Objetivo: App Installs
Presupuesto: $50/día
Optimización: Cost per Install
```

### 3.2 Ad Sets por Audiencia
```
Ad Set 1: "Freelancers_Mexico"
- Audiencia: Freelancers en México
- Edad: 25-45
- Intereses: Freelancing, Invoicing, Business
- Ubicación: México
- Presupuesto: $20/día

Ad Set 2: "Small_Business_Mexico"
- Audiencia: Pequeñas empresas
- Edad: 30-50
- Intereses: Small Business, Accounting, Taxes
- Ubicación: México
- Presupuesto: $20/día

Ad Set 3: "Lookalike_Existing_Users"
- Audiencia: Lookalike 1% de usuarios existentes
- Ubicación: México
- Presupuesto: $10/día
```

### 3.3 Campaña de Conversión: Ticket Creation
```
Campaña: "FotoFacturas_Ticket_Conversion"
Objetivo: Conversions
Evento de conversión: Ticket_Created
Presupuesto: $30/día
Optimización: Cost per Action
```

### 3.4 Campaña de Retención: Subscription Renewal
```
Campaña: "FotoFacturas_Retention"
Objetivo: Conversions
Evento de conversión: rc_renewal_event
Audiencia: Usuarios con suscripción activa
Presupuesto: $20/día
Optimización: Cost per Action
```

---

## 4. CONFIGURACIÓN DE EVENTOS EN APPSFLYER

### 4.1 Eventos de Conversión Configurados
```javascript
// Eventos ya implementados en el código
const CONVERSION_EVENTS = {
  'Ticket_Created': {
    description: 'Usuario sube un ticket para facturación',
    properties: {
      ticket_type: 'string',
      ticket_amount: 'number',
      processing_time_ms: 'number',
      total_time_ms: 'number'
    },
    facebook_mapping: 'Purchase'
  },
  
  'Purchase_Completed': {
    description: 'Usuario completa una compra de suscripción',
    properties: {
      product_id: 'string',
      price: 'number',
      currency: 'string',
      is_trial: 'boolean'
    },
    facebook_mapping: 'Purchase'
  },
  
  'Subscription_Status_Updated': {
    description: 'Estado de suscripción actualizado',
    properties: {
      active_entitlements: 'array',
      subscription_status: 'string'
    },
    facebook_mapping: 'Subscribe'
  },
  
  'rc_renewal_event': {
    description: 'Renovación de suscripción RevenueCat',
    properties: {
      subscription_type: 'string',
      subscription_price: 'number',
      subscription_currency: 'string'
    },
    facebook_mapping: 'Purchase'
  }
};
```

### 4.2 Configuración de Revenue Events
```
AppsFlyer Revenue Events:
1. Ticket_Created: $0 (evento de conversión, no revenue)
2. Purchase_Completed: Valor de la suscripción
3. rc_renewal_event: Valor de la renovación

Facebook Value Optimization:
- Optimizar por valor de conversión
- Usar Ticket_Created como evento principal
- Usar rc_renewal_event para optimización de ROAS
```

---

## 5. ONELINK SETUP PARA CAMPAÑAS

### 5.1 Configurar OneLink en AppsFlyer
```
1. Ir a AppsFlyer Dashboard > OneLink
2. Crear OneLink: "fotofacturas.onelink.me"
3. Configurar deep links:
   - iOS: fotofacturas://
   - Android: fotofacturas://
   - Web: https://fotofacturas.ai
```

### 5.2 OneLink URLs por Campaña
```
OneLink Principal: fotofacturas.onelink.me/fb
- UTM Source: facebook
- UTM Medium: social
- UTM Campaign: app_installs

OneLink Conversión: fotofacturas.onelink.me/fb-conversion
- UTM Source: facebook
- UTM Medium: social
- UTM Campaign: ticket_conversion

OneLink Retención: fotofacturas.onelink.me/fb-retention
- UTM Source: facebook
- UTM Medium: social
- UTM Campaign: subscription_retention
```

### 5.3 Implementación en Facebook Ads
```
1. Usar OneLink URLs en todos los ads
2. Configurar UTM parameters automáticamente
3. Trackear clicks y conversiones por OneLink
4. Optimizar basado en performance por OneLink
```

---

## 6. ESTRATEGIA DE ATTRIBUTION MEASUREMENT

### 6.1 Modelo de Attribution
```
AppsFlyer Attribution Model:
- Last Click (default)
- First Click (para awareness)
- Linear (para análisis avanzado)

Facebook Attribution Model:
- 1-day click, 7-day view
- 7-day click, 1-day view
- Cross-platform attribution
```

### 6.2 KPIs de Attribution
```
Métricas Principales:
1. Cost per Install (CPI): < $2.50
2. Cost per Ticket Created: < $5.00
3. Cost per Subscription: < $15.00
4. ROAS (Return on Ad Spend): > 3.0
5. LTV (Lifetime Value): > $100

Métricas de Attribution:
1. Attribution Rate: > 80%
2. Facebook Attribution Share: > 60%
3. Cross-Platform Attribution: < 20%
4. Organic vs Paid Split: 40/60
```

### 6.3 Configuración de Reporting
```
AppsFlyer Reports:
- Install Attribution Report
- In-App Events Report
- Revenue Report
- Cohort Analysis

Facebook Ads Reports:
- Campaign Performance
- Ad Set Performance
- Ad Performance
- Attribution Insights
```

---

## 7. IMPLEMENTACIÓN TÉCNICA

### 7.1 Código de Tracking Mejorado
```javascript
// src/utils/facebookTracking.js
import appsFlyerService from './appsflyer';
import amplitudeService from './amplitude';

/**
 * Enhanced Facebook tracking with AppsFlyer attribution
 */
class FacebookTrackingService {
  
  /**
   * Track Facebook-specific conversion events
   */
  async trackFacebookConversion(eventName, eventProperties = {}) {
    try {
      // Get AppsFlyer attribution data
      const attributionData = await appsFlyerService.getAttributionDataForUser();
      
      // Enhanced properties for Facebook
      const facebookProperties = {
        ...eventProperties,
        // Facebook-specific properties
        fb_campaign_id: attributionData.fb_campaign_id,
        fb_adset_id: attributionData.fb_adset_id,
        fb_ad_id: attributionData.fb_ad_id,
        fb_placement: attributionData.fb_placement,
        
        // AppsFlyer attribution
        af_media_source: attributionData.af_media_source,
        af_campaign: attributionData.af_campaign,
        af_status: attributionData.af_status,
        
        // Revenue data for Facebook optimization
        value: eventProperties.ticket_amount || eventProperties.subscription_price || 0,
        currency: 'MXN',
        
        // Content categorization
        content_type: this.getContentType(eventName),
        content_category: this.getContentCategory(eventName),
        
        // Timestamp
        timestamp: new Date().toISOString()
      };
      
      // Track with both services
      await appsFlyerService.trackEvent(eventName, facebookProperties);
      await amplitudeService.trackEvent(eventName, facebookProperties);
      
      console.log('📊 Facebook conversion tracked:', eventName, facebookProperties);
      
    } catch (error) {
      console.error('❌ Error tracking Facebook conversion:', error);
    }
  }
  
  /**
   * Get content type for Facebook
   */
  getContentType(eventName) {
    const contentTypes = {
      'Ticket_Created': 'product',
      'Purchase_Completed': 'subscription',
      'Subscription_Status_Updated': 'subscription',
      'rc_renewal_event': 'subscription'
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
      'rc_renewal_event': 'renewal'
    };
    return categories[eventName] || 'general';
  }
  
  /**
   * Track ticket creation with Facebook optimization
   */
  async trackTicketCreated(ticketData) {
    await this.trackFacebookConversion('Ticket_Created', {
      ticket_type: ticketData.type,
      ticket_amount: ticketData.amount,
      processing_time_ms: ticketData.processing_time,
      total_time_ms: ticketData.total_time,
      value: ticketData.amount || 0,
      currency: 'MXN'
    });
  }
  
  /**
   * Track subscription renewal with Facebook optimization
   */
  async trackSubscriptionRenewal(subscriptionData) {
    await this.trackFacebookConversion('rc_renewal_event', {
      subscription_type: subscriptionData.type,
      subscription_price: subscriptionData.price,
      subscription_currency: subscriptionData.currency,
      value: subscriptionData.price || 0,
      currency: 'MXN'
    });
  }
}

export default new FacebookTrackingService();
```

### 7.2 Integración en el Código Existente
```javascript
// src/screens/InvoiceUploadScreen.js - Modificación
import facebookTracking from '../utils/facebookTracking';

// En onFinishedUploading()
const onFinishedUploading = async () => {
  try {
    // ... código existente ...
    
    const uploadedTicket = await API.createTicket({
      token: session.token,
      scanURL: uploadURL.split(/[?#]/)[0],
    });
    
    // Enhanced tracking with Facebook optimization
    const processingTime = Date.now() - processStartTime;
    await facebookTracking.trackTicketCreated({
      ticket_id: uploadedTicket.ticket.id,
      type: 'invoice',
      amount: 0, // No revenue from ticket creation
      processing_time: processingTime,
      total_time: uploadTime + processingTime
    });
    
    // ... resto del código ...
  } catch (error) {
    // ... manejo de errores ...
  }
};
```

### 7.3 RevenueCat Integration Mejorada
```javascript
// src/utils/revenuecat.js - Modificación
import facebookTracking from './facebookTracking';

// En setupPurchaseEventTracking()
const setupPurchaseEventTracking = () => {
  Purchases.addCustomerInfoUpdateListener((info) => {
    const activeEntitlements = Object.keys(info.entitlements?.active || {});
    
    if (activeEntitlements.length > 0) {
      // Track subscription renewal with Facebook
      facebookTracking.trackSubscriptionRenewal({
        type: activeEntitlements[0],
        price: info.latestExpirationDate ? 299 : 0, // Example price
        currency: 'MXN'
      });
      
      // ... resto del código existente ...
    }
  });
};
```

---

## 8. CONFIGURACIÓN DE OPTIMIZACIÓN

### 8.1 Facebook Ads Optimization
```
Campaign Optimization:
1. App Installs: Optimize for Cost per Install
2. Ticket Conversion: Optimize for Cost per Action
3. Subscription Renewal: Optimize for Value

Bid Strategy:
- Lowest Cost (for installs)
- Cost Cap (for conversions)
- Bid Cap (for value optimization)

Audience Optimization:
- Lookalike audiences based on Ticket_Created
- Custom audiences from existing subscribers
- Retargeting based on app engagement
```

### 8.2 AppsFlyer Optimization
```
Attribution Optimization:
- Enable Facebook Attribution
- Configure attribution windows
- Set up conversion events
- Monitor attribution quality

Revenue Optimization:
- Track revenue events properly
- Configure value optimization
- Monitor ROAS metrics
- Optimize for high-value users
```

---

## 9. MONITORING Y REPORTING

### 9.1 Dashboards de Monitoreo
```
AppsFlyer Dashboard:
- Real-time attribution data
- Conversion funnel analysis
- Revenue attribution
- Cohort analysis

Facebook Ads Manager:
- Campaign performance
- Ad set optimization
- Audience insights
- Attribution insights

Amplitude Dashboard:
- User behavior analysis
- Conversion tracking
- Retention analysis
- Revenue tracking
```

### 9.2 Alertas y Notificaciones
```
Configurar alertas para:
1. CPI > $3.00
2. ROAS < 2.0
3. Attribution rate < 70%
4. Conversion rate < 5%
5. Budget spent > 80% daily
```

---

## 10. TESTING Y VALIDACIÓN

### 10.1 Testing de Attribution
```
1. Install app from Facebook ad
2. Verify attribution data in AppsFlyer
3. Check Facebook Ads Manager for attribution
4. Validate conversion events
5. Test OneLink functionality
```

### 10.2 Testing de Conversiones
```
1. Create test ticket
2. Verify Ticket_Created event
3. Check Facebook conversion tracking
4. Validate revenue attribution
5. Test subscription events
```

---

## 11. PRÓXIMOS PASOS

### 11.1 Implementación Inmediata
```
1. ✅ Configurar Facebook Business Manager
2. ✅ Conectar AppsFlyer con Facebook
3. ✅ Implementar código de tracking mejorado
4. ✅ Configurar OneLink URLs
5. ✅ Crear campañas de prueba
```

### 11.2 Optimización Continua
```
1. Monitor performance diariamente
2. Ajustar bids y budgets
3. Optimizar audiencias
4. Testear nuevos creativos
5. Expandir a nuevas audiencias
```

---

## 12. CONTACTOS Y SOPORTE

### 12.1 Facebook Business Manager
```
- Business Manager ID: [Configurar]
- Ad Account ID: [Configurar]
- Pixel ID: [Configurar]
- App ID: [Configurar]
```

### 12.2 AppsFlyer Support
```
- Dev Key: bETPLgmuc8ek4NDFhvWin7
- App ID iOS: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- App ID Android: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- Support: support@appsflyer.com
```

### 12.3 RevenueCat Integration
```
- iOS API Key: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- Android API Key: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- Events: rc_renewal_event, Purchase_Completed
```

---

## RESUMEN DE CONFIGURACIÓN

### ✅ Sistema Actual Funcionando
- AppsFlyer SDK integrado y funcionando
- Events tracking: Screen_Viewed, Ticket_Created
- Attribution detection activo
- Dual tracking con Amplitude

### 🎯 Objetivos Facebook Ads
- **CPI Target**: < $2.50
- **Ticket Conversion**: < $5.00
- **ROAS Target**: > 3.0
- **Monthly Conversions**: 2,640 tickets
- **Monthly Revenue**: 30 renovaciones

### 📊 Métricas Clave
- **Ticket_Created**: Evento principal de conversión
- **rc_renewal_event**: Evento de revenue
- **Attribution Rate**: > 80%
- **Facebook Share**: > 60%

### 🔧 Implementación Técnica
- OneLink setup para campañas
- Enhanced tracking con Facebook properties
- Revenue optimization configurado
- Cross-platform attribution activo

**Estado**: ✅ Listo para implementación completa de Facebook Ads + AppsFlyer attribution 