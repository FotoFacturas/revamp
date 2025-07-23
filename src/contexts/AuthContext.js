import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import retentionAdvanced from '../utils/retention/retentionAdvanced';
import retentionManager from '../utils/retention/retentionManager';

export const AuthContext = React.createContext(null);

// Hook personalizado para usar el AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

const defaultSession = {
  userId: null,
  email: null,
  token: null,
  loggedIn: false,
  plan: null,
  taxpayer_identifier: null,
  taxpayer_name: null,
  taxpayer_address: null,
  taxpayer_zipcode: null,
  taxpayer_city: null,
  taxpayer_state: null,
  taxpayer_country: null,
  taxpayer_cellphone: null,
  csf_pdf_url: null,
  csf_verified_status: null,
};

export function AuthContextProvider(props) {
  const KEYNAME = '@fotofacturasapp:auth:dev1';

  const [session, setSession] = React.useState(defaultSession);
  const [splashScreenBG, setSplashScreenBG] = React.useState('#5B22FA');

  React.useEffect(() => {
    (async function restoreSessionFromDisk() {
      try {
        const sessionFromDiskString = await AsyncStorage.getItem(KEYNAME);
        const sessionFromDiskObject = JSON.parse(
          sessionFromDiskString || JSON.stringify(defaultSession),
        );
        setSession(sessionFromDiskObject);
      } catch (e) {
        console.warn(e);
        setSession(defaultSession);
      }
    })();
  }, []);

  const saveSession = async session => {
    try {
      setSession(session);
      await AsyncStorage.setItem(KEYNAME, JSON.stringify(session));
    } catch (e) {
      console.warn('setSession error: ', e);
    }
  };

  const saveUser = async (user, token) => {
    const loggedInSession = {
      ...session,
      userId: user.id,
      email: user.email,
      token: token,
      loggedIn: true,
      plan: user.plan,
      taxpayer_identifier: user.taxpayer_identifier,
      taxpayer_name: user.taxpayer_name,
      taxpayer_address: user.taxpayer_address,
      taxpayer_zipcode: user.taxpayer_zipcode,
      taxpayer_city: user.taxpayer_city,
      taxpayer_state: user.taxpayer_state,
      taxpayer_country: user.taxpayer_country,
      taxpayer_district: user.taxpayer_district,
      taxpayer_cellphone: user.taxpayer_cellphone,
      whitelisted_for_purchase: user.whitelisted_for_purchase,
      total_signed_tickets: user.total_signed_tickets,
      csf_pdf_url: user.csf_pdf_url,
      csf_verified_status: user.csf_verified_status,
    };
    saveSession(loggedInSession);
    
    // ✅ AGREGAR ESTO DESPUÉS DEL LOGIN EXITOSO:
    if (user && user.id && user.email) {
      // Initialize retention system for authenticated user
      try {
        console.log('🎯 AuthContext: Initializing retention for authenticated user');
        await retentionManager.initializeUserRetention(user.id, user.email);
      } catch (error) {
        console.error('🚨 AuthContext: Error initializing retention:', error);
      }
    }
  };

  const logout = async () => {
    const loggedOutSession = {
      ...defaultSession,
      email: session.email,
    };
    saveSession(loggedOutSession);
  };

  const contextAPI = {
    session,
    saveUser,
    splashScreenBG,
    setSplashScreenBG,
    logout,
  };

  return (
    <AuthContext.Provider value={contextAPI}>
      {props.children}
    </AuthContext.Provider>
  );
}
