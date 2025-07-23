// src/lib/apiSelector.js
import { USE_NEW_API } from './config';
import newApiWrapper from './newApiWrapper';
import * as oldApi from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🔧 ApiSelector: Configuración USE_NEW_API =', USE_NEW_API);

// ✅ Generador de números de teléfono únicos
const generateUniquePhone = async () => {
  try {
    // Obtener contador de AsyncStorage
    const counterKey = 'unique_phone_counter';
    let counter = await AsyncStorage.getItem(counterKey);
    
    if (!counter) {
      // Empezar con timestamp para evitar colisiones
      counter = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    } else {
      counter = (parseInt(counter) + 1).toString();
    }
    
    // Guardar nuevo contador
    await AsyncStorage.setItem(counterKey, counter);
    
    // Generar número base con padding
    const baseNumber = counter.padStart(6, '0');
    
    // Agregar 4 dígitos más para completar 10
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    
    const phoneNumber = baseNumber + randomSuffix;
    
    console.log('📱 Generando teléfono único:', {
      counter,
      baseNumber,
      randomSuffix,
      phoneNumber,
      length: phoneNumber.length
    });
    
    return phoneNumber;
    
  } catch (error) {
    console.error('❌ Error generando teléfono único:', error);
    // Fallback: número completamente random
    const fallbackPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    console.log('📱 Usando teléfono fallback:', fallbackPhone);
    return fallbackPhone;
  }
};

