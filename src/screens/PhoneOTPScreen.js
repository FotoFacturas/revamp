import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import Spinner from 'react-native-loading-spinner-overlay';
import { AuthContext } from '../contexts/AuthContext';
import * as API from '../lib/api';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NeuButton from './../components/NeuButton';
import { useIsFocused } from '@react-navigation/native';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';
import apiSelector from '../lib/apiSelector';
import { USE_NEW_API } from '../lib/config';

const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);

function useIsMounted() {
  const isMountedRef = React.useRef(false);
  const isMounted = React.useCallback(() => isMountedRef.current, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => (isMountedRef.current = false);
  }, []);

  return isMounted;
}

export default function PhoneOTPScreen(props) {
  const [code, setCode] = React.useState('');
  const [spinner, setSpinner] = React.useState(false);
  const pinInputRef = React.useRef(null);

  const { saveUser } = React.useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const isMounted = useIsMounted();
  const isFocused = useIsFocused();

  const userCellphone = props.route?.params?.cellphone || '';
  const user = props.route?.params?.user || undefined;
  const token = props.route?.params?.token || '';
  const isOnboarding = props.route?.params?.isOnboarding || false;

  const cellphone = userCellphone.replace('*', '');
  // Debug log para verificar configuración
  React.useEffect(() => {
    console.log('📱 PhoneOTPScreen - Configuración:', {
      USE_NEW_API,
      expectedDigits,
      userCellphone,
      hasToken: !!token,
      hasUser: !!user,
      isOnboarding
    });
  }, [expectedDigits, userCellphone, token, user, isOnboarding]);
  // ✅ Dígitos según API: Nueva = 6, Antigua = 5
  const expectedDigits = USE_NEW_API ? 6 : 5;
  const disabled = code.length < 6;

  // Track screen view when component is focused
  React.useEffect(() => {
    if (isFocused) {
      amplitudeService.trackEvent('Phone_OTP_Screen_Viewed', {
        has_token: !!token,
        has_user: !!user
      });
    }
  }, [isFocused, token, user]);

  React.useEffect(() => {
    if (!isMounted()) return;
    if (code.length === 6) handleVerification();
  }, [code]);

  const handleVerifyAndMerge = async () => {
    setSpinner(true);
    try {
      let data;
      if (USE_NEW_API) {
        // ✅ Nueva API: Validar OTP de teléfono
        console.log('🆕 Usando nueva API para validar OTP de teléfono');
        data = await apiSelector.validateOtpPhone(token, code);
      } else {
        // ✅ API antigua
        console.log('🔄 Usando API antigua para validar OTP de teléfono');
        data = await API.authMergeCellphoneVerify(userCellphone, code, token);
      }

      const taxpayerID = data?.user?.taxpayer_identifier || '';
      const hasTaxpayerID = taxpayerID.length > 0;
      const hasCSFPDF = !!data?.user?.csf_pdf_url;

      // Track successful verification
      amplitudeService.trackEvent('Phone_OTP_Verified', {
        has_taxpayer_id: hasTaxpayerID,
        has_csf_pdf: hasCSFPDF,
        is_onboarding: isOnboarding
      });

      setSpinner(false);

      if (hasTaxpayerID || hasCSFPDF) {
        saveUser(data.user, data.token);
      } else {
        props.navigation.navigate('CSFScreenNewUser', {
          userId: data.user.id,
          token: data.token,
          isOnboarding: true,
        });
      }
    } catch (e) {
      console.warn(e);

      // Track error
      amplitudeService.trackEvent('Phone_OTP_Verification_Failed', {
        error_message: e.message,
        error_type: 'unknown'
      });

      Alert.alert(
        'Error de verificación',
        'Por favor intenta nuevamente',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false },
      );
      return;
    }
    setCode('');
  };

  const handleVerification = async () => {
    if (user) {
      await handleVerifyAndMerge();
    } else {
      await handleVerifyOnly();
    }
  };

  const handleVerifyOnly = async () => {
    setSpinner(true);

    try {
      const data = await API.authVerifyCellphoneOTP(userCellphone, code);

      // Track successful verification
      amplitudeService.trackEvent('Phone_OTP_Verified', {
        is_onboarded: data.userIsOnboarded,
        is_onboarding: isOnboarding
      });

      setSpinner(false);

      const hasTaxpayerID = !!data?.user?.taxpayer_identifier;
      const hasCSFPDF = !!data?.user?.csf_pdf_url;

      if (data.userIsOnboarded || hasTaxpayerID || hasCSFPDF) {
        saveUser(data.user, data.token);
      } else {
        props.navigation.navigate('CSFScreenNewUser', {
          userId: data.user.id,
          token: data.token,
        });
      }
    } catch (e) {
      console.warn(e);

      // Track error
      amplitudeService.trackEvent('Phone_OTP_Verification_Failed', {
        error_message: e.message,
        error_type: 'unknown'
      });

      Alert.alert(
        'Error de verificación',
        'Por favor intenta nuevamente',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false },
      );
      return;
    }

    setSpinner(false);
    setCode('');
  };

  return (
    <View style={styles.container}>
      <Spinner visible={spinner} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {isOnboarding ? (
          <>
            <ProgressHeader
              navigation={props.navigation}
              title="Verificación"
              onPress={() => {
                console.log('progress');
                amplitudeService.trackEvent('Progress_Indicator_Tapped', {
                  screen: 'phone_otp',
                  progress: 82
                });
              }}
            />
            <ProgressSteps currentStep={2} />
          </>
        ) : (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() => {
                amplitudeService.trackEvent('Navigation_Back_Button_Tapped', {
                  screen: 'phone_otp'
                });
                props.navigation.goBack();
              }}>
              <Icon name="arrow-left" size={22} color={colors?.text?.primary || '#111827'} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.rootView}>
              <View style={styles.copyView}>
                <Text style={styles.copyTextHeadline}>Escribe el código enviado</Text>
                <Text style={styles.copyTextByline}>
                  Enviamos un código a tu teléfono{' '}
                  <Text style={{ fontWeight: typography?.fontWeight?.bold || '700' }}>{cellphone}</Text>.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  pinInputRef.current?.focus();
                }}>
                <SmoothPinCodeInput
                  ref={pinInputRef}
                  cellSize={50}
                  cellSpacing={8}
                  codeLength={6}
                  value={code}
                  onTextChange={(text) => {
                    setTimeout(() => {
                      // Detectar si se pegó texto (cambio de longitud > 1)
                      if (text.length > code.length + 1) {
                        // Se pegó texto, tomar solo los primeros 6 dígitos
                        const pastedCode = text.replace(/\D/g, '').substring(0, 6);
                        setCode(pastedCode);
                      } else {
                        setCode(text);
                      }
                      // Track when user inputs code
                      if (text.length % 2 === 0) {
                        amplitudeService.trackEvent('Input_Changed', {
                          screen: 'phone_otp',
                          field: 'code',
                          length: text.length
                        });
                      }
                    }, 0);
                  }}
                  restrictToNumbers={true}
                  autoFocus={false}
                  keyboardType="number-pad"
                  maskDelay={0}
                  autoCapitalize="none"
                  enablesReturnKeyAutomatically={false}
                  returnKeyType="done"
                  textContentType="oneTimeCode"
                  editable={true}
                  selectTextOnFocus={true}
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
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <NeuButton
                disabled={disabled}
                label="Siguiente  →"
                callback={handleVerification}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background?.primary || '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing?.lg || 24,
    paddingBottom: 0,
  },
  rootView: {
    flexDirection: 'column',
    paddingTop: spacing?.md || 16,
  },
  copyView: {
    marginTop: spacing?.sm || 8,
    marginBottom: spacing?.md || 16,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  copyTextHeadline: {
    textAlign: 'left',
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
    fontSize: typography?.fontSize?.['3xl'] || 30,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  copyTextByline: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.secondary || '#374151',
    marginTop: spacing?.sm || 14,
  },
  tryAgainView: {
    marginTop: spacing?.md || 16,
  },
  helpText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.tertiary || '#6B7280',
    marginBottom: 4,
  },
  header: {
    height: 80,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingLeft: spacing?.xs || 12,
    paddingRight: spacing?.xs || 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    marginTop: spacing?.sm || 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    marginTop: spacing?.md || 16,
  },
});