# Apple Search Ads API Integration para FotoFacturas

## Descripción General

Esta integración proporciona una solución completa para conectar la app React Native de FotoFacturas con la API de Apple Search Ads usando OAuth2 client credentials flow. El sistema incluye autenticación, obtención de datos de campañas, atribución de usuarios y envío de datos a Amplitude.

## Arquitectura

### Módulos Principales

1. **`appleSearchAdsAuth.js`** - Autenticación OAuth2 y gestión de tokens
2. **`appleSearchAdsAPI.js`** - Cliente API con cache y rate limiting
3. **`appleSearchAdsAttribution.js`** - Lógica de atribución y correlación
4. **`appleSearchAdsTest.js`** - Suite completa de testing
5. **`appleSearchAdsTypes.ts`** - Interfaces TypeScript

## Configuración

### Credenciales Apple Search Ads

```javascript
const CREDENTIALS = {
  clientId: 'SEARCHADS.4882589f-bc87-4129-bc4f-3162631e11a4',
  teamId: 'SEARCHADS.4882589f-bc87-4129-bc4f-3162631e11a4',
  keyId: '3093ebce-dd08-4401-9428-25fd24f0aa35',
  orgIds: {
    main: '3839580',      // Softwerk, S.A.P.I. de C.V.
    basic: '3839590',     // Search Ads Basic (default)
    advanced: '3841110'   // Softwerk Advance
  },
  defaultOrgId: '3839590'
};
```

### Configuración API

```javascript
const API_CONFIG = {
  baseUrl: 'https://api.searchads.apple.com/api/v5',
  tokenUrl: 'https://api.searchads.apple.com/api/v5/oauth/token',
  scope: 'searchadsorg',
  cacheExpiry: 30 * 60 * 1000, // 30 minutos
  maxRetries: 3,
  retryDelay: 1000,
  rateLimitDelay: 2000
};
```

## Módulo de Autenticación (`appleSearchAdsAuth.js`)

### Funcionalidades

- **OAuth2 Client Credentials Flow**: Autenticación automática con Apple Search Ads
- **Gestión de Tokens**: Almacenamiento y renovación automática de tokens
- **Multi-orgId Support**: Soporte para múltiples organization IDs
- **Headers Generation**: Generación automática de headers para requests API

### Métodos Principales

```javascript
// Obtener token válido
const token = await appleSearchAdsAuth.getValidToken();

// Generar headers para requests
const headers = await appleSearchAdsAuth.getRequestHeaders(orgId);

// Test de autenticación
const authTest = await appleSearchAdsAuth.testAuthentication();

// Test de todos los orgIds
const allOrgIdsTest = await appleSearchAdsAuth.testAllOrgIds();
```

### Flujo OAuth2

1. **Solicitud de Token**: `POST /oauth/token` con client credentials
2. **Almacenamiento**: Token guardado en AsyncStorage con expiración
3. **Renovación**: Token renovado automáticamente antes de expirar
4. **Headers**: Generación de `Authorization: Bearer {token}` y `X-AP-Context: orgId={orgId}`

## Módulo de API (`appleSearchAdsAPI.js`)

### Funcionalidades

- **Cache Inteligente**: Cache de 30 minutos por orgId y parámetros
- **Rate Limiting**: Control de velocidad de requests (2s entre requests)
- **Retry Logic**: Reintentos automáticos con exponential backoff
- **Multi-orgId Data Aggregation**: Agregación de datos de múltiples orgIds
- **Error Handling**: Manejo robusto de errores y timeouts

### Métodos Principales

