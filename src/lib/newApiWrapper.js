// newApiWrapper.js - Versión corregida según documentación
import * as HTTP from './http';
import { NEW_API_BASE_URL } from './config';

// ✅ Verificar que BASE_URL esté correcta al inicio del archivo
const BASE_URL = 'https://api-dev.fotofacturas.ai';

console.log('🌐 NEW API BASE_URL configurada:', BASE_URL);

class NewApiWrapper {
  constructor() {
    this.baseUrl = BASE_URL;
    this.timeout = 10000; // 10 segundos timeout
  }

  // Helper para headers con JWT
  getAuthHeaders(token, hasBody = true) {
    const headers = {};
    
    // Solo agregar Content-Type si hay body
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Helper mejorado para requests con manejo de errores y timeout manual compatible con React Native
  async authenticatedRequest(endpoint, options = {}, token) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const hasBody = !!options.body;
    
    // LOGGING DETALLADO
    console.log('\n🔵 ===== NEW API CALL DETAILS =====');
    console.log(`📍 Full URL: ${url}`);
    console.log(`🔧 Method: ${method}`);
    console.log(`🏠 Base URL: ${this.baseUrl}`);
    console.log(`📝 Endpoint: ${endpoint}`);
    
    if (token) {
      console.log(`🔐 Has Token: YES (${token.substring(0, 20)}...)`);
    } else {
      console.log(`🔐 Has Token: NO`);
    }
    
    if (options.body) {
      console.log(`📦 Body: ${options.body}`);
    }
    
    console.log(`📋 Headers:`, this.getAuthHeaders(token, hasBody));
    console.log('🔵 ================================\n');
    
    // Timeout manual compatible con React Native
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);
    
