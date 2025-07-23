import * as React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import * as API from '../../lib/api';
import Spinner from 'react-native-loading-spinner-overlay';
import {AuthContext} from '../../contexts/AuthContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { colors, typography, spacing, borderRadius } from '../../theme';

// Reusable components
const FormSection = ({title, children}) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.divider} />
    </View>
    {children}
  </View>
);

const FormField = ({label, children}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const SelectField = ({value, placeholder, onPress, icon = "caret-down"}) => (
  <TouchableOpacity
    style={styles.selectField}
    onPress={onPress}
    activeOpacity={0.7}>
    {value ? (
      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        style={styles.selectText}>
        {value}
      </Text>
    ) : (
      <Text style={styles.placeholderText}>{placeholder}</Text>
    )}
    <Icon color={colors?.text?.secondary || '#374151'} name={icon} size={16} />
  </TouchableOpacity>
);

const PrimaryButton = ({title, onPress, disabled}) => (
  <TouchableOpacity
    style={[styles.primaryButton, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function CSFManualScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef();

  // Hide the default navigation header to avoid duplicate back buttons
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);
  
  // Context and route params
  const {saveUser} = React.useContext(AuthContext);
  const token = route.params.token;
  const userId = route.params.userId;
  const isOnboarding = route.params?.isOnboarding || false;
  const onComplete = route.params?.onComplete || (() => {});

  // Form state
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    taxId: '',
    taxEntity: '',
    taxName: '',
    taxAddress: '',
    taxExteriorNumber: '',
    taxState: '',
    taxCity: '',
    taxZipcode: '',
    taxDistrict: '',
  });

  // Input refs for focus management
  const inputRefs = {
    taxId: React.useRef(),
    taxName: React.useRef(),
    taxAddress: React.useRef(),
    taxExteriorNumber: React.useRef(),
    taxDistrict: React.useRef(),
    taxZipcode: React.useRef(),
    taxCity: React.useRef(),
  };

  // Form validation
  const isFormValid = React.useMemo(() => {
    const {
      taxId,
      taxEntity,
      taxName,
      taxAddress,
      taxState,
      taxCity,
      taxZipcode,
      taxDistrict,
    } = formData;
    
    return (
      taxId !== '' &&
      taxEntity !== '' &&
      taxName !== '' &&
      taxAddress !== '' &&
      taxState !== '' &&
      taxCity !== '' &&
      taxZipcode !== '' &&
      taxDistrict !== ''
    );
  }, [formData]);

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Keyboard management
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {}
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {}
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form submission
  const handleSubmit = async () => {
    setLoading(true);

    // Validation
    if (!isFormValid) {
      Alert.alert('Error', 'Favor de completar la información');
      setLoading(false);
      return;
    }

    const updateJSON = {
      taxpayer_name: formData.taxName,
      taxpayer_identifier: formData.taxId,
      taxpayer_entity: formData.taxEntity,
      taxpayer_address: `${formData.taxAddress} ${formData.taxExteriorNumber}`,
      taxpayer_state: formData.taxState,
      taxpayer_city: formData.taxCity,
      taxpayer_zipcode: formData.taxZipcode,
      taxpayer_district: formData.taxDistrict,
    };

    try {
      const data = await API.accountsUsersUpdate(token, userId, updateJSON);
      
      // Always save user data to update context
      saveUser(data, token);
      
      if (isOnboarding) {
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      } else {
        navigation.goBack();
        onComplete();
      }
    } catch (error) {
      console.warn(error);
      Alert.alert(
        'Error',
        'No se pudo actualizar la información. Por favor intente de nuevo.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigation helpers
  const navigateToSelectScreen = (screenName, onSelectCallback) => {
    navigation.navigate(screenName, {
      onSelectedItem: (selectedValue) => {
        onSelectCallback(selectedValue);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={loading} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos del RFC</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Form content */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        {/* Tax information section */}
        <FormSection title="Información fiscal">
          <FormField label="RFC">
            <TextInput
              ref={inputRefs.taxId}
              style={styles.textInput}
              value={formData.taxId}
              onChangeText={(text) => handleChange('taxId', text)}
              placeholder="AAAA123456XXX"
              placeholderTextColor="#CED0CE"
              autoCapitalize="characters"
              returnKeyType="next"
              onSubmitEditing={() => {
                navigateToSelectScreen('taxEntityScreen', (title) => {
                  handleChange('taxEntity', title);
                  inputRefs.taxName.current?.focus();
                });
              }}
            />
          </FormField>
          
          <FormField label="Régimen Fiscal">
            <SelectField
              value={formData.taxEntity}
              placeholder="Tipo de Régimen"
              onPress={() => {
                navigateToSelectScreen('taxEntityScreen', (title) => {
                  handleChange('taxEntity', title);
                  inputRefs.taxName.current?.focus();
                });
              }}
            />
          </FormField>
          
          <FormField label="Nombre del Contribuyente">
            <TextInput
              ref={inputRefs.taxName}
              style={styles.textInput}
              value={formData.taxName}
              onChangeText={(text) => handleChange('taxName', text)}
              placeholder="Razón Social"
              placeholderTextColor="#CED0CE"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.taxAddress.current?.focus()}
            />
          </FormField>
        </FormSection>
        
        {/* Address section */}
        <FormSection title="Dirección fiscal">
          <FormField label="Dirección">
            <TextInput
              ref={inputRefs.taxAddress}
              style={styles.textInput}
              value={formData.taxAddress}
              onChangeText={(text) => handleChange('taxAddress', text)}
              placeholder="Nombre Calle"
              placeholderTextColor="#CED0CE"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.taxExteriorNumber.current?.focus()}
            />
          </FormField>
          
          <FormField label="Número Ext / Int">
            <TextInput
              ref={inputRefs.taxExteriorNumber}
              style={styles.textInput}
              value={formData.taxExteriorNumber}
              onChangeText={(text) => handleChange('taxExteriorNumber', text)}
              placeholder="Número Exterior y/o Interior"
              placeholderTextColor="#CED0CE"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.taxDistrict.current?.focus()}
            />
          </FormField>
          
          <FormField label="Colonia">
            <TextInput
              ref={inputRefs.taxDistrict}
              style={styles.textInput}
              value={formData.taxDistrict}
              onChangeText={(text) => handleChange('taxDistrict', text)}
              placeholder="Nombre colonia"
              placeholderTextColor="#CED0CE"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.taxZipcode.current?.focus()}
            />
          </FormField>
          
          <FormField label="Código Postal">
            <TextInput
              ref={inputRefs.taxZipcode}
              style={styles.textInput}
              value={formData.taxZipcode}
              onChangeText={(text) => handleChange('taxZipcode', text.replace(/[^0-9]/g, ''))}
              placeholder="Número CP"
              placeholderTextColor="#CED0CE"
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => inputRefs.taxCity.current?.focus()}
            />
          </FormField>
          
          <FormField label="Ciudad / Delegación">
            <TextInput
              ref={inputRefs.taxCity}
              style={styles.textInput}
              value={formData.taxCity}
              onChangeText={(text) => handleChange('taxCity', text)}
              placeholder="Ciudad"
              placeholderTextColor="#CED0CE"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => {
                navigateToSelectScreen('taxStateScreen', (state) => {
                  handleChange('taxState', state);
                  // Scroll to bottom after selection
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                });
              }}
            />
          </FormField>
          
          <FormField label="Estado">
            <SelectField
              value={formData.taxState}
              placeholder="Selecciona Estado"
              onPress={() => {
                navigateToSelectScreen('taxStateScreen', (state) => {
                  handleChange('taxState', state);
                  // Scroll to bottom after selection
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                });
              }}
            />
          </FormField>
        </FormSection>
        
        {/* Terms and conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al continuar, estarías aceptando los{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://fotofacturas.com/legal/terminos-y-condiciones')}>
              Términos de Servicio
            </Text>{' '}
            y el{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://fotofacturas.com/legal/privacidad')}>
              Aviso de Privacidad
            </Text>.
          </Text>
        </View>
      </KeyboardAwareScrollView>
      
      {/* Bottom action button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Finalizar"
          onPress={handleSubmit}
          disabled={!isFormValid}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background?.primary || '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing?.md || 16,
    paddingVertical: spacing?.xs || 12,
    borderBottomWidth: 1,
    borderBottomColor: colors?.border?.light || '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing?.['2xl'] || 32,
  },
  sectionContainer: {
    marginBottom: spacing?.lg || 24,
    paddingHorizontal: spacing?.md || 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing?.md || 16,
  },
  sectionTitle: {
    fontSize: typography?.fontSize?.xl || 20,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginRight: spacing?.xs || 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors?.border?.medium || '#D1D5DB',
  },
  fieldContainer: {
    marginBottom: spacing?.md || 16,
  },
  fieldLabel: {
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.secondary || '#374151',
    marginBottom: spacing?.sm || 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors?.border?.medium || '#D1D5DB',
    borderRadius: borderRadius?.md || 8,
    paddingHorizontal: spacing?.md || 16,
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.primary || '#111827',
    backgroundColor: colors?.background?.secondary || '#F5F5F5',
  },
  selectField: {
    height: 50,
    borderWidth: 1,
    borderColor: colors?.border?.medium || '#D1D5DB',
    borderRadius: borderRadius?.md || 8,
    paddingHorizontal: spacing?.md || 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors?.background?.secondary || '#F5F5F5',
  },
  selectText: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.primary || '#111827',
    flex: 1,
  },
  placeholderText: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.placeholder || '#9CA3AF',
  },
  termsContainer: {
    paddingHorizontal: spacing?.md || 16,
    marginVertical: spacing?.md || 16,
  },
  termsText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#374151',
  },
  termsLink: {
    color: colors?.primary?.[500] || '#5B22FA',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: spacing?.md || 16,
    paddingVertical: spacing?.md || 16,
    borderTopWidth: 1,
    borderTopColor: colors?.border?.light || '#F0F0F0',
    backgroundColor: colors?.background?.primary || '#FAFAFA',
    ...Platform.select({
      ios: {
        shadowColor: colors?.shadow?.primary || '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButton: {
    backgroundColor: colors?.primary?.[500] || '#5B22FA',
    borderRadius: borderRadius?.md || 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors?.primary?.[300] || '#A78BFA',
    opacity: 0.6,
  },
  buttonText: {
    color: colors?.text?.inverse || '#FFFFFF',
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.semibold || '600',
  },
});