```javascript
// Obtener reportes de campañas
const reports = await appleSearchAdsAPI.getCampaignReports({
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z',
  granularity: 'DAY',
  groupBy: ['countryOrRegion', 'campaignId'],
  limit: 1000
}, orgId);

// Obtener datos de instalaciones de múltiples orgIds
const installsData = await appleSearchAdsAPI.getInstallsData(
  30,        // días
  'MX',      // país (opcional)
  ['3839590', '3839580'] // orgIds específicos (opcional)
);

// Obtener datos de campañas específicas
const campaignData = await appleSearchAdsAPI.getCampaignData(
  ['campaign_id_1', 'campaign_id_2'],
  orgId
);

// Obtener datos por país
const countryData = await appleSearchAdsAPI.getCountryData('MX', 30, orgId);
```

### Cache Strategy

- **Cache Key**: `{type}_{orgId}_{params_hash}`
- **Expiración**: 30 minutos
- **Invalidación**: Automática por expiración
- **Storage**: AsyncStorage con estructura JSON

### Rate Limiting

- **Delay entre requests**: 2 segundos
- **Retry con backoff**: 1s, 2s, 4s
- **Máximo retries**: 3 intentos

## Módulo de Atribución (`appleSearchAdsAttribution.js`)

### Algoritmo de Confianza

El sistema utiliza un algoritmo de confianza ponderado con los siguientes factores:

- **Fecha (40%)**: Proximidad entre fecha de instalación y campaña
- **Geografía (30%)**: Coincidencia de país/región
- **Volumen (20%)**: Ratio de instalaciones de la campaña
- **Plataforma (10%)**: Coincidencia con iOS

### Formato de Datos de Atribución

```javascript
{
  utm_source: 'apple_search_ads',
  utm_medium: 'app_store_search',
  utm_campaign: 'campaign_ID_COUNTRY',
  apple_campaign_id: 'ID',
  apple_org_id: 'orgId',
  apple_country: 'country',
  attribution_confidence: 0.85,
  attribution_source: 'apple_search_ads_api',
  attribution_details: {
    date_confidence: 0.9,
    geography_confidence: 1.0,
    volume_confidence: 0.7,
    platform_confidence: 1.0,
    campaign_name: 'Campaign Name',
    installs: 150,
    impressions: 5000,
    taps: 300
  }
}
```

### Métodos Principales

```javascript
// Obtener atribución para usuario
const attribution = await appleSearchAdsAttribution.getAttributionForUser({
  userId: 'user_123',
  installDate: '2024-01-15T10:00:00Z',
  country: 'MX',
  platform: 'iOS',
  orgIds: ['3839590', '3839580']
});

// Test de atribución con datos de prueba
const testAttribution = await appleSearchAdsAttribution.getAttributionWithTestData(userData);

// Test de algoritmos de confianza
const confidenceTest = appleSearchAdsAttribution.testConfidenceAlgorithms();
```

### Ventana de Atribución

- **Duración**: 7 días por defecto
- **Configurable**: A través de `ATTRIBUTION_CONFIG.attributionWindow`
- **Umbral mínimo**: 60% de confianza (`ATTRIBUTION_CONFIG.minConfidence`)

## Integración con Amplitude

### Modificaciones en `amplitude.js`

```javascript
// Nuevo método para manejar atribución de Apple Search Ads
const handleAppleSearchAdsAttribution = async (userId, userData) => {
  try {
    const attribution = await appleSearchAdsAttribution.getAttributionForUser(userData);
    
    if (attribution) {
      // Enviar evento de atribución
      trackEvent('Apple_Search_Ads_Attribution', {
        campaign_id: attribution.apple_campaign_id,
        org_id: attribution.apple_org_id,
        country: attribution.apple_country,
        confidence: attribution.attribution_confidence,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign
      }, userId);
      
      return attribution;
    }
    
    return null;
  } catch (error) {
    console.error('Error en atribución Apple Search Ads:', error);
    return null;
  }
};

// Método mejorado para tracking con atribución
const trackEventWithAttribution = async (eventName, properties, userId) => {
  try {
    // Obtener datos de usuario para atribución
    const userData = await getUserDataForAttribution(userId);
    
    if (userData) {
      const attribution = await handleAppleSearchAdsAttribution(userId, userData);
      
      if (attribution) {
        // Agregar datos de atribución a las propiedades del evento
        properties = {
          ...properties,
          attribution_source: attribution.attribution_source,
          attribution_confidence: attribution.attribution_confidence,
          apple_campaign_id: attribution.apple_campaign_id,
          apple_org_id: attribution.apple_org_id
        };
      }
    }
    
    // Enviar evento a Amplitude
    trackEvent(eventName, properties, userId);
  } catch (error) {
    console.error('Error en trackEventWithAttribution:', error);
    // Fallback a tracking normal
    trackEvent(eventName, properties, userId);
  }
};
```

