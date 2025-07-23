# OneLink Configuration for Facebook Ads
## FotoFacturas - Deep Linking Setup

### Overview
OneLink es la solución de AppsFlyer para deep linking que permite dirigir usuarios a la app correcta desde Facebook Ads, independientemente de la plataforma.

---

## 1. CONFIGURACIÓN ONELINK EN APPSFLYER

### 1.1 Crear OneLink Principal
```
1. Ir a AppsFlyer Dashboard
2. OneLink > Create OneLink
3. Configurar:
   - OneLink Name: "FotoFacturas_Main"
   - OneLink URL: fotofacturas.onelink.me
   - Brand Domain: fotofacturas.onelink.me
```

### 1.2 Configurar Deep Links por Plataforma
```
iOS Configuration:
- Deep Link URL: fotofacturas://
- App Store URL: https://apps.apple.com/app/id1590322939
- Fallback URL: https://fotofacturas.ai

Android Configuration:
- Deep Link URL: fotofacturas://
- Play Store URL: https://play.google.com/store/apps/details?id=com.fotofactura
- Fallback URL: https://fotofacturas.ai

Web Configuration:
- Fallback URL: https://fotofacturas.ai
- Redirect to App Store: ✅
- Redirect to Play Store: ✅
```

---

## 2. ONELINK URLs POR CAMPAÑA

### 2.1 OneLink para App Installs
```
URL: fotofacturas.onelink.me/fb-installs
UTM Parameters:
- utm_source=facebook
- utm_medium=social
- utm_campaign=app_installs
- utm_content=general
- utm_term=app_download

Use Case: Campañas de instalación de app
Target: Nuevos usuarios
```

### 2.2 OneLink para Conversión de Tickets
```
URL: fotofacturas.onelink.me/fb-tickets
UTM Parameters:
- utm_source=facebook
- utm_medium=social
- utm_campaign=ticket_conversion
- utm_content=ticket_upload
- utm_term=invoice_automation

Use Case: Campañas de conversión
Target: Usuarios que suben tickets
```

### 2.3 OneLink para Retención de Suscripciones
```
URL: fotofacturas.onelink.me/fb-subscription
UTM Parameters:
- utm_source=facebook
- utm_medium=social
- utm_campaign=subscription_retention
- utm_content=subscription_renewal
- utm_term=revenue_optimization

Use Case: Campañas de retención
Target: Usuarios con suscripción activa
```

### 2.4 OneLink para Freelancers
```
URL: fotofacturas.onelink.me/fb-freelancers
UTM Parameters:
- utm_source=facebook
- utm_medium=social
- utm_campaign=freelancer_targeting
- utm_content=freelancer_specific
- utm_term=freelancer_invoicing

Use Case: Audiencia específica de freelancers
Target: Freelancers en México
```

### 2.5 OneLink para Pequeñas Empresas
```
URL: fotofacturas.onelink.me/fb-business
UTM Parameters:
- utm_source=facebook
- utm_medium=social
- utm_campaign=small_business
- utm_content=business_specific
- utm_term=business_invoicing

Use Case: Audiencia de pequeñas empresas
Target: Pequeñas empresas en México
```

---

## 3. CONFIGURACIÓN EN FACEBOOK ADS

### 3.1 Configurar OneLink en Facebook Ads Manager
```
1. Ir a Facebook Ads Manager
2. Crear nueva campaña
3. En "Ad Setup" > "Destination"
4. Seleccionar "Website"
5. URL: Usar OneLink correspondiente
6. Configurar UTM parameters automáticamente
```

### 3.2 Configuración por Ad Set
```
Ad Set 1: "Freelancers_Mexico"
- OneLink: fotofacturas.onelink.me/fb-freelancers
- UTM Campaign: freelancer_targeting
- UTM Content: freelancer_specific

Ad Set 2: "Small_Business_Mexico"
- OneLink: fotofacturas.onelink.me/fb-business
- UTM Campaign: small_business
- UTM Content: business_specific

Ad Set 3: "Lookalike_Users"
- OneLink: fotofacturas.onelink.me/fb-installs
- UTM Campaign: app_installs
- UTM Content: lookalike_audience
```

