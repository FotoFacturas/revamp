import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Dimensions,
  Alert,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import * as API from './../lib/api';
import Spinner from 'react-native-loading-spinner-overlay';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NeuButton from './../components/NeuButton';
import { useIsFocused } from '@react-navigation/native';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);

export default function PhoneSignupScreen(props) {
  const topViewHeight = 80;

  const [cellphone, setCellphone] = React.useState('');
  const [spinner, setSpinner] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const token = props.route?.params?.token || '';
  const user = props.route?.params?.user || {};

  // Track screen view when component is focused
  React.useEffect(() => {
    if (isFocused) {
      amplitudeService.trackEvent('Phone_Signup_Screen_Viewed', {
        has_token: !!token,
        has_user: !!Object.keys(user).length
      });
    }
  }, [isFocused, token, user]);

  const handlePhoneVerifyButton = async () => {
    setSpinner(true);

    if (cellphone.length < 10) {
      Alert.alert(
        'Error de verificación',
        'Ingresa un número de celular válido',
        [{ text: 'OK', onPress: () => setSpinner(false) }],
        { cancelable: false },
      );
      
      amplitudeService.trackEvent('Phone_Validation_Failed', {
        reason: 'invalid_format'
      });
      
      return;
    }

    try {
      // Keep the original phone number with * if present
      const e164phone = `+52${cellphone}`;
      
      // Use the direct API calls that the backend expects
      if (token) {
        // With token - merge flow
        await API.authMergeCellphoneIntent(e164phone, token);
      } else {
        // Without token - use find_or_create cellphone endpoint
        await API.authCellphone(e164phone);
      }
      
      // Track successful OTP sending
      amplitudeService.trackEvent('Phone_OTP_Sent', {
        phone_length: cellphone.length,
        has_asterisk: cellphone.includes('*')
      });
      
      setSpinner(false);
      props.navigation.navigate('phoneOtpScreen', {
        cellphone: e164phone.replace(/\*/g, ''),
        user: user,
        token: token,
        isOnboarding: true,
      });
    } catch (e) {
      console.warn('Error on PhoneVerifyScreen', e);
      
      // Track error
      amplitudeService.trackEvent('Phone_OTP_Failed', {
        error_message: e.message,
        error_type: e.message && e.message.includes('verification_04') ? 'phone_in_use' : 'other'
      });
      
      if (e.message.includes('verification_04')) {
        Alert.alert(
          'Celular Registrado',
          'Ese teléfono ya está en uso para otra cuenta.\n\nEscoge otro número o contacta a soporte +525522613142',
          [{ text: 'OK', onPress: () => setSpinner(false) }],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          'Error de verificación',
          'Por favor intenta nuevamente',
          [{ text: 'OK', onPress: () => setSpinner(false) }],
          { cancelable: false },
        );
      }
      return;
    }
  };

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      handleKeyboardDidShow,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardDidHide,
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Updated useEffect to require exactly 10 characters
  React.useEffect(() => {
    setDisabled(cellphone.length < 10);
  }, [cellphone]);

  const handleKeyboardDidShow = event => {
    console.log('keyboardDidShow', event.endCoordinates.height);
  };

  const handleKeyboardDidHide = () => {
    console.log('keyboardDidHide');
  };

  const isOnboarding = props.route?.params?.isOnboarding || false;

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: colors?.background?.primary || '#FAFAFA' }}>
      <Spinner visible={spinner} />
      <View style={{ flexDirection: 'column' }}>
        {isOnboarding ? (
          <>
            <ProgressHeader
              navigation={props.navigation}
              title="Registro"
              onPress={() => {
                console.log('progress');
                amplitudeService.trackEvent('Progress_Indicator_Tapped', {
                  screen: 'phone_signup',
                  progress: 55
                });
              }}
            />
            <ProgressSteps currentStep={2} />
          </>
        ) : (
          <View
            style={{
              height: topViewHeight,
              alignItems: 'center',
              flexDirection: 'row',
              backgroundColor: 'transparent',
              paddingLeft: spacing?.xs || 12,
              paddingRight: spacing?.xs || 12,
            }}>
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() => {
                amplitudeService.trackEvent('Navigation_Back_Button_Tapped', {
                  screen: 'phone_signup'
                });
                props.navigation.goBack();
              }}>
              <Icon name="arrow-left" size={22} color={colors?.text?.primary || '#111827'} />
            </TouchableOpacity>
          </View>
        )}
        <ScrollView
          style={{ height: '100%' }}
          contentContainerStyle={{ paddingLeft: spacing?.lg || 24, paddingRight: spacing?.lg || 24 }}
          keyboardShouldPersistTaps="handled">
          <View style={styles.containerView}>
            <View style={styles.loginCopyView}>
              <Text style={[styles.loginCopyText, { fontSize: 32 }]}>
                ¿Cuál es tu número de teléfono?
              </Text>
              <Text style={styles.descriptionText}>
                Para ayudarte a facturar tus tickets vía soporte con WhatsApp.
              </Text>
            </View>
            <View style={styles.inlineInputs}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flagText}>🇲🇽</Text>
                <Text style={styles.plusText}>+</Text>
                <Text style={styles.codeText}>52</Text>
              </View>
              <TextInput
                value={cellphone}
                style={styles.cellphoneInput}
                placeholder="555 222 3344"
                placeholderTextColor={colors?.text?.placeholder || '#9CA3AF'}
                keyboardType="phone-pad"
                maxLength={11}
                onChangeText={(text) => {
                  setCellphone(text);
                  // Track when user types
                  if (text.length % 2 === 0) {
                    amplitudeService.trackEvent('Input_Changed', {
                      screen: 'phone_signup',
                      field: 'phone',
                      length: text.length
                    });
                  }
                }}
              />
            </View>
          </View>
          <View style={{ alignItems: 'stretch', justifyContent: 'flex-start' }}>
            <NeuButton
              disabled={disabled}
              label="Siguiente  →"
              callback={handlePhoneVerifyButton}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  loginCopyView: {
    alignSelf: 'flex-start',
    marginTop: spacing?.sm || 8,
    marginBottom: spacing?.md || 16,
  },
  loginCopyText: {
    fontSize: typography?.fontSize?.['3xl'] || 32,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  descriptionText: {
    fontSize: typography?.fontSize?.lg || 20,
    marginTop: spacing?.md || 16,
    color: colors?.text?.secondary || '#374151',
    paddingRight: spacing?.xs || 12,
  },
  inlineInputs: {
    width: screenWidth - 60,
    height: 100,
    marginTop: spacing?.md || 16,
    marginBottom: spacing?.md || 16,
    flexDirection: 'row',
  },
  countryCodeContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors?.border?.medium || '#D1D5DB',
    paddingRight: spacing?.sm || 8,
  },
  flagText: {
    fontSize: typography?.fontSize?.xl || 24,
    marginRight: 4,
  },
  plusText: {
    fontSize: typography?.fontSize?.xl || 24,
    color: colors?.text?.primary || '#111827',
  },
  codeText: {
    fontSize: typography?.fontSize?.xl || 24,
    color: colors?.text?.primary || '#111827',
  },
  cellphoneInput: {
    height: 60,
    flexGrow: 1,
    fontSize: 26, // Aumentado de 24 a 26 (+2px)
    marginLeft: spacing?.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: colors?.border?.medium || '#D1D5DB',
    color: colors?.text?.primary || '#111827',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    marginTop: spacing?.sm || 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});