### Modificaciones en `MainScreen.js`

```javascript
// Importar módulos de Apple Search Ads
import appleSearchAdsAttribution from '../utils/appleSearchAdsAttribution';
import { handleAppleSearchAdsAttribution } from '../utils/amplitude';

// En useEffect o componentDidMount
useEffect(() => {
  const initializeAppleSearchAds = async () => {
    try {
      // Obtener datos de usuario
      const userData = {
        userId: user?.id || 'anonymous',
        installDate: user?.created_at || new Date().toISOString(),
        country: user?.country || 'MX',
        platform: Platform.OS,
        orgIds: ['3839590', '3839580']
      };
      
      // Procesar atribución
      const attribution = await handleAppleSearchAdsAttribution(userData.userId, userData);
      
      if (attribution) {
        console.log('✅ Atribución Apple Search Ads encontrada:', {
          campaign: attribution.apple_campaign_id,
          confidence: attribution.attribution_confidence
        });
      }
    } catch (error) {
      console.error('Error inicializando Apple Search Ads:', error);
    }
  };
  
  initializeAppleSearchAds();
}, [user]);
```

## Testing y Debugging

### Suite de Tests (`appleSearchAdsTest.js`)

```javascript
import appleSearchAdsTest from '../utils/appleSearchAdsTest';

// Ejecutar todos los tests
const runAllTests = async () => {
  const results = await appleSearchAdsTest.runAllTests();
  console.log('Test results:', results);
};

// Test específico de autenticación OAuth2
const testOAuth2 = async () => {
  const results = await appleSearchAdsTest.testOAuth2Authentication();
  console.log('OAuth2 test results:', results);
};

// Test de funcionalidad API
const testAPI = async () => {
  const results = await appleSearchAdsTest.testAPIFunctionality();
  console.log('API test results:', results);
};

// Test de algoritmos de atribución
const testAttribution = async () => {
  const results = await appleSearchAdsTest.testAttributionAlgorithms();
  console.log('Attribution test results:', results);
};

// Limpiar datos de prueba
const cleanup = async () => {
  await appleSearchAdsTest.cleanupTestData();
};
```

### Tests Disponibles

1. **Test Completo**: `runCompleteTest()` - Prueba todos los módulos
2. **Test OAuth2**: `testOAuth2Authentication()` - Prueba autenticación
3. **Test API**: `testAPIFunctionality()` - Prueba funcionalidad API
4. **Test Atribución**: `testAttributionAlgorithms()` - Prueba algoritmos
5. **Test Datos Reales**: `testRealDataIntegration()` - Prueba con datos reales
6. **Test Performance**: `testPerformanceAndCache()` - Prueba cache y performance
7. **Test Errores**: `testErrorHandling()` - Prueba manejo de errores

### Logs y Debugging

El sistema incluye logs detallados con emojis para facilitar el debugging:

- 🔐 Autenticación
- 🌐 API requests
- 📊 Datos de campañas
- 🎯 Atribución
- 📦 Cache
- ⚡ Performance
- 🛡️ Error handling
- 🧪 Testing

## Configuración de Producción

### Variables de Entorno

