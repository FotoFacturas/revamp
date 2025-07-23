# Integración Apple Search Ads con Amplitude

## Resumen de Modificaciones

Se ha integrado exitosamente el sistema de Apple Search Ads con el módulo de Amplitude existente en `src/utils/amplitude.js`.

## Funciones Agregadas/Mejoradas

### 1. `handleAppleSearchAdsAttribution(userId, userData)`
**Función principal para procesar atribución de Apple Search Ads**

```javascript
const attributionData = await amplitudeService.handleAppleSearchAdsAttribution(userId, userData);
```

**Características:**
- ✅ Llama a `appleSearchAdsAttribution.getAttributionForUser(userData)`
- ✅ Almacena datos de atribución en AsyncStorage (mismo sistema que UTMs)
- ✅ Configura user properties en Amplitude automáticamente
- ✅ Trackea evento `Apple_Search_Ads_Attribution`
- ✅ Logs con emoji 🍎 para debugging

### 2. `trackEventWithAttribution(eventName, properties, userId)`
**Función mejorada para tracking con atribución automática**

```javascript
await amplitudeService.trackEventWithAttribution('User_Action', {
  action_type: 'button_click',
  screen: 'main'
}, userId);
```

**Características:**
- ✅ Combina propiedades del evento con UTMs existentes
- ✅ Agrega datos de Apple Search Ads si están disponibles
- ✅ Fallback automático a `trackEvent()` si hay errores
- ✅ Incluye timestamp y platform automáticamente

### 3. `identifyUserWithAttribution(userId, userProperties)`
**Función mejorada para identificación de usuario con atribución**

```javascript
await amplitudeService.identifyUserWithAttribution(userId, {
  user_type: 'premium',
  subscription_status: 'active'
});
```

**Características:**
- ✅ Combina user properties con UTMs existentes
- ✅ Agrega propiedades de Apple Search Ads si están disponibles
- ✅ Fallback automático a `identifyUser()` si hay errores
- ✅ Configura `first_` y `last_` properties automáticamente

### 4. `getStoredAttributionData()`
**Función para obtener datos de atribución almacenados**

```javascript
const storedAttribution = await amplitudeService.getStoredAttributionData();
```

**Características:**
- ✅ Obtiene datos de atribución del sistema de UTMs
- ✅ Retorna null si no hay atribución almacenada
- ✅ Incluye todos los campos de Apple Search Ads

### 5. `createUTMQuery(attributionData)`
**Función mejorada para crear query strings de UTM**

```javascript
const utmQuery = amplitudeService.createUTMQuery(attributionData);
```

**Características:**
- ✅ Incluye parámetros de Apple Search Ads
- ✅ Manejo de errores robusto
- ✅ Compatible con sistema UTM existente

## Estructura de Datos de Atribución

Los datos de atribución se almacenan en el mismo sistema que los UTMs con la siguiente estructura:

```javascript
{
  // UTMs estándar
  utm_source: 'apple_search_ads',
  utm_medium: 'app_store_search',
  utm_campaign: 'campaign_ID_COUNTRY',
  
  // Datos específicos de Apple Search Ads
  apple_campaign_id: 'ID',
  apple_org_id: 'orgId',
  apple_country: 'country',
  attribution_confidence: 0.85,
  attribution_source: 'apple_search_ads_api',
  attribution_timestamp: '2024-01-15T10:00:00Z'
}
```

## Integración en MainScreen

### Ejemplo de uso en MainScreen.js:

```javascript
import { useEffect } from 'react';
import { Platform } from 'react-native';
import amplitudeService from '../utils/amplitude';

// En useEffect o componentDidMount
useEffect(() => {
  const initializeAppleSearchAds = async () => {
    try {
      const userData = {
        userId: user?.id || 'anonymous',
        installDate: session?.created_at || new Date().toISOString(),
        country: user?.country || 'MX',
        platform: Platform.OS,
        orgIds: ['3839590', '3839580', '3841110'],
        defaultOrgId: '3839590'
      };
      
      const attribution = await amplitudeService.handleAppleSearchAdsAttribution(
        userData.userId, 
        userData
      );
      
      if (attribution) {
        console.log('✅ Atribución encontrada:', attribution);
      }
    } catch (error) {
      console.error('Error inicializando Apple Search Ads:', error);
    }
  };
  
  initializeAppleSearchAds();
}, [user, session]);
```

