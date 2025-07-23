import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Dimensions,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import * as API from '../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HrWithLabel from '../components/HrWithLabel';
import NeuButton from './../components/NeuButton';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import IconMC from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import ProgressHeader from '../components/ProgressHeader';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function EmailLoginScreen(props) {
  const topViewHeight = 80;
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const [email, setEmail] = React.useState('');
  const [spinner, setSpinner] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);

  const insets = useSafeAreaInsets();

  const safeAreaTop = insets.top;

  const centerViewHeight =
    ((screenHeight - safeAreaTop - topViewHeight - 80) / 9) * 7.9 -
    (keyboardHeight / 20) * 19;

  React.useEffect(() => {
    var keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      handleKeyboardDidShow,
    );
    var keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardDidHide,
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  React.useEffect(() => {
    // check if email is valid using regex
    // regex
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (emailRegex.test(email)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email]);

  const handleKeyboardDidShow = event => {
    console.log('keyboardDidShow', event.endCoordinates.height);
    setKeyboardHeight(event.endCoordinates.height);
  };

  const handleKeyboardDidHide = () => {
    console.log('keyboardDidHide');
    setKeyboardHeight(0);
  };

  const handleEmailContinueButton = async () => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(email)) {
      alert('Ingresa un correo valido');
      return;
    }

    setSpinner(true);

    try {
      var sendUserEmailOTP = await API.authEmail(email);
      console.log({ sendUserEmailOTP });
      setSpinner(false);
      props.navigation.navigate('emailOTPScreen', {
        email: email.replace('*', ''),
        isOnboarding: !!!sendUserEmailOTP.user_has_phone,
        user_has_phone: sendUserEmailOTP.user_has_phone,
        user_first_name: sendUserEmailOTP.user_first_name,
      });
    } catch (e) {
      console.log({ e });
      if (e.message.includes('Multiple accounts')) {
        Alert.alert(
          'Cuenta Empresarial',
          'Es necesario hacer login con tu teléfono registrado.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSpinner(false);
                props.navigation.navigate('phoneLoginScreen');
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          'Cuenta Inexistente',
          'No hay ninguna cuenta registrada con ese correo electrónico.',
          [{ text: 'OK', onPress: () => setSpinner(false) }],
          { cancelable: false },
        );
      }
      console.warn('Error onLogin', e, sendUserEmailOTP);
      return;
    }
  };

  const handlePhoneContinueButton = () => {
    // navigate to phone login screen
    props.navigation.navigate('phoneLoginScreen');
  };

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: colors?.background?.primary || '#FFFFFF' }}>
      <Spinner visible={spinner} />
      <View style={{ flexDirection: 'column' }}>
        <ProgressHeader
          navigation={props.navigation}
          title="Iniciar Sesión"
        />
        <ScrollView
          style={{ height: centerViewHeight + 200 }}
          contentContainerStyle={{
            paddingLeft: spacing?.[6] || 24,
            paddingRight: spacing?.[6] || 24
          }}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.containerView, {}]}>
            <View style={[styles.loginCopyView]}>
              <Text style={styles.loginCopyText}>Ingresa con tu correo</Text>
            </View>
            <View style={styles.inlineInputs}>
              <TextInput
                value={email}
                style={[styles.emailInput, { backgroundColor: colors?.background?.primary || '#FFFFFF' }]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors?.text?.tertiary || '#6B7280'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
              />
            </View>
          </View>
          <View
            style={{
              alignItems: 'stretch',
              justifyContent: 'flex-start',
            }}>
            <NeuButton
              label="Siguiente  →"
              callback={handleEmailContinueButton}
            />
            <HrWithLabel
              label="O ingresa con tu teléfono"
              customStyle={{
                marginTop: spacing?.[6] || 24,
                marginBottom: spacing?.[6] || 24,
                width: screenWidth - 66,
              }}
            />
            <NeuButton type="secondary" callback={handlePhoneContinueButton}>
              {
                // flex space between text and icon
              }
              <View
                style={{
                  paddingHorizontal: spacing?.[5] || 20,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                }}>
                <View style={{ position: 'absolute', left: spacing?.[6] || 24, top: spacing?.[1] || 4 }}>
                  <IconMC
                    size={typography?.fontSize?.lg || 18}
                    style={{ marginBottom: spacing?.[1] || 2 }}
                    name="cellphone"
                    color={colors?.primary?.[500] || '#5B22FA'}
                  />
                </View>
                <Text
                  style={{
                    fontSize: typography?.fontSize?.base || 16, // Reducido de 19 a 16
                    fontFamily: typography?.fontFamily?.primary || 'System',
                    fontWeight: typography?.fontWeight?.bold || '700',
                    marginRight: spacing?.[2] || 8,
                    color: colors?.primary?.[500] || '#5B22FA',
                  }}>
                  Teléfono
                </Text>
              </View>
            </NeuButton>
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
    width: screenWidth - 56,
    marginBottom: spacing?.[5] || 20,
  },
  loginCopyText: {
    fontSize: typography?.fontSize?.['3xl'] || 30,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  inlineInputs: {
    marginTop: spacing?.[4] || 16,
    marginBottom: spacing?.[6] || 16,
    flexDirection: 'row',
    width: screenWidth - 56,
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
  button: {
    shadowColor: colors?.primary?.[600] + '99' || 'rgba(72, 30, 204,0.6)', // IOS
    shadowOffset: { height: -2, width: 0 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 3, //IOS
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
    fontSize: typography?.fontSize?.lg || 18, // Reducido de 20 a 18
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
});