    const requestOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        ...this.getAuthHeaders(token, hasBody),
        ...options.headers
      }
    };
  
    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId); // Limpiar timeout si la request es exitosa
      
      // LOGGING DE RESPONSE DETALLADO
      console.log('\n✅ ===== RESPONSE DETAILS =====');
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      console.log(`🌐 URL Called: ${url}`);
      console.log(`⏱️ Method: ${method}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error Response: ${errorText}`);
        console.log('✅ =============================\n');
        
        const error = new Error(`HTTP_${response.status}: ${errorText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }

      const result = await response.json();
      console.log(`✅ Success Response:`, { 
        isSuccess: result.isSuccess,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      });
      console.log('✅ =============================\n');
      
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId); // Limpiar timeout en caso de error
      
      if (error.name === 'AbortError') {
        console.error(`⏰ Timeout en ${endpoint} después de ${this.timeout}ms`);
        throw new Error(`REQUEST_TIMEOUT: ${endpoint}`);
      }
      
      if (error.name === 'TypeError') {
        console.error(`🌐 Error de red en ${endpoint}:`, error.message);
        throw new Error(`NETWORK_ERROR: ${error.message}`);
      }
      
      console.error(`❌ Error en ${endpoint}:`, error.message);
      throw error;
    }
  }

  // === MÉTODOS DE AUTENTICACIÓN ===

  async requestLoginOtpEmail(email) {
    console.log('📧 requestLoginOtpEmail called with email:', email);
    if (!email || !email.includes('@')) {
      throw new Error('INVALID_EMAIL: Email requerido y válido');
    }
    // ✅ URL CORRECTA según swagger
    const url = `${this.baseUrl}/Api/MobileV1Security/RequestLoginOtpEmail`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email })
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      if (!data.isSuccess) {
        throw new Error(data.message || 'RequestLoginOtpEmail falló');
      }
      return data;
    });
  }

  async loginOtpEmail(email, otp) {
    console.log('🔓 loginOtpEmail called with email:', email, 'otp:', otp);
    if (!email || !otp) {
      throw new Error('MISSING_PARAMS: Email y OTP requeridos');
    }
    if (otp.length < 4) {
      throw new Error('INVALID_OTP: OTP debe tener al menos 4 dígitos');
    }
    // ✅ URL CORRECTA según swagger
    const url = `${this.baseUrl}/Api/MobileV1Security/LoginOtpEmail`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, otp })
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      if (!data.isSuccess) {
        throw new Error(data.message || 'LoginOtpEmail falló');
      }
      return data;
    });
  }

  async requestLoginOtpPhone(phone) {
    console.log('📱 requestLoginOtpPhone called with phone:', phone);
    if (!phone) {
      throw new Error('MISSING_PHONE: Número de teléfono requerido');
    }
    return this.authenticatedRequest('/MobileV1Security/RequestLoginOtpPhone', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async loginOtpPhone(phone, otp) {
    console.log('🔓 loginOtpPhone called with phone:', phone, 'otp:', otp);
    if (!phone || !otp) {
      throw new Error('MISSING_PARAMS: Teléfono y OTP requeridos');
    }
    return this.authenticatedRequest('/MobileV1Security/LoginOtpPhone', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  }

  // === MÉTODOS DE SESIÓN ===
  // Según seguridad.md: /Api/MobileV1/KeepSession

  async keepSession(token) {
    console.log('🔄 keepSession called - POST sin body, solo Authorization header');
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    // ✅ URL CORRECTA según swagger
    const url = `${this.baseUrl}/Api/MobileV1Security/KeepSession`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      if (!data.isSuccess) {
        throw new Error(data.message || 'KeepSession falló');
      }
      return data;
    });
  }

  // === MÉTODOS DE VERIFICACIÓN OTP ===
  // Según seguridad.md: /Api/MobileV1/RequestVerifyOtpEmail

  async requestVerifyOtpEmail(token) {
    console.log('📧 requestVerifyOtpEmail called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    // ✅ URL CORRECTA (según swagger):
    return this.authenticatedRequest('/Api/MobileV1Security/RequestVerifyOtpEmail', {
      method: 'POST'
    }, token);
  }

  async validateOtpEmail(token, otp) {
    console.log('✅ validateOtpEmail called with otp:', otp);
    
    if (!token || !otp) {
      throw new Error('MISSING_PARAMS: Token y OTP requeridos');
    }
    
    return this.authenticatedRequest('/Api/MobileV1Security/ValidateOtpEmail', {
      method: 'POST',
      body: JSON.stringify({ otp })
    }, token);
  }

  async requestVerifyOtpPhone(token) {
    console.log('📱 requestVerifyOtpPhone called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    return this.authenticatedRequest('/Api/MobileV1Security/RequestVerifyOtpPhone', {
      method: 'POST'
    }, token);
  }

  async validateOtpPhone(token, otp) {
    console.log('✅ validateOtpPhone called with otp:', otp);
    
    if (!token || !otp) {
      throw new Error('MISSING_PARAMS: Token y OTP requeridos');
    }
    
    return this.authenticatedRequest('/Api/MobileV1Security/ValidateOtpPhone', {
      method: 'POST',
      body: JSON.stringify({ otp })
    }, token);
  }

  // === MÉTODOS DE USUARIO ===
  // Según usuario.md: /Api/MobileV1/GetUserData, /Api/MobileV1/AddUser

  async getUserData(token) {
    console.log('👤 getUserData called with token:', token ? 'YES' : 'NO');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    return this.authenticatedRequest('/Api/MobileV1User/GetUserData', {
      method: 'GET'
    }, token);
  }

  async updateUser(token, updateData) {
    console.log('📝 updateUser called with data:', Object.keys(updateData));
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    return this.authenticatedRequest('/Api/MobileV1User/UpdateUser', {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, token);
  }

  async addUser(userData) {
    console.log('➕ addUser called with:', userData);
    
    const url = `${this.baseUrl}/Api/MobileV1User/AddUser`;
    
    // Mapear fullName a name y pSurname (asumiendo formato "Nombre Apellido")
    let name = '';
    let pSurname = '';
    let mSurname = '';
    if (userData.fullName) {
      const parts = userData.fullName.trim().split(' ');
      name = parts[0] || '';
      pSurname = parts[1] || '';
      mSurname = parts.slice(2).join(' ') || '';
    }
    // Si no hay mSurname, dejarlo vacío
    
    const payload = {
      associationId: 1,
      email: userData.email,
      name,
      pSurname,
      mSurname,
      phone: userData.phone,
      phoneCode: userData.phoneCode
    };
    
    console.log('\n🔵 ===== NEW API CALL DETAILS =====');
    console.log('📍 Full URL:', url);
    console.log('🔧 Method: POST');
    console.log('📦 Body:', JSON.stringify(payload));
    console.log('📋 Headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    console.log('🔵 ================================\n');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('\n✅ ===== RESPONSE DETAILS =====');
      console.log('📡 Status:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('🌐 URL Called:', url);
      console.log('⏱️ Method: POST');
      console.log('📋 Response Headers:', JSON.stringify([...response.headers.entries()]));
      
      // ✅ Verificar si la respuesta tiene contenido
      const responseText = await response.text();
      console.log('📄 Raw Response Text:', responseText);
      console.log('📏 Response Length:', responseText.length);
      console.log('✅ =============================\n');
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP_${response.status}: ${response.statusText}`);
      }
      
      // ✅ Intentar parsear JSON solo si hay contenido
      if (!responseText || responseText.length === 0) {
        console.error('❌ Respuesta vacía del servidor');
        throw new Error('Respuesta vacía del servidor');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📥 [NEW API] AddUser parsed response:', data);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.error('❌ Raw response que causó el error:', responseText);
        throw new Error(`JSON Parse Error: ${parseError.message}`);
      }
      
      if (!data.isSuccess) {
        throw new Error(data.message || 'AddUser falló');
      }
      
      return data; // Retorna FFResponse
      
    } catch (error) {
      console.error('❌ [NEW API] AddUser error:', error);
      throw error;
    }
  }

  // === MÉTODOS DE INFORMACIÓN FISCAL ===
  // Según usuario.md: /Api/MobileV1/AddUserTaxInfo, /Api/MobileV1/AddUserTaxInfoAutomated

  async addUserTaxInfo(token, taxInfoData) {
    console.log('🏛️ addUserTaxInfo called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    return this.authenticatedRequest('/AddUserTaxInfo', {
      method: 'POST',
      body: JSON.stringify(taxInfoData)
    }, token);
  }

  async addUserTaxInfoAutomated(token, pdfFile) {
    console.log('🤖 addUserTaxInfoAutomated called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    const formData = new FormData();
    formData.append('file', {
      uri: pdfFile.uri,
      type: 'application/pdf',
      name: pdfFile.name || 'csf.pdf'
    });

    return this.authenticatedRequest('/AddUserTaxInfoAutomated', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }, token);
  }

  // === MÉTODOS DE TICKETS ===
  // Según ticket.md: /Api/MobileV1/GetTickets, /Api/MobileV1/AddTicket

  async getTickets(token) {
    console.log('🎫 getTickets called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    return this.authenticatedRequest('/GetTickets', {
      method: 'GET'
    }, token);
  }

  async getTicket(token, ticketId) {
    console.log('🎫 getTicket called with ID:', ticketId);
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    // TODO: Verificar si ticketId va en query params o en path según swagger
    return this.authenticatedRequest(`/GetTicket?ticketId=${ticketId}`, {
      method: 'GET'
    }, token);
  }

  async addTicket(token, ticketData) {
    console.log('➕ addTicket called');
    
    if (!token) {
      throw new Error('MISSING_TOKEN: Token de sesión requerido');
    }
    
    const formData = new FormData();
    
    // Agregar imagen
    if (ticketData.image) {
      formData.append('file', {
        uri: ticketData.image.uri,
        type: 'image/jpeg',
        name: 'ticket.jpg'
      });
    }
    
    // Agregar otros datos del ticket
    Object.keys(ticketData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, ticketData[key]);
      }
    });

    return this.authenticatedRequest('/AddTicket', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }, token);
  }

  // === MÉTODOS DE CONFIGURACIÓN ===

  setTimeout(ms) {
    this.timeout = ms;
    console.log(`⚙️ Timeout configurado a ${ms}ms`);
  }

  // Método para test básico de conectividad
  async ping() {
    try {
      const startTime = Date.now();
      await this.authenticatedRequest('/ping', { method: 'GET' });
      const responseTime = Date.now() - startTime;
      console.log(`🏓 Ping exitoso: ${responseTime}ms`);
      return { success: true, responseTime };
    } catch (error) {
      console.log(`🏓 Ping falló: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Método para verificar conectividad básica
  async testConnection() {
    try {
      console.log(`🌐 Testing connection to: ${this.baseUrl}`);
      const response = await fetch(this.baseUrl.replace('/Api/MobileV1', '/health') || this.baseUrl);
      console.log(`🌐 Connection test result: ${response.status}`);
      return response.status < 500;
    } catch (error) {
      console.log(`🌐 Connection test failed: ${error.message}`);
      return false;
    }
  }
}

export default new NewApiWrapper();