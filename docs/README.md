# Apple Search Ads Integration Documentation

Esta carpeta contiene toda la documentación relacionada con la integración de Apple Search Ads en la app FotoFacturas.

## 📁 Archivos de Documentación

### 1. `APPLE_SEARCH_ADS_INTEGRATION.md`
- **Descripción**: Documentación completa de la integración de Apple Search Ads API
- **Contenido**: 
  - Configuración de OAuth2
  - Módulos de autenticación y API
  - Lógica de atribución
  - Ejemplos de uso
  - Testing y debugging

### 2. `APPLE_SEARCH_ADS_AMPLITUDE_INTEGRATION.md`
- **Descripción**: Integración específica con Amplitude Analytics
- **Contenido**:
  - Configuración de Amplitude
  - Tracking de eventos con atribución
  - User properties y eventos personalizados
  - Ejemplos de implementación

### 3. `APPLE_SEARCH_ADS_UTM_INTEGRATION.md`
- **Descripción**: Integración completa con UTM tracking
- **Contenido**:
  - Flujo de navegación (IntroScreen → MainScreen)
  - Conversión de atribución a UTM
  - Persistencia de datos
  - Troubleshooting y debugging

## 🚀 Implementación

La integración está completamente implementada en los siguientes archivos:

### Archivos Principales
- `src/utils/amplitude.js` - Integración con Amplitude y UTM tracking
- `src/utils/appleSearchAdsAuth.js` - Autenticación OAuth2
- `src/utils/appleSearchAdsAPI.js` - Cliente de API
- `src/utils/appleSearchAdsAttribution.js` - Lógica de atribución

### Pantallas
- `src/screens/IntroScreen.js` - Verificación inicial de atribución
- `src/screens/MainScreen/MainScreen.js` - Aplicación de atribución al usuario

## 📊 Funcionalidades

✅ **Autenticación OAuth2** con múltiples orgIds  
✅ **API Client** con rate limiting y caching  
✅ **Lógica de Atribución** con algoritmo de confianza  
✅ **Integración UTM** automática  
✅ **Tracking Amplitude** con atribución  
✅ **Persistencia** de datos entre pantallas  
✅ **Error Handling** robusto  

## 🔧 Configuración

### Organization IDs
```javascript
orgIds: {
  main: '3839580',      // Softwerk, S.A.P.I. de C.V.
  basic: '3839590',     // Search Ads Basic (default)
  advanced: '3841110'   // Softwerk Advance
}
```

### Platform Support
- **iOS**: ✅ Soporte completo
- **Android**: ❌ No aplicable (Apple Search Ads es iOS-only)

## 📈 Eventos de Amplitude

### Eventos Principales
- `Apple_Search_Ads_Attribution_Found` - Atribución detectada
- `Apple_Search_Ads_Attribution_Applied` - Atribución aplicada
- `Apple_Search_Ads_Attribution_Error` - Errores de atribución

### User Properties
- `first_apple_campaign_id` / `last_apple_campaign_id`
- `first_apple_org_id` / `last_apple_org_id`
- `first_utm_source` / `last_utm_source`
- `first_utm_campaign` / `last_utm_campaign`

## 🧪 Testing

Para testing en desarrollo, puedes usar las funciones de ejemplo en:
- `src/utils/amplitudeAppleSearchAdsExample.js`

## 🐛 Troubleshooting

### Problemas Comunes
1. **Atribución no encontrada**: Verificar orgIds y credenciales
2. **UTM data no aparece**: Verificar AsyncStorage y flujo de datos
3. **Errores de tracking**: Verificar inicialización de Amplitude

### Debug Commands
```javascript
// Verificar datos de atribución almacenados
const attributionData = await AsyncStorage.getItem('apple_search_ads_attribution_data');

// Verificar datos UTM
const utmData = await AsyncStorage.getItem('fotofacturas_utm_data');

// Verificar errores
const errorData = await AsyncStorage.getItem('apple_search_ads_attribution_error');
```

## 📞 Soporte

Para problemas o preguntas sobre la integración:
1. Revisar los logs con emojis 🍎 para Apple Search Ads
2. Verificar la documentación específica en cada archivo
3. Revisar el flujo de navegación (IntroScreen → MainScreen)
4. Verificar la configuración de orgIds y credenciales 