import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Dimensions,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as API from '../lib/api';
import apiSelector from '../lib/apiSelector'; // ✅ Importar el selector
import Spinner from 'react-native-loading-spinner-overlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import NeuButton from './../components/NeuButton';
import {
  useIsFocused,
  CommonActions
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function EmailSignupScreen(props) {
  const isFocused = useIsFocused();
  const inputRef = useRef(null);
  const mounted = useRef(true);
  const topViewHeight = 80;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [email, setEmail] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [spinner, setSpinner] = useState(false);

  const insets = useSafeAreaInsets();
  const safeAreaTop = insets.top;

  // ✅ Obtener fullName de navigation params
  const { fullName } = props.route?.params || {};

  const centerViewHeight = ((screenHeight - safeAreaTop - topViewHeight - 80) / 9) * 7.9 - (keyboardHeight / 20) * 19;

  // Track screen view when component is focused
  useEffect(() => {
    if (isFocused) {
      amplitudeService.trackEvent('Email_Signup_Screen_Viewed', {
        source: props.route?.params?.source || 'direct',
        has_full_name: !!fullName
      });
    }
  }, [isFocused, fullName]);

  // Debug log para verificar datos recibidos
  useEffect(() => {
    console.log('📩 EmailSignupScreen - Datos recibidos:', {
      fullName,
      routeParams: props.route?.params
    });
  }, [fullName, props.route?.params]);

  // Navigation options setup
  useEffect(() => {
    props.navigation.setOptions({
      gestureEnabled: true
    });
  }, [props.navigation]);

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isFocused]);

  useEffect(() => {
    console.log('📩 EmailSignupScreen focused');
    console.log('📧 EmailSignupScreen navigation state:', props.navigation.getState());
    return () => console.log('❌ EmailSignupScreen unmounted');
  }, [isFocused]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (emailRegex.test(email)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email]);

  const handleEmailContinueButton = async () => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(email)) {
      alert('Ingresa un correo válido');
      amplitudeService.trackEvent('Email_Validation_Failed', {
        reason: 'invalid_format'
      });
      return;
    }

    // ✅ Validar que tengamos fullName
    if (!fullName) {
      Alert.alert(
        'Error',
        'No se recibió el nombre completo. Regresa y vuelve a intentar.',
        [{ text: 'OK', onPress: () => props.navigation.goBack() }]
      );
      return;
    }

    setSpinner(true);

    try {
      // ✅ MIGRACIÓN FASE 1.4: Intentar nueva API primero solo si está habilitada
      console.log('🔄 Creando usuario con datos:', {
        email,
        fullName
      });

      // Preparar datos para nueva API según swagger
      const userData = {
        fullName: fullName,
        email: email,
        phone: null, // Por ahora null, se agregará después
        phoneCode: null, // Por ahora null, se agregará después
        isEmailVerified: false,
        isPhoneVerified: false
      };

      console.log('📤 Intentando apiSelector.addUser:', userData);

      // ✅ Usar el selector que manejará nueva API o fallback automáticamente
      const createUserResult = await apiSelector.addUser(userData);

      console.log('✅ Usuario creado/procesado exitosamente:', createUserResult);
      setSpinner(false);

      // Track successful user creation
      amplitudeService.trackEvent('User_Created_New_Flow', {
        full_name: fullName,
        email: email,
        success: true
      });

      // ✅ Ahora enviar OTP - el resultado puede venir del addUser o del authEmail
      console.log('📧 Procesando OTP con resultado:', createUserResult);

      // Track successful OTP sending
      amplitudeService.trackEvent('Email_OTP_Sent', {
        has_phone: createUserResult.user_has_phone || false,
        is_existing_user: !!createUserResult.user_first_name,
        created_with_new_flow: true,
        full_name: fullName
      });

      props.navigation.navigate('emailOTPScreen', {
        email: email.replace('*', ''),
        isOnboarding: true,
        user_has_phone: createUserResult.user_has_phone,
        user_first_name: createUserResult.user_first_name || fullName,
        fullName: fullName, // ✅ Pasar fullName al siguiente screen
      });

    } catch (e) {
      console.error('❌ Error en flujo completo:', e);
      setSpinner(false);

      // Track error 
      amplitudeService.trackEvent('Email_Signup_Failed', {
        error_message: e.message,
        full_name: fullName,
        email: email
      });

      // Manejar errores existentes
      if (e.message.includes('Multiple accounts')) {
        Alert.alert(
          'Cuenta Empresarial',
          'Esta cuenta ya existe, favor de hacer login con tu teléfono registrado.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  props.navigation.goBack();
                }, 50);
                setTimeout(() => {
                  props.navigation.navigate('phoneLoginScreen');
                }, 500);
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          'Error de conexión',
          'No se pudo procesar el registro. Verifica tu conexión e inténtalo de nuevo.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors?.background?.primary || '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Spinner visible={spinner} />
        <View style={{ flexDirection: 'column' }}>
          <ProgressHeader
            navigation={props.navigation}
            title="Registro"
            onPress={() => {
              console.log('progress');
              amplitudeService.trackEvent('Progress_Indicator_Tapped', {
                screen: 'email_signup',
                progress: 20
              });
            }}
          />

          {/* Add ProgressSteps component */}
          <ProgressSteps currentStep={1} />

          <ScrollView
            horizontal={false}
            scrollEnabled={true}
            pagingEnabled={false}
            style={{ height: centerViewHeight + 200 }}
            contentContainerStyle={{ 
              paddingLeft: spacing?.[6] || 24, 
              paddingRight: spacing?.[6] || 24 
            }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <View style={[styles.containerView]}>
              <View style={[styles.loginCopyView]}>
                {/* ✅ Mostrar nombre recibido para confirmación */}
                <Text style={styles.loginCopyText}>Ingresa tu correo</Text>
              </View>
              <View style={styles.inlineInputs}>
                <TextInput
                  ref={inputRef}
                  autoFocus={true}
                  value={email}
                  style={styles.emailInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors?.text?.tertiary || '#6B7280'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => {
                    setEmail(text);
                    // Track cuando el usuario escribe (una vez cada 2 caracteres para evitar eventos excesivos)
                    if (text.length % 2 === 0) {
                      amplitudeService.trackEvent('Input_Changed', {
                        screen: 'email_signup',
                        field: 'email',
                        length: text.length,
                        has_at_symbol: text.includes('@')
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.helperText}>
                Te enviaremos un código de verificación a este correo
              </Text>
            </View>
            <View
              style={{
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                marginTop: spacing?.[5] || 20,
              }}>
              <NeuButton
                label={spinner ? "Procesando..." : "Siguiente  →"}
                callback={handleEmailContinueButton}
                disabled={disabled}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },
  loginCopyView: {
    marginTop: spacing?.[2] || 8,
    marginBottom: spacing?.[6] || 24,
  },
  loginCopyText: {
    fontSize: typography?.fontSize?.['3xl'] || 30,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  // ✅ Nuevo estilo para el texto de bienvenida
  welcomeText: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.secondary || '#6B7280',
    fontWeight: typography?.fontWeight?.medium || '500',
    marginTop: spacing?.[2] || 8,
  },
  inlineInputs: {
    height: 100,
    flexDirection: 'row',
    width: screenWidth - 56,
  },
  button: {
    shadowColor: colors?.primary?.[600] + '99' || 'rgba(72, 30, 204,0.6)',
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
    backgroundColor: colors?.primary?.[500] || '#5B22FA',
    paddingTop: spacing?.[2] || 8,
    paddingBottom: spacing?.[5] || 22,
    paddingLeft: spacing?.[6] || 24,
    paddingRight: spacing?.[6] || 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
    flexGrow: 1,
  },
  buttonText: {
    fontWeight: typography?.fontWeight?.bold || '700',
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.inverse || '#FFFFFF',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    marginTop: spacing?.[2] || 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailInput: {
    height: 60,
    flexGrow: 1,
    fontSize: typography?.fontSize?.xl || 20,
    borderWidth: 1,
    borderRadius: borderRadius?.lg || 12,
    width: screenWidth - 56,
    borderColor: colors?.border?.medium || '#D1D5DB',
    color: colors?.text?.primary || '#111827',
    paddingLeft: spacing?.[4] || 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: colors?.background?.primary || '#FFFFFF',
  },
  helperText: {
    color: colors?.text?.secondary || '#374151',
    fontSize: typography?.fontSize?.sm || 14,
    marginLeft: spacing?.[1] || 4,
    marginTop: spacing?.[1] || 4,
  },
});