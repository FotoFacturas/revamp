import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Credenciales Apple Search Ads
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

// Configuración API
const API_CONFIG = {
  baseUrl: 'https://api.searchads.apple.com/api/v5',
  tokenUrl: 'https://api.searchads.apple.com/api/v5/oauth/token',
  scope: 'searchadsorg',
  tokenExpiryBuffer: 30 * 1000 // 30 segundos buffer
};

// Storage keys
const STORAGE_KEYS = {
  token: 'apple_search_ads_token',
  tokenExpiry: 'apple_search_ads_token_expiry',
  tokenType: 'apple_search_ads_token_type'
};

// OAuth2 Client Credentials Flow
const getOAuth2Token = async () => {
  try {
    console.log('🔐 Solicitando token OAuth2 para Apple Search Ads...');
    
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CREDENTIALS.clientId,
      client_secret: CREDENTIALS.teamId,
      scope: API_CONFIG.scope
    });

    const response = await fetch(API_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Solicitud de token OAuth2 falló:', response.status, errorText);
      throw new Error(`Solicitud de token OAuth2 falló: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    if (!tokenData.access_token) {
      throw new Error('No se recibió access_token en la respuesta OAuth2');
    }

    console.log('✅ Token OAuth2 recibido exitosamente');
    
    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'Bearer',
      expires_in: tokenData.expires_in || 3600, // Default 1 hora
      scope: tokenData.scope
    };
  } catch (error) {
    console.error('Error obteniendo token OAuth2:', error);
    throw new Error(`Error obteniendo token OAuth2: ${error.message}`);
  }
};

// Obtener token almacenado
const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
    const tokenType = await AsyncStorage.getItem(STORAGE_KEYS.tokenType);
    const expiry = await AsyncStorage.getItem(STORAGE_KEYS.tokenExpiry);
    
    if (token && tokenType && expiry) {
      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();
      
      // Verificar si el token sigue siendo válido (con buffer)
      if (now < expiryTime - API_CONFIG.tokenExpiryBuffer) {
        console.log('🔐 Usando token OAuth2 cacheado');
        return {
          access_token: token,
          token_type: tokenType
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo token almacenado:', error);
    return null;
  }
};

// Almacenar token
const storeToken = async (tokenData) => {
  try {
    const expiry = Date.now() + (tokenData.expires_in * 1000);
    
    await AsyncStorage.setItem(STORAGE_KEYS.token, tokenData.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.tokenType, tokenData.token_type);
    await AsyncStorage.setItem(STORAGE_KEYS.tokenExpiry, expiry.toString());
    
    console.log('🔐 Token OAuth2 almacenado');
  } catch (error) {
    console.error('Error almacenando token:', error);
  }
};

// Obtener token válido (generar nuevo si es necesario)
const getValidToken = async () => {
  try {
    // Intentar obtener token almacenado primero
    let tokenData = await getStoredToken();
    
    if (!tokenData) {
      console.log('🔐 Generando nuevo token OAuth2');
      tokenData = await getOAuth2Token();
      await storeToken(tokenData);
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error obteniendo token válido:', error);
    throw new Error('Error obteniendo token válido de Apple Search Ads');
  }
};

// Generar headers para requests API
const getRequestHeaders = async (orgId = null) => {
  try {
    const token = await getValidToken();
    const targetOrgId = orgId || CREDENTIALS.defaultOrgId;
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-AP-Context': `orgId=${targetOrgId}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  } catch (error) {
    console.error('Error generando headers de request:', error);
    throw error;
  }
};

// Limpiar token almacenado
const clearStoredToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.token);
    await AsyncStorage.removeItem(STORAGE_KEYS.tokenType);
    await AsyncStorage.removeItem(STORAGE_KEYS.tokenExpiry);
    console.log('🔐 Token OAuth2 almacenado limpiado');
  } catch (error) {
    console.error('Error limpiando token almacenado:', error);
  }
};

// Test de autenticación
const testAuthentication = async () => {
  try {
    const token = await getValidToken();
    console.log('🔐 Test de autenticación OAuth2 Apple Search Ads exitoso');
    return { 
      success: true, 
      token: token.substring(0, 20) + '...',
      orgIds: CREDENTIALS.orgIds,
      defaultOrgId: CREDENTIALS.defaultOrgId
    };
  } catch (error) {
    console.error('🔐 Test de autenticación OAuth2 Apple Search Ads falló:', error);
    return { success: false, error: error.message };
  }
};

// Test de autenticación con orgId específico
const testAuthenticationWithOrgId = async (orgId) => {
  try {
    const headers = await getRequestHeaders(orgId);
    console.log(`🔐 Probando autenticación con orgId: ${orgId}`);
    
    // Hacer una llamada API simple para probar el token
    const response = await fetch(`${API_CONFIG.baseUrl}/campaigns?limit=1`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      return { success: true, orgId };
    } else {
      const errorText = await response.text();
      return { success: false, orgId, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    return { success: false, orgId, error: error.message };
  }
};

// Test de todos los orgIds
const testAllOrgIds = async () => {
  try {
    console.log('🔐 Probando autenticación para todos los orgIds...');
    const results = {};
    
    for (const [name, orgId] of Object.entries(CREDENTIALS.orgIds)) {
      console.log(`  - Probando ${name} (${orgId})...`);
      results[name] = await testAuthenticationWithOrgId(orgId);
    }
    
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getValidToken,
  getRequestHeaders,
  clearStoredToken,
  testAuthentication,
  testAuthenticationWithOrgId,
  testAllOrgIds,
  credentials: CREDENTIALS,
  config: API_CONFIG
}; 