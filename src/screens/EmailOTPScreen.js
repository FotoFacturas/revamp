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
      console.log('🔄 Verificando OTP:', {
        email: userEmail,
        code: code,
        length: code.length,
        expected: 6,
        api: USE_NEW_API ? 'nueva' : 'antigua'
      });

      let data;
      
      if (USE_NEW_API) {
        if (isOnboarding) {
          // ✅ SIGNUP: Primero login, luego verificar email
          console.log('🆕 Signup flow: Login + Verificar email');
          data = await apiSelector.loginOtpEmail(userEmail, code);
          
          // Después del login exitoso, verificar el email
          try {
            console.log('📧 Marcando email como verificado...');
            await apiSelector.validateOtpEmail(data.data.token, code);
            console.log('✅ Email marcado como verificado');
          } catch (emailVerifyError) {
            console.warn('⚠️ Error marcando email como verificado:', emailVerifyError);
            // No fallar el flujo, solo logging
          }
        } else {
          // ✅ LOGIN: Solo login
          console.log('🆕 Login flow: Solo login');
          data = await apiSelector.loginOtpEmail(userEmail, code);
        }
      } else {
        // ✅ API antigua: 5 dígitos
        data = await API.authVerifyEmailOTP(userEmail, code);
      }

      console.log('✅ OTP verificado exitosamente:', data);

      // ✅ Normalizar datos según API usada
      const normalizedData = USE_NEW_API ? {
        user: {
          id: data.data.userId,
          taxpayer_cellphone: data.data.phone || '',
        },
        token: data.data.token
      } : data;

      // Track successful verification
      amplitudeService.trackEvent('Email_OTP_Verified', {
        has_phone: USE_NEW_API ? !data.data.phone : !data?.user?.taxpayer_cellphone,
        is_onboarding: isOnboarding,
        full_name: fullName,
        api_version: USE_NEW_API ? 'new' : 'old',
        code_length: code.length
      });

      setSpinner(false);

      const phone = USE_NEW_API ? (data.data.phone || '') : (data?.user?.taxpayer_cellphone || '');
      
      // ✅ FLUJO CORRECTO: En onboarding SIEMPRE debe pasar por phoneSignupScreen
      // para capturar y verificar el teléfono REAL del usuario
      if (isOnboarding) {
        // TODOS los usuarios en onboarding necesitan registrar su teléfono REAL
        props.navigation.navigate('phoneSignupScreen', {
          userId: normalizedData.user.id,
          token: normalizedData.token,
          user: normalizedData.user,
          isOnboarding: true,
          fullName: fullName,
        });
      } else {
        // Solo para login de usuarios existentes (no onboarding)
        saveUser(normalizedData.user, normalizedData.token);
      }
    } catch (e) {
      console.error('❌ Error verificando OTP:', e);

      // Track error
      amplitudeService.trackEvent('Email_OTP_Verification_Failed', {
        error_message: e.message || 'unknown_error',
        full_name: fullName,
        code_length: code.length,
        expected_length: 6,
        api_version: USE_NEW_API ? 'new' : 'old'
      });

      Alert.alert(
        'Código incorrecto',
        'El código no es válido. Por favor intenta de nuevo.',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false }
      );
      
      // Limpiar código para que el usuario pueda reintentar
      setCode('');
      
      return;
    }

    setSpinner(false);
    setCode('');
  };

  const handleResendCode = async () => {
    setSpinner(true);
    
    try {
      console.log('🔄 Reenviando código OTP para:', userEmail);
      
      if (USE_NEW_API) {
        // ✅ Nueva API
        await apiSelector.requestLoginOtpEmail(userEmail);
      } else {
        // ✅ API antigua
        await API.authEmail(userEmail);
      }
      
      console.log('✅ Código reenviado exitosamente');
      
      // Track resend
      amplitudeService.trackEvent('Email_OTP_Resent', {
        email: userEmail,
        full_name: fullName,
        api_version: USE_NEW_API ? 'new' : 'old'
      });
      
      Alert.alert(
        'Código enviado',
        `Te hemos enviado un nuevo código de 6 dígitos a tu correo.`,
        [{ text: 'OK' }]
      );
      
    } catch (e) {
      console.error('❌ Error reenviando código:', e);
      
      // Track resend error
      amplitudeService.trackEvent('Email_OTP_Resend_Failed', {
        error_message: e.message,
        email: userEmail,
        api_version: USE_NEW_API ? 'new' : 'old'
      });
      
      Alert.alert(
        'Error',
        'No se pudo reenviar el código. Inténtalo de nuevo.',
        [{ text: 'OK' }]
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
                Enviamos un código de 6 dígitos a tu correo{' '}
                <Text style={{ fontWeight: typography?.fontWeight?.bold || '700' }}>{userEmail}</Text>. 
                Escribe el código de acceso a continuación.
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