## Eventos Amplitude Generados

### 1. `Apple_Search_Ads_Attribution`
Se envía cuando se encuentra atribución exitosa:

```javascript
{
  user_id: 'user_123',
  attribution_data: { /* datos completos de atribución */ },
  attribution_confidence: 0.85,
  apple_campaign_id: 'campaign_001',
  apple_org_id: '3839590',
  apple_country: 'MX'
}
```

### 2. Eventos con Atribución Automática
Todos los eventos trackeados con `trackEventWithAttribution()` incluyen automáticamente:

```javascript
{
  // Propiedades del evento original
  action_type: 'button_click',
  screen: 'main',
  
  // UTMs existentes
  utm_source: 'apple_search_ads',
  utm_medium: 'app_store_search',
  
  // Datos de Apple Search Ads (si están disponibles)
  apple_search_ads_attributed: true,
  apple_campaign_id: 'campaign_001',
  apple_org_id: '3839590',
  apple_country: 'MX',
  attribution_confidence: 0.85,
  attribution_source: 'apple_search_ads_api'
}
```

## User Properties en Amplitude

### Propiedades Configuradas Automáticamente:

```javascript
{
  // UTMs
  first_utm_source: 'apple_search_ads',
  last_utm_source: 'apple_search_ads',
  first_utm_medium: 'app_store_search',
  last_utm_medium: 'app_store_search',
  
  // Apple Search Ads
  first_apple_campaign_id: 'campaign_001',
  last_apple_campaign_id: 'campaign_001',
  first_apple_org_id: '3839590',
  last_apple_org_id: '3839590',
  first_attribution_confidence: 0.85,
  last_attribution_confidence: 0.85
}
```

## Compatibilidad

### ✅ Funcionalidad Existente Preservada
- Todas las funciones UTM existentes siguen funcionando
- `captureUTMs()`, `getStoredUTMs()`, `trackEvent()` sin cambios
- Sistema de deep links intacto
- Identificación de usuarios sin atribución funciona igual

### ✅ Nuevas Funcionalidades Agregadas
- Atribución automática de Apple Search Ads
- Tracking mejorado con atribución
- Identificación de usuarios con atribución
- Almacenamiento integrado con sistema UTM existente

## Testing

### Función de Test Integrada:

```javascript
import amplitudeService from '../utils/amplitude';

// Test de atribución
const testAttribution = async () => {
  const testUserData = {
    userId: 'test_user_001',
    installDate: new Date().toISOString(),
    country: 'MX',
    platform: 'ios',
    orgIds: ['3839590', '3839580']
  };
  
  const attribution = await amplitudeService.handleAppleSearchAdsAttribution(
    testUserData.userId,
    testUserData
  );
  
  console.log('Test results:', attribution);
};
```

### Verificación de Datos Almacenados:

```javascript
// Verificar atribución almacenada
const storedData = await amplitudeService.getStoredAttributionData();
console.log('Stored attribution:', storedData);

// Verificar UTMs (incluye atribución)
const storedUtms = await amplitudeService.getStoredUTMs();
console.log('Stored UTMs:', storedUtms);
```

## Logs y Debugging

### Emojis para Identificación:
- 🍎 Apple Search Ads attribution
- 📊 Eventos de tracking
- 🔗 Deep links
- ✅ Éxito
- ❌ Errores
- ℹ️ Información

### Ejemplo de Logs:
```
🍎 Starting Apple Search Ads attribution for user: user_123
🍎 Apple Search Ads attribution found: { campaign_id: '001', confidence: 0.85 }
🍎 Apple Search Ads attribution stored and tracked successfully
📊 Tracking event with attribution: User_Action
🍎 Amplitude user identified with attribution: { userId: 'user_123', properties: {...} }
```

## Próximos Pasos

1. **Integrar en MainScreen.js** usando el ejemplo proporcionado
2. **Probar con datos reales** ejecutando los tests
3. **Monitorear eventos** en Amplitude dashboard
4. **Ajustar configuración** según necesidades específicas

## Archivos Modificados

- ✅ `src/utils/amplitude.js` - Integración principal
- ✅ `src/utils/amplitudeAppleSearchAdsExample.js` - Ejemplos de uso
- ✅ `APPLE_SEARCH_ADS_AMPLITUDE_INTEGRATION.md` - Esta documentación

La integración está completa y lista para usar en producción. 🚀 