### 3.3 Configuración de Tracking
```
Facebook Pixel Events:
- PageView: Cuando usuario llega a la app
- AppInstall: Cuando se instala la app
- Purchase: Cuando se crea un ticket
- Subscribe: Cuando se activa suscripción

AppsFlyer Events:
- af_app_open: Apertura de app
- Ticket_Created: Creación de ticket
- Purchase_Completed: Compra de suscripción
- rc_renewal_event: Renovación de suscripción
```

---

## 4. IMPLEMENTACIÓN TÉCNICA

### 4.1 Configuración en App.js
```javascript
// src/App.js - Modificación existente
import appsFlyerService from './utils/appsflyer';
import facebookTracking from './utils/facebookTracking';

export default function App() {
  React.useEffect(() => {
    // ... código existente ...
    
    // Initialize Facebook tracking
    facebookTracking.init();
    
    // Handle OneLink deep links
    const handleOneLink = async (url) => {
      try {
        console.log('🔗 OneLink received:', url);
        
        // Extract UTM parameters from OneLink
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const utmData = {
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_content: urlParams.get('utm_content'),
          utm_term: urlParams.get('utm_term')
        };
        
        // Store UTM data
        await appsFlyerService.storeUTMData(utmData);
        
        // Track OneLink open
        await facebookTracking.trackFacebookConversion('OneLink_Opened', {
          one_link_url: url,
          ...utmData
        });
        
        console.log('✅ OneLink processed:', utmData);
        
      } catch (error) {
        console.error('❌ Error handling OneLink:', error);
      }
    };
    
    // Handle initial OneLink
    const handleInitialOneLink = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL && initialURL.includes('onelink.me')) {
          await handleOneLink(initialURL);
        }
      } catch (error) {
        console.error('Error handling initial OneLink:', error);
      }
    };
    
    // Handle OneLink during app usage
    const handleOneLinkURL = async (event) => {
      try {
        const url = event.url;
        if (url && url.includes('onelink.me')) {
          await handleOneLink(url);
        }
      } catch (error) {
        console.error('Error handling OneLink during app usage:', error);
      }
    };
    
    // Set up OneLink listeners
    const oneLinkSubscription = Linking.addEventListener('url', handleOneLinkURL);
    
    // Handle initial OneLink
    handleInitialOneLink();
    
    // Cleanup
    return () => {
      if (oneLinkSubscription) {
        oneLinkSubscription.remove();
      }
    };
  }, []);
  
  // ... resto del código ...
}
```

### 4.2 Enhanced AppsFlyer Service
```javascript
// src/utils/appsflyer.js - Agregar métodos para OneLink
const handleOneLinkData = async (oneLinkData) => {
  try {
    console.log('📊 Processing OneLink data:', oneLinkData);
    
    // Extract UTM parameters
    const utmData = {
      utm_source: oneLinkData.utm_source,
      utm_medium: oneLinkData.utm_medium,
      utm_campaign: oneLinkData.utm_campaign,
      utm_content: oneLinkData.utm_content,
      utm_term: oneLinkData.utm_term
    };
    
    // Store UTM data
    await storeUTMData(utmData);
    
    // Track OneLink event
    await trackEvent('OneLink_Opened', {
      one_link_url: oneLinkData.url,
      one_link_campaign: oneLinkData.utm_campaign,
      one_link_source: oneLinkData.utm_source,
      ...utmData
    });
    
    console.log('✅ OneLink data processed and stored');
    
  } catch (error) {
    console.error('❌ Error handling OneLink data:', error);
  }
};

// Agregar al export
export default {
  // ... métodos existentes ...
  handleOneLinkData,
  // ... resto de métodos ...
};
```

---

## 5. TESTING Y VALIDACIÓN

### 5.1 Testing de OneLink
```
1. Crear OneLink de prueba: fotofacturas.onelink.me/test
2. Abrir OneLink en dispositivo móvil
3. Verificar redirección a app
4. Verificar UTM parameters en AppsFlyer
5. Verificar eventos en Facebook Ads Manager
```

### 5.2 Testing por Plataforma
```
iOS Testing:
- Abrir OneLink en Safari
- Verificar redirección a App Store
- Verificar deep link en app instalada

Android Testing:
- Abrir OneLink en Chrome
- Verificar redirección a Play Store
- Verificar deep link en app instalada

Web Testing:
- Abrir OneLink en desktop
- Verificar redirección a landing page
- Verificar UTM parameters
```

### 5.3 Testing de Attribution
```
1. Instalar app desde OneLink
2. Verificar attribution en AppsFlyer
3. Verificar Facebook attribution
4. Crear ticket y verificar conversión
5. Verificar revenue attribution
```

