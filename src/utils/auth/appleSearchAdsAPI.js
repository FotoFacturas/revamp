import AsyncStorage from '@react-native-async-storage/async-storage';
import appleSearchAdsAuth from './appleSearchAdsAuth';

// Configuración API
const API_CONFIG = {
  baseUrl: 'https://api.searchads.apple.com/api/v5',
  cacheExpiry: 30 * 60 * 1000, // 30 minutos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  rateLimitDelay: 2000 // 2 segundos entre requests
};

// Storage keys para cache
const CACHE_KEYS = {
  campaignReports: 'apple_search_ads_campaign_reports',
  installsData: 'apple_search_ads_installs_data'
};

// Generar cache key
const getCacheKey = (type, orgId, params = {}) => {
  const paramString = Object.keys(params).length > 0 
    ? '_' + JSON.stringify(params) 
    : '';
  return `${CACHE_KEYS[type]}_${orgId}${paramString}`;
};

// Obtener datos cacheados
const getCachedData = async (cacheKey) => {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const now = Date.now();
      
      if (now < data.expiry) {
        console.log('📦 Usando datos cacheados de Apple Search Ads API');
        return data.data;
      } else {
        console.log('📦 Datos cacheados expirados, eliminando...');
        await AsyncStorage.removeItem(cacheKey);
      }
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo datos cacheados:', error);
    return null;
  }
};

// Almacenar datos en cache
const cacheData = async (cacheKey, data) => {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + API_CONFIG.cacheExpiry,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('📦 Datos almacenados en cache');
  } catch (error) {
    console.error('Error almacenando datos en cache:', error);
  }
};

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic con exponential backoff
const retryRequest = async (requestFn, maxRetries = API_CONFIG.maxRetries) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delayMs = API_CONFIG.retryDelay * Math.pow(2, attempt);
        console.log(`🔄 Reintentando request (${attempt + 1}/${maxRetries + 1}) en ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
};

// Rate limiting
let lastRequestTime = 0;
const rateLimitRequest = async (requestFn) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < API_CONFIG.rateLimitDelay) {
    const delayMs = API_CONFIG.rateLimitDelay - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: esperando ${delayMs}ms...`);
    await delay(delayMs);
  }
  
  lastRequestTime = Date.now();
  return requestFn();
};

// Obtener reportes de campañas
const getCampaignReports = async (options = {}, orgId = null) => {
  try {
    const targetOrgId = orgId || appleSearchAdsAuth.credentials.defaultOrgId;
    const cacheKey = getCacheKey('campaignReports', targetOrgId, options);
    
    // Verificar cache primero
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    if (__DEV__) console.log(`📊 Obteniendo reportes de campañas para orgId: ${targetOrgId}`);
    
    const headers = await appleSearchAdsAuth.getRequestHeaders(targetOrgId);
    
    // Construir query parameters
    const queryParams = new URLSearchParams();
    
    if (options.startTime) queryParams.append('startTime', options.startTime);
    if (options.endTime) queryParams.append('endTime', options.endTime);
    if (options.granularity) queryParams.append('granularity', options.granularity);
    if (options.groupBy) queryParams.append('groupBy', options.groupBy);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.selector) queryParams.append('selector', JSON.stringify(options.selector));
    
    const url = `${API_CONFIG.baseUrl}/reports/campaigns?${queryParams.toString()}`;
    
    const response = await rateLimitRequest(() => 
      retryRequest(() => fetch(url, {
        method: 'GET',
        headers
      }))
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error obteniendo reportes de campañas:', response.status, errorText);
      throw new Error(`Error obteniendo reportes de campañas: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Reportes de campañas obtenidos: ${data.data?.length || 0} registros`);
    
    // Almacenar en cache
    await cacheData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error en getCampaignReports:', error);
    throw error;
  }
};

