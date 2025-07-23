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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import NeuButton from './../components/NeuButton';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function NameSignupScreen(props) {
  const inputNameRef = useRef(null);
  const inputLastNameRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [spinner, setSpinner] = useState(false);

  const insets = useSafeAreaInsets();
  const safeAreaTop = insets.top;
  const topViewHeight = 80;
  const centerViewHeight = ((screenHeight - safeAreaTop - topViewHeight - 80) / 9) * 7.9 - (keyboardHeight / 20) * 19;

  useEffect(() => {
    amplitudeService.trackEvent('Name_Signup_Screen_Viewed', {
      source: props.route?.params?.source || 'direct'
    });
  }, []);

  useEffect(() => {
    props.navigation.setOptions({
      gestureEnabled: true
    });
  }, [props.navigation]);

  useEffect(() => {
    setTimeout(() => {
      inputNameRef.current?.focus();
    }, 100);
  }, []);

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
    if (firstName.trim().length > 0 && lastName.trim().length > 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [firstName, lastName]);

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu nombre y apellido.');
      amplitudeService.trackEvent('Name_Validation_Failed', {
        reason: 'empty_fields'
      });
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    amplitudeService.trackEvent('Name_Entered', {
      fullNameLength: fullName.length
    });
    props.navigation.navigate('emailSignupScreen', { fullName });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors?.background?.primary || '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Spinner opcional si se requiere en el futuro */}
        <View style={{ flexDirection: 'column' }}>
          <ProgressHeader
            navigation={props.navigation}
            title="Registro"
            onPress={() => {
              amplitudeService.trackEvent('Progress_Indicator_Tapped', {
                screen: 'name_signup',
                progress: 0
              });
            }}
          />
          <ProgressSteps currentStep={0} />
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
                <Text style={styles.loginCopyText}>¿Cómo te llamas?</Text>
              </View>
              <View style={styles.inlineInputs}>
                <TextInput
                  ref={inputNameRef}
                  value={firstName}
                  style={styles.nameInput}
                  placeholder="Nombre"
                  placeholderTextColor={colors?.text?.tertiary || '#6B7280'}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (text.length % 2 === 0) {
                      amplitudeService.trackEvent('Input_Changed', {
                        screen: 'name_signup',
                        field: 'firstName',
                        length: text.length
                      });
                    }
                  }}
                  onSubmitEditing={() => inputLastNameRef.current?.focus()}
                />
              </View>
              <View style={styles.inlineInputs}>
                <TextInput
                  ref={inputLastNameRef}
                  value={lastName}
                  style={styles.nameInput}
                  placeholder="Apellido"
                  placeholderTextColor={colors?.text?.tertiary || '#6B7280'}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onChangeText={(text) => {
                    setLastName(text);
                    if (text.length % 2 === 0) {
                      amplitudeService.trackEvent('Input_Changed', {
                        screen: 'name_signup',
                        field: 'lastName',
                        length: text.length
                      });
                    }
                  }}
                  onSubmitEditing={handleContinue}
                />
              </View>
            </View>
            <View
              style={{
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                marginTop: spacing?.[5] || 20,
              }}>
              <NeuButton
                label={spinner ? "Procesando..." : "Siguiente  →"}
                callback={handleContinue}
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
  inlineInputs: {
    height: 60,
    flexDirection: 'row',
    width: screenWidth - 56,
    marginBottom: 12,
  },
  nameInput: {
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