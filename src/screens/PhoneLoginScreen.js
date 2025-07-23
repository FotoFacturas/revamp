import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import * as API from '../lib/api';
import Spinner from 'react-native-loading-spinner-overlay';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NeuButton from './../components/NeuButton';
import ProgressHeader from '../components/ProgressHeader';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);

export default function PhoneLoginScreen(props) {
  const [cellphone, setCellphone] = React.useState('');
  const [spinner, setSpinner] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const insets = useSafeAreaInsets();
  const safeAreaTop = insets.top;

  const topViewHeight = 80;
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
    if (cellphone.length > 9) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [cellphone]);

  const handleKeyboardDidShow = event => {
    console.log('keyboardDidShow', event.endCoordinates.height);
    setKeyboardHeight(event.endCoordinates.height);
  };

  const handleKeyboardDidHide = () => {
    console.log('keyboardDidHide');
    setKeyboardHeight(0);
  };

  const handleSubmitButton = async () => {
    setSpinner(true);

    if (cellphone.length < 10) {
      Alert.alert(
        'Error de verificación',
        'Ingresa un número de celular válido',
        [{text: 'OK', onPress: () => setSpinner(false)}],
        {cancelable: false},
      );
      return;
    }

    try {
      const e164phone = `+52${cellphone}`;
      // Use new verification service
      await API.sendPhoneVerification(e164phone, {
        code_length: 5,
        voice: false, // Use SMS by default
      });
      
      setSpinner(false);
      props.navigation.navigate('phoneOtpScreen', {
        cellphone: e164phone.replace('*', ''),
      });
    } catch (e) {
      console.warn('Error onLogin', e);
      if (e.message.includes('verification_03')) {
        Alert.alert(
          'Cuenta Inexistente',
          'No hay ninguna cuenta registrada con ese celular.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSpinner(false);
                props.navigation.goBack();
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert(
          'Cuenta Inexistente',
          'No hay ninguna cuenta registrada con ese celular.',
          [{text: 'OK', onPress: () => setSpinner(false)}],
          {cancelable: false},
        );
      }
      return;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors?.background?.primary || '#FAFAFA'}}>
      <Spinner visible={spinner} />
      <View style={{flexDirection: 'column'}}>
        <ProgressHeader
          navigation={props.navigation}
          title="Iniciar Sesión"
        />
        <ScrollView
          style={{height: centerViewHeight + 200}}
          contentContainerStyle={{paddingLeft: spacing?.lg || 24, paddingRight: spacing?.lg || 24}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.containerView}>
            <View style={[styles.loginCopyView]}>
              <Text style={styles.loginCopyText}>Ingresa con tu teléfono</Text>
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
                maxLength={12}
                onChangeText={setCellphone}
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
              callback={handleSubmitButton}
              disabled={disabled}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    marginBottom: spacing?.lg || 20,
  },
  loginCopyText: {
    fontSize: typography?.fontSize?.['3xl'] || 32,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.bold || '700',
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