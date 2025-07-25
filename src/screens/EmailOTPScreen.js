import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
  Clipboard,
  TextInput,
} from 'react-native';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import Spinner from 'react-native-loading-spinner-overlay';
import { AuthContext } from './../contexts/AuthContext';
import * as API from './../lib/api';
import apiSelector from '../lib/apiSelector';
import { USE_NEW_API } from '../lib/config';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import NeuButton from './../components/NeuButton';
import { useIsFocused } from '@react-navigation/native';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenHeight = Math.round(Dimensions.get('window').height);

function useIsMounted() {
  const isMountedRef = React.useRef(false);
  const isMounted = React.useCallback(() => isMountedRef.current, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => (isMountedRef.current = false);
  }, []);

  return isMounted;
}

export default function EmailOTPScreen(props) {
  const [code, setCode] = React.useState('');
  const [spinner, setSpinner] = React.useState(false);

  // Estados para manejar verificación en dos pasos
  const [verificationStep, setVerificationStep] = React.useState('login'); // 'login' | 'verify'
  const [userData, setUserData] = React.useState(null);
  const [userToken, setUserToken] = React.useState(null);

  const { saveUser } = React.useContext(AuthContext);
  const isMounted = useIsMounted();
  const insets = useSafeAreaInsets();
  const pinInputRef = React.useRef(null);
  const isFocused = useIsFocused();

  // ✅ Dígitos según API: Nueva = 6, Antigua = 5
  const disabled = code.length < 6;

  const _userEmail = props.route?.params?.email || '';
  const userEmail = _userEmail.replace('*', '');
  const userHasPhone = props.route?.params?.user_has_phone || false;
  const isOnboarding = props.route?.params?.isOnboarding || false;
  const fullName = props.route?.params?.fullName || '';

  // Track screen view when component is focused
  React.useEffect(() => {
    if (isFocused) {
      amplitudeService.trackEvent('Email_OTP_Screen_Viewed', {
        has_phone: userHasPhone,
        is_onboarding: isOnboarding,
        has_full_name: !!fullName,
        code_length_expected: 6,
        api_version: USE_NEW_API ? 'new' : 'old'
      });
    }
  }, [isFocused, userHasPhone, isOnboarding, fullName, USE_NEW_API]);

  // Debug log para verificar datos recibidos
  React.useEffect(() => {
    console.log('📧 EmailOTPScreen - Configuración:', {
      USE_NEW_API,
      expectedDigits: 6,
      userEmail,
      userHasPhone,
      isOnboarding,
      fullName,
      routeParams: props.route?.params
    });
  }, [USE_NEW_API, userEmail, userHasPhone, isOnboarding, fullName, props.route?.params]);

  React.useEffect(() => {
    if (!isMounted()) return;
    if (code.length === 6) handleVerification();
  }, [code]);

  const handleVerification = async () => {
    setSpinner(true);

    try {
      const { isUpdate, tempAccount, realEmail } = props.route?.params || {};
      
      console.log('🔄 Verificando OTP:', {
        email: userEmail, // Email temporal
        realEmail: realEmail, // Email real
        code: code,
        isUpdate: isUpdate,
        tempAccount: tempAccount
      });

      if (isUpdate && tempAccount && realEmail) {
        // ✅ FLUJO ELEGANTE PASO 1: Login con email temporal
        console.log('🆕 Flujo elegante: Login con email temporal');
        
        // 1. Login con email temporal para obtener token
        const loginData = await apiSelector.loginOtpEmail(userEmail, code);
        const token = loginData.data.token;
        const userId = loginData.data.userId;
        
        console.log('✅ Login temporal exitoso, token obtenido');
        
        // 2. Actualizar email a uno real
        await apiSelector.updateUser(token, { email: realEmail });
        console.log('✅ Email actualizado a:', realEmail);
        
        // 3. Solicitar OTP para verificar el email real
        await apiSelector.requestVerifyOtpEmail(token);
        console.log('✅ OTP de verificación enviado al email real');
        
        setSpinner(false);
        
        // 4. Mostrar mensaje y navegar a verificar email real
        Alert.alert(
          'Email actualizado',
          `Hemos enviado un código de verificación a ${realEmail}. Por favor ingrésalo.`,
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navegar a verificar el email real
              props.navigation.replace('emailOTPScreen', {
                email: realEmail,
                fullName: fullName,
                token: token,
                userId: userId,
                isOnboarding: true,
                isVerifyingReal: true
              });
            }
          }]
        );
        
      } else if (props.route?.params?.isVerifyingReal) {
        // ✅ FLUJO ELEGANTE PASO 2: Verificar email real
        console.log('🔄 Verificando email real');
        
        const { token, userId } = props.route?.params || {};
        
        await apiSelector.validateOtpEmail(token, code);
        console.log('✅ Email real verificado exitosamente');
        
        setSpinner(false);
        
        // Continuar al flujo de teléfono
        props.navigation.navigate('phoneSignupScreen', {
          userId: userId,
          token: token,
          fullName: fullName,
          isOnboarding: true,
          isUpdate: true
        });
        
      } else {
        // ✅ FLUJO ANTERIOR: Mantener como fallback
        console.log('🔄 Usando flujo anterior');
        
        let data;
        if (USE_NEW_API) {
          if (isOnboarding) {
            console.log('🆕 Signup flow: Solo login');
            data = await apiSelector.loginOtpEmail(userEmail, code);
            console.log('✅ Login exitoso - Email considerado verificado');
          } else {
            console.log('🆕 Login flow: Solo login');
            data = await apiSelector.loginOtpEmail(userEmail, code);
          }
        } else {
          data = await API.authVerifyEmailOTP(userEmail, code);
        }

        const normalizedData = USE_NEW_API ? {
          user: {
            id: data.data.userId,
            taxpayer_cellphone: data.data.phone || '',
          },
          token: data.data.token
        } : data;

        amplitudeService.trackEvent('Email_OTP_Verified', {
          has_phone: USE_NEW_API ? !data.data.phone : !data?.user?.taxpayer_cellphone,
          is_onboarding: isOnboarding,
          full_name: fullName,
          api_version: USE_NEW_API ? 'new' : 'old',
          code_length: code.length
        });

        setSpinner(false);

        if (isOnboarding) {
          props.navigation.navigate('phoneSignupScreen', {
            userId: normalizedData.user.id,
            token: normalizedData.token,
            user: normalizedData.user,
            isOnboarding: true,
            fullName: fullName,
          });
        } else {
          saveUser(normalizedData.user, normalizedData.token);
        }
      }

    } catch (e) {
      console.error('❌ Error verificando OTP:', e);
      setSpinner(false);
      
      amplitudeService.trackEvent('Email_OTP_Verification_Failed', {
        error_message: e.message || 'unknown_error',
        full_name: fullName,
        code_length: code.length,
        api_version: USE_NEW_API ? 'new' : 'old'
      });

      Alert.alert(
        'Código incorrecto',
        'El código no es válido. Por favor intenta de nuevo.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      
      setCode('');
    }

    setSpinner(false);
    setCode('');
  };

  const handleResendCode = async () => {
    setSpinner(true);
    
    try {
      console.log('🔄 Reenviando código OTP para:', userEmail, 'paso:', verificationStep);
      
      if (verificationStep === 'login') {
        // Reenviar código de login
        if (USE_NEW_API) {
          await apiSelector.requestLoginOtpEmail(userEmail);
        } else {
          await API.authEmail(userEmail);
        }
      } else if (verificationStep === 'verify') {
        // Reenviar código de verificación
        await apiSelector.requestVerifyOtpEmail(userToken);
      }
      
      console.log('✅ Código reenviado exitosamente');
      
      // Track resend
      amplitudeService.trackEvent('Email_OTP_Resent', {
        email: userEmail,
        full_name: fullName,
        step: verificationStep,
        api_version: USE_NEW_API ? 'new' : 'old'
      });
      
      Alert.alert(
        'Código reenviado',
        'Te hemos enviado un nuevo código.',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false }
      );
      
    } catch (e) {
      console.error('❌ Error reenviando código:', e);
      
      Alert.alert(
        'Error',
        'No se pudo reenviar el código. Intenta de nuevo.',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false }
      );
    }
    
    setSpinner(false);
  };

  return (
    <View style={styles.container}>
      <Spinner visible={spinner} />
      <View style={{ paddingTop: insets.top }}>
        {isOnboarding ? (
          <>
            <ProgressHeader
              navigation={props.navigation}
              title="Verificación"
              onPress={() => {
                console.log('progress');
                amplitudeService.trackEvent('Progress_Indicator_Tapped', {
                  screen: 'email_otp',
                  progress: userHasPhone ? 100 : 35
                });
              }}
            />
            <ProgressSteps currentStep={1} />
          </>
        ) : (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() => {
                amplitudeService.trackEvent('Navigation_Back_Button_Tapped', {
                  screen: 'email_otp'
                });
                props.navigation.goBack();
              }}
            >
              <Icon name="arrow-left" size={22} color={colors?.text?.primary || '#111827'} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.rootView}>
            <View style={styles.copyView}>
              <Text style={styles.copyTextHeadline}>Revisa tu correo</Text>
              <Text style={styles.copyTextByline}>
                {verificationStep === 'login' 
                  ? `Enviamos un código de acceso a tu email `
                  : `Enviamos un código de verificación a tu email `
                }
                <Text style={{ fontWeight: typography?.fontWeight?.bold || '700' }}>{userEmail}</Text>.
              </Text>
            </View>

            {/* TextInput invisible para manejar pegar */}
            <TextInput
              style={{ position: 'absolute', left: -1000, opacity: 0 }}
              value=""
              onChangeText={(text) => {
                // Detectar pegar - si hay más de 1 carácter pegado
                if (text.length > 1) {
                  const pastedCode = text.replace(/\D/g, '').substring(0, 6);
                  if (pastedCode.length >= 4) {
                    setCode(pastedCode);
                  }
                }
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                pinInputRef.current?.focus();
              }}
              onLongPress={() => {
                Clipboard.getString().then((clipboardContent) => {
                  const pastedCode = clipboardContent.replace(/\D/g, '').substring(0, 6);
                  if (pastedCode.length >= 4) {
                    setCode(pastedCode);
                  }
                });
              }}
            >
              <SmoothPinCodeInput
                ref={pinInputRef}
                cellSize={50}
                cellSpacing={8}
                codeLength={6}
                value={code}
                onTextChange={setCode}
                restrictToNumbers={true}
                autoFocus={false}
                keyboardType="number-pad"
                cellStyle={{
                  borderWidth: 1,
                  borderColor: colors?.border?.medium || '#D1D5DB',
                  backgroundColor: colors?.background?.primary || '#FFFFFF',
                  borderRadius: borderRadius?.md || 8,
                  height: 50,
                  width: 50,
                }}
                cellStyleFocused={{
                  borderWidth: 2,
                  borderColor: colors?.primary?.[500] || '#5B22FA',
                  backgroundColor: colors?.background?.primary || '#FFFFFF',
                  borderRadius: borderRadius?.md || 8,
                  height: 50,
                  width: 50,
                }}
                cellStyleFilled={{
                  borderWidth: 1,
                  borderColor: colors?.primary?.[500] || '#5B22FA',
                  backgroundColor: colors?.background?.primary || '#FFFFFF',
                  borderRadius: borderRadius?.md || 8,
                  height: 50,
                  width: 50,
                }}
                textStyle={{
                  color: colors?.text?.primary || '#111827',
                  fontSize: typography?.fontSize?.xl || 20,
                  fontWeight: typography?.fontWeight?.bold || '700',
                }}
                onFulfill={() => {
                  pinInputRef.current?.blur();
                }}
              />
            </TouchableOpacity>

            <View style={styles.tryAgainView}>
              <Text style={styles.helpText}>
                Puede tardar hasta 1 minuto en llegar.
              </Text>
              <TouchableOpacity 
                style={styles.resendContainer}
                onPress={handleResendCode}
                disabled={spinner}
              >
                <Text style={styles.resendText}>
                  ¿No recibiste el código? 
                  <Text style={styles.resendLink}> Reenviar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background?.primary || '#FFFFFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing?.[4] || 16,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing?.[6] || 24,
  },
  rootView: {
    flex: 1,
    paddingTop: spacing?.[8] || 32,
  },
  copyView: {
    marginBottom: spacing?.[8] || 32,
  },
  copyTextHeadline: {
    fontSize: typography?.fontSize?.['3xl'] || 30,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[4] || 16,
  },
  copyTextByline: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.secondary || '#6B7280',
    lineHeight: 24,
  },
  welcomeText: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.secondary || '#6B7280',
    fontWeight: typography?.fontWeight?.medium || '500',
    marginTop: spacing?.[4] || 16,
  },
  tryAgainView: {
    marginTop: spacing?.[8] || 32,
    alignItems: 'center',
  },
  helpText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.tertiary || '#9CA3AF',
    textAlign: 'center',
    marginBottom: spacing?.[4] || 16,
  },
  resendContainer: {
    paddingVertical: spacing?.[2] || 8,
  },
  resendText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#6B7280',
    textAlign: 'center',
  },
  resendLink: {
    color: colors?.primary?.[500] || '#5B22FA',
    fontWeight: typography?.fontWeight?.medium || '500',
  },
});