const apiSelector = {
  // ✅ addUser: Maneja la creación de usuarios
  addUser: async (userData) => {
    console.log('🔄 ApiSelector.addUser: Iniciando con datos:', userData);
    
    if (USE_NEW_API) {
      console.log('🆕 ApiSelector.addUser: Usando SOLO nueva API');
      
      // ✅ Generar teléfono único para nueva API
      const uniquePhone = await generateUniquePhone();
      const phoneCode = '52'; // México
      
      const enhancedUserData = {
        ...userData,
        phone: uniquePhone,
        phoneCode: phoneCode
      };
      
      console.log('📱 Datos con teléfono único:', enhancedUserData);
      
      try {
        const result = await newApiWrapper.addUser(enhancedUserData);
        console.log('✅ ApiSelector.addUser: Nueva API exitosa:', result);
        
        // Después de crear usuario, enviar OTP por email
        try {
          const otpResult = await newApiWrapper.requestLoginOtpEmail(userData.email);
          console.log('✅ ApiSelector.addUser: OTP enviado después de crear usuario:', otpResult);
          
          return {
            ...result,
            ...otpResult,
            user_first_name: userData.fullName,
            fullName: userData.fullName,
            generated_phone: uniquePhone, // ✅ Incluir teléfono generado para referencia
            user_has_phone: true
          };
        } catch (otpError) {
          console.error('❌ ApiSelector.addUser: Error enviando OTP después de crear usuario:', otpError);
          
          // Si falla el OTP pero el usuario se creó, retornamos lo que tenemos
          return {
            ...result,
            user_first_name: userData.fullName,
            fullName: userData.fullName,
            generated_phone: uniquePhone,
            user_has_phone: true
          };
        }
        
      } catch (error) {
        console.error('❌ ApiSelector.addUser: Nueva API falló:', error);
        
        // Si el error es por número duplicado, intentar con otro número
        if (error.message && error.message.includes('teléfono')) {
          console.log('🔄 Reintentando con nuevo número por conflicto...');
          
          try {
            const retryPhone = await generateUniquePhone();
            const retryUserData = {
              ...userData,
              phone: retryPhone,
              phoneCode: phoneCode
            };
            
            console.log('📱 Reintentando con:', retryUserData);
            
            const retryResult = await newApiWrapper.addUser(retryUserData);
            console.log('✅ ApiSelector.addUser: Reintento exitoso:', retryResult);
            
            // Enviar OTP tras reintento exitoso
            try {
              const otpResult = await newApiWrapper.requestLoginOtpEmail(userData.email);
              return {
                ...retryResult,
                ...otpResult,
                user_first_name: userData.fullName,
                fullName: userData.fullName,
                generated_phone: retryPhone,
                user_has_phone: true
              };
            } catch (otpError) {
              return {
                ...retryResult,
                user_first_name: userData.fullName,
                fullName: userData.fullName,
                generated_phone: retryPhone,
                user_has_phone: true
              };
            }
            
          } catch (retryError) {
            console.error('❌ ApiSelector.addUser: Reintento también falló:', retryError);
            throw retryError;
          }
        } else {
          throw error;
        }
      }
    } else {
      console.log('🔄 ApiSelector.addUser: Usando SOLO API antigua');
      const result = await oldApi.authEmail(userData.email);
      console.log('✅ ApiSelector.addUser: API antigua exitosa:', result);
      
      // Agregar fullName a la respuesta para compatibilidad
      return {
        ...result,
        user_first_name: userData.fullName,
        fullName: userData.fullName
      };
    }
  },

  // ✅ requestLoginOtpEmail: Solicitar OTP por email
  requestLoginOtpEmail: async (email) => {
    console.log('🔄 ApiSelector.requestLoginOtpEmail: Iniciando para', email);
    
    if (USE_NEW_API) {
      console.log('🆕 ApiSelector.requestLoginOtpEmail: Usando SOLO nueva API');
      const result = await newApiWrapper.requestLoginOtpEmail(email);
      console.log('✅ ApiSelector.requestLoginOtpEmail: Nueva API exitosa');
      return result;
    } else {
      console.log('🔄 ApiSelector.requestLoginOtpEmail: Usando SOLO API antigua');
      const result = await oldApi.authEmail(email);
      console.log('✅ ApiSelector.requestLoginOtpEmail: API antigua exitosa');
      return result;
    }
  },

  // ✅ loginOtpEmail: Verificar OTP y hacer login
  loginOtpEmail: async (email, otp) => {
    console.log('🔄 ApiSelector.loginOtpEmail: Iniciando para', email, 'con código de', otp.length, 'dígitos');
    
    if (USE_NEW_API) {
      console.log('🆕 ApiSelector.loginOtpEmail: Usando SOLO nueva API (6 dígitos)');
      const result = await newApiWrapper.loginOtpEmail(email, otp);
      console.log('✅ ApiSelector.loginOtpEmail: Nueva API exitosa');
      return result;
    } else {
      console.log('🔄 ApiSelector.loginOtpEmail: Usando SOLO API antigua (5 dígitos)');
      const result = await oldApi.authVerifyEmailOTP(email, otp);
      console.log('✅ ApiSelector.loginOtpEmail: API antigua exitosa');
      return result;
    }
  },

  // ✅ keepSession: Mantener sesión activa
  keepSession: async () => {
    console.log('🔄 ApiSelector.keepSession: Iniciando');
    
    if (USE_NEW_API) {
      console.log('🆕 ApiSelector.keepSession: Usando SOLO nueva API');
      const result = await newApiWrapper.keepSession();
      console.log('✅ ApiSelector.keepSession: Nueva API exitosa');
      return result;
    } else {
      console.log('🔄 ApiSelector.keepSession: Usando SOLO API antigua');
      
      if (oldApi.keepSession) {
        const result = await oldApi.keepSession();
        console.log('✅ ApiSelector.keepSession: API antigua exitosa');
        return result;
      } else {
        throw new Error('keepSession no disponible en API antigua');
      }
    }
  },

  // TODO: Agregar más métodos según se vayan migrando las funcionalidades
  // requestLoginOtpPhone: async (phone) => { ... },
  // loginOtpPhone: async (phone, otp) => { ... },
  // updateUser: async (userData) => { ... },
  // addUserDevice: async (deviceData) => { ... },
  // etc.
};

export default apiSelector;