---

## 6. MONITORING Y ANALYTICS

### 6.1 AppsFlyer OneLink Analytics
```
Métricas a monitorear:
- OneLink clicks
- App installs from OneLink
- Conversion rate por OneLink
- Attribution rate por OneLink
- Revenue por OneLink
```

### 6.2 Facebook Ads Analytics
```
Métricas a monitorear:
- Link clicks
- App installs
- Cost per install
- Conversion rate
- ROAS por OneLink
```

### 6.3 Reporting Dashboard
```
Crear dashboard con:
- Performance por OneLink
- Attribution por campaña
- Conversion funnel
- Revenue attribution
- ROI por OneLink
```

---

## 7. OPTIMIZACIÓN

### 7.1 OneLink Performance Optimization
```
1. Monitor performance por OneLink
2. Optimizar UTM parameters
3. A/B test diferentes OneLinks
4. Optimizar landing pages
5. Improve conversion rates
```

### 7.2 Facebook Ads Optimization
```
1. Optimizar bids por OneLink performance
2. Ajustar audiences basado en OneLink data
3. Crear lookalike audiences de OneLink users
4. Optimizar creativos basado en OneLink performance
5. Scale successful OneLink campaigns
```

---

## 8. CONFIGURACIÓN AVANZADA

### 8.1 OneLink con Parámetros Dinámicos
```
URL Template: fotofacturas.onelink.me/fb-{campaign}-{audience}
Ejemplo: fotofacturas.onelink.me/fb-installs-freelancers

Parámetros dinámicos:
- {campaign}: app_installs, ticket_conversion, subscription_retention
- {audience}: freelancers, business, lookalike
- {platform}: ios, android, web
```

### 8.2 OneLink con Personalización
```
Configurar personalización basada en:
- Ubicación del usuario
- Tipo de dispositivo
- Hora del día
- Idioma del usuario
- Historial de engagement
```

### 8.3 OneLink con A/B Testing
```
Crear múltiples OneLinks para testing:
- OneLink A: fotofacturas.onelink.me/fb-test-a
- OneLink B: fotofacturas.onelink.me/fb-test-b
- OneLink C: fotofacturas.onelink.me/fb-test-c

Testear diferentes:
- UTM parameters
- Landing pages
- Call-to-actions
- Creativos
```

---

## 9. TROUBLESHOOTING

### 9.1 Problemas Comunes
```
1. OneLink no redirige a app
   - Verificar configuración de deep links
   - Verificar App Store/Play Store URLs
   - Verificar fallback URLs

2. UTM parameters no se capturan
   - Verificar configuración en AppsFlyer
   - Verificar implementación en app
   - Verificar URL encoding

3. Attribution no funciona
   - Verificar AppsFlyer configuration
   - Verificar Facebook integration
   - Verificar event tracking
```

### 9.2 Debug Commands
```javascript
// Debug OneLink data
console.log('OneLink URL:', url);
console.log('UTM Parameters:', utmData);
console.log('Attribution Data:', attributionData);

// Debug AppsFlyer OneLink
appsFlyerService.handleOneLinkData(oneLinkData);
console.log('OneLink processed successfully');
```

---

## 10. RESUMEN DE CONFIGURACIÓN

### ✅ OneLink URLs Configuradas
- **App Installs**: fotofacturas.onelink.me/fb-installs
- **Ticket Conversion**: fotofacturas.onelink.me/fb-tickets
- **Subscription Retention**: fotofacturas.onelink.me/fb-subscription
- **Freelancers**: fotofacturas.onelink.me/fb-freelancers
- **Small Business**: fotofacturas.onelink.me/fb-business

### 🎯 Objetivos de OneLink
- **Attribution Rate**: > 90%
- **Conversion Rate**: > 5%
- **Install Rate**: > 15%
- **Revenue Attribution**: > 80%

### 📊 Métricas de OneLink
- **Clicks**: Monitorear por OneLink
- **Installs**: Trackear attribution
- **Conversions**: Medir ROI
- **Revenue**: Optimizar ROAS

### 🔧 Implementación Técnica
- OneLink integration en App.js
- Enhanced AppsFlyer service
- Facebook tracking integration
- UTM parameter handling

**Estado**: ✅ Listo para implementación de OneLink en Facebook Ads 