// Obtener datos de instalaciones
const getInstallsData = async (days = 30, country = null, orgIds = null) => {
  try {
    const targetOrgIds = orgIds || Object.values(appleSearchAdsAuth.credentials.orgIds);
    const cacheKey = getCacheKey('installsData', 'multi', { days, country, orgIds: targetOrgIds });
    
    // Verificar cache primero
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    console.log(`📱 Obteniendo datos de instalaciones para ${targetOrgIds.length} orgIds...`);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const options = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      granularity: 'DAY',
      groupBy: ['countryOrRegion', 'campaignId'],
      limit: 1000
    };
    
    if (country) {
      options.selector = {
        conditions: [{
          field: 'countryOrRegion',
          operator: 'EQUALS',
          values: [country]
        }]
      };
    }
    
    const allData = [];
    const errors = [];
    
    // Obtener datos de todos los orgIds
    for (const orgId of targetOrgIds) {
      try {
        console.log(`  - Obteniendo datos para orgId: ${orgId}`);
        const data = await getCampaignReports(options, orgId);
        
        if (data.data && Array.isArray(data.data)) {
          // Agregar orgId a cada registro
          const enrichedData = data.data.map(record => ({
            ...record,
            orgId,
            source: 'apple_search_ads_api'
          }));
          
          allData.push(...enrichedData);
        }
        
        // Rate limiting entre orgIds
        if (targetOrgIds.length > 1) {
          await delay(1000);
        }
      } catch (error) {
        console.error(`Error obteniendo datos para orgId ${orgId}:`, error);
        errors.push({ orgId, error: error.message });
      }
    }
    
    const result = {
      data: allData,
      summary: {
        totalRecords: allData.length,
        orgIdsProcessed: targetOrgIds.length,
        orgIdsWithErrors: errors.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        country: country || 'all'
      },
      errors: errors.length > 0 ? errors : null
    };
    
    console.log(`✅ Datos de instalaciones obtenidos: ${allData.length} registros de ${targetOrgIds.length} orgIds`);
    
    // Almacenar en cache
    await cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error en getInstallsData:', error);
    throw error;
  }
};

// Obtener datos de campañas específicas
const getCampaignData = async (campaignIds, orgId = null) => {
  try {
    const targetOrgId = orgId || appleSearchAdsAuth.credentials.defaultOrgId;
    console.log(`🎯 Obteniendo datos de campañas específicas: ${campaignIds.join(', ')}`);
    
    const options = {
      granularity: 'DAY',
      groupBy: ['campaignId'],
      limit: 1000,
      selector: {
        conditions: [{
          field: 'campaignId',
          operator: 'IN',
          values: campaignIds
        }]
      }
    };
    
    return await getCampaignReports(options, targetOrgId);
  } catch (error) {
    console.error('Error en getCampaignData:', error);
    throw error;
  }
};

// Obtener datos por país
const getCountryData = async (country, days = 30, orgId = null) => {
  try {
    console.log(`🌍 Obteniendo datos para país: ${country}`);
    return await getInstallsData(days, country, orgId ? [orgId] : null);
  } catch (error) {
    console.error('Error en getCountryData:', error);
    throw error;
  }
};

// Limpiar cache
const clearCache = async (type = null) => {
  try {
    if (type) {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEYS[type]));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`📦 Cache limpiado para tipo: ${type}`);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        Object.values(CACHE_KEYS).some(cacheKey => key.startsWith(cacheKey))
      );
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('📦 Todo el cache de Apple Search Ads API limpiado');
    }
  } catch (error) {
    console.error('Error limpiando cache:', error);
  }
};

// Test de conexión API
const testAPIConnection = async () => {
  try {
    console.log('🔗 Probando conexión con Apple Search Ads API...');
    
    // Test de autenticación
    const authTest = await appleSearchAdsAuth.testAuthentication();
    if (!authTest.success) {
      return { success: false, error: 'Autenticación falló', details: authTest };
    }
    
    // Test de API básico
    const headers = await appleSearchAdsAuth.getRequestHeaders();
    const response = await fetch(`${API_CONFIG.baseUrl}/campaigns?limit=1`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `API request falló: ${response.status}`,
        details: errorText
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      message: 'Conexión API exitosa',
      auth: authTest,
      apiResponse: {
        status: response.status,
        recordCount: data.data?.length || 0
      }
    };
  } catch (error) {
    console.error('Error en testAPIConnection:', error);
    return { success: false, error: error.message };
  }
};

// Test de funcionalidad completa
const testFullFunctionality = async () => {
  try {
    console.log('🧪 Probando funcionalidad completa de Apple Search Ads API...');
    
    const results = {
      auth: await appleSearchAdsAuth.testAuthentication(),
      apiConnection: await testAPIConnection(),
      campaignReports: null,
      installsData: null
    };
    
    // Test de reportes de campañas
    try {
      results.campaignReports = await getCampaignReports({ limit: 5 });
    } catch (error) {
      results.campaignReports = { error: error.message };
    }
    
    // Test de datos de instalaciones
    try {
      results.installsData = await getInstallsData(7); // Últimos 7 días
    } catch (error) {
      results.installsData = { error: error.message };
    }
    
    const allSuccessful = Object.values(results).every(result => 
      result.success !== false && !result.error
    );
    
    return {
      success: allSuccessful,
      results,
      summary: {
        auth: results.auth.success,
        apiConnection: results.apiConnection.success,
        campaignReports: !results.campaignReports.error,
        installsData: !results.installsData.error
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getCampaignReports,
  getInstallsData,
  getCampaignData,
  getCountryData,
  clearCache,
  testAPIConnection,
  testFullFunctionality,
  config: API_CONFIG
}; 