```javascript
// Agregar a .env o configuración de producción
APPLE_SEARCH_ADS_CLIENT_ID=SEARCHADS.4882589f-bc87-4129-bc4f-3162631e11a4
APPLE_SEARCH_ADS_TEAM_ID=SEARCHADS.4882589f-bc87-4129-bc4f-3162631e11a4
APPLE_SEARCH_ADS_KEY_ID=3093ebce-dd08-4401-9428-25fd24f0aa35
APPLE_SEARCH_ADS_DEFAULT_ORG_ID=3839590
```

### Optimizaciones de Producción

1. **Cache Persistente**: Los tokens y datos se almacenan en AsyncStorage
2. **Rate Limiting**: Control automático de velocidad de requests
3. **Error Recovery**: Reintentos automáticos con backoff exponencial
4. **Memory Management**: Limpieza automática de cache expirado
5. **Network Resilience**: Manejo de errores de red y timeouts

## Monitoreo y Analytics

### Métricas Clave

- **Tasa de Atribución**: Porcentaje de usuarios atribuidos exitosamente
- **Confianza Promedio**: Nivel de confianza promedio de las atribuciones
- **Performance API**: Tiempo de respuesta de las llamadas API
- **Cache Hit Rate**: Efectividad del sistema de cache
- **Error Rate**: Tasa de errores en autenticación y API calls

### Eventos Amplitude

- `Apple_Search_Ads_Attribution`: Atribución exitosa
- `Apple_Search_Ads_API_Error`: Errores de API
- `Apple_Search_Ads_Auth_Error`: Errores de autenticación
- `Apple_Search_Ads_Cache_Hit`: Cache exitoso
- `Apple_Search_Ads_Cache_Miss`: Cache miss

## Troubleshooting

### Problemas Comunes

1. **Error de Autenticación OAuth2**
   - Verificar credenciales en `appleSearchAdsAuth.js`
   - Comprobar conectividad de red
   - Revisar logs de error detallados

2. **API Rate Limiting**
   - El sistema maneja automáticamente el rate limiting
   - Aumentar `rateLimitDelay` si es necesario
   - Revisar logs de rate limiting

3. **Cache Issues**
   - Limpiar cache con `appleSearchAdsAPI.clearCache()`
   - Verificar AsyncStorage permissions
   - Revisar logs de cache

4. **Atribución Baja**
   - Ajustar factores de confianza en `ATTRIBUTION_CONFIG`
   - Revisar datos de campañas disponibles
   - Verificar ventana de atribución

### Debugging Commands

```javascript
// Verificar estado de autenticación
const authStatus = await appleSearchAdsAuth.testAuthentication();

// Verificar conexión API
const apiStatus = await appleSearchAdsAPI.testAPIConnection();

// Probar atribución con datos de prueba
const testAttribution = await appleSearchAdsAttribution.testAttribution();

// Limpiar todos los datos
await appleSearchAdsAuth.clearStoredToken();
await appleSearchAdsAPI.clearCache();
```

## Roadmap y Mejoras Futuras

### Próximas Funcionalidades

1. **Machine Learning**: Algoritmos ML para mejorar precisión de atribución
2. **Real-time Attribution**: Atribución en tiempo real
3. **Advanced Analytics**: Dashboard de métricas avanzadas
4. **A/B Testing**: Testing de diferentes algoritmos de atribución
5. **Multi-platform Support**: Soporte para otras plataformas de ads

### Optimizaciones Planificadas

1. **Background Processing**: Procesamiento en background para mejor performance
2. **Offline Support**: Funcionalidad offline con sync automático
3. **Advanced Caching**: Cache inteligente con prefetching
4. **Predictive Attribution**: Atribución predictiva basada en patrones históricos

## Soporte y Contacto

Para soporte técnico o preguntas sobre la integración:

- **Documentación**: Este archivo y comentarios en el código
- **Logs**: Revisar logs detallados en consola
- **Tests**: Ejecutar suite de tests para diagnóstico
- **GitHub Issues**: Reportar bugs o solicitar features

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Compatibilidad**: React Native 0.70+  
**Dependencias**: @react-native-async-storage/async-storage 