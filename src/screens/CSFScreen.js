import * as React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Modal, { ModalContent } from 'react-native-modals';
import * as Progress from 'react-native-progress';
import * as API from './../lib/api';
import { AuthContext } from '../contexts/AuthContext';
import ProgressHeader from '../components/ProgressHeader';
import ProgressSteps from '../components/ProgressSteps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker, { types } from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import IconMC from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import amplitudeService from '../utils/analytics/amplitude';
import { useIsFocused } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../theme';

// Modern Button component to replace NeuButton
const Button = ({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  IconComponent = Icon,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      secondary ? styles.secondaryButton : styles.primaryButton,
      disabled && styles.disabledButton,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}>
    <View style={styles.buttonContent}>
      {label && <Text style={[
        styles.buttonText,
        secondary ? styles.secondaryButtonText : styles.primaryButtonText
      ]}>{label}</Text>}
      {icon && <IconComponent name={icon} size={18} color={secondary ? (colors?.primary?.[500] || '#5B22FA') : (colors?.text?.inverse || '#FFFFFF')} style={{ marginLeft: spacing?.sm || 8 }} />}
    </View>
  </TouchableOpacity>
);

// Fixed ProgressModal component without 'key' prop issue
const ProgressModal = ({ visible, progress, title, onCancel }) => (
  <Modal
    visible={visible}
    width={0.7}
    overlayOpacity={0.9}
    overlayBackgroundColor={'rgba(0, 0, 0, 0.7)'}
    modalStyle={styles.modalContainer}
    // Remove any internal key props
    modalID="progressModal" // Use modalID instead of key
  >
    <ModalContent style={styles.modalContent}>
      <Text style={styles.modalTitle}>{title}</Text>
      <View style={styles.progressBarContainer}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={12}
          borderRadius={6}
          color={colors?.primary?.[500] || '#5B22FA'}
          unfilledColor="rgba(255, 255, 255, 0.2)"
        />
      </View>
      <Text style={styles.progressText}>{Math.ceil(progress * 100)}%</Text>
    </ModalContent>
  </Modal>
);

const CSFSuccessScreen = ({ onPress }) => (
  <SafeAreaView style={styles.successContainer}>
    <StatusBar barStyle="dark-content" backgroundColor={colors?.background?.primary || '#FAFAFA'} />

    {/* Success Icon and Animation Space */}
    <View style={styles.successIconContainer}>
      <View style={styles.successIconCircle}>
        <Icon name="check" size={32} color={colors?.success?.[500] || '#10B981'} />
      </View>
    </View>

    {/* Success Content */}
    <View style={styles.successContent}>
      <Text style={styles.successTitle}>¡Perfecto!</Text>
      <Text style={styles.successSubtitle}>Tu RFC ha sido guardado exitosamente</Text>
      
      <View style={styles.successInfoCard}>
        <View style={styles.successInfoRow}>
          <View style={styles.successInfoIcon}>
            <Icon name="file-text" size={16} color={colors?.primary?.[500] || '#5B22FA'} />
          </View>
          <Text style={styles.successInfoText}>
            Constancia de Situación Fiscal procesada
          </Text>
        </View>
        
        <View style={styles.successInfoRow}>
          <View style={styles.successInfoIcon}>
            <Icon name="zap" size={16} color={colors?.primary?.[500] || '#5B22FA'} />
          </View>
          <Text style={styles.successInfoText}>
            Ya puedes facturar todos tus tickets
          </Text>
        </View>
        
        <View style={[styles.successInfoRow, { marginBottom: 0 }]}>
          <View style={styles.successInfoIcon}>
            <Icon name="shield" size={16} color={colors?.primary?.[500] || '#5B22FA'} />
          </View>
          <Text style={styles.successInfoText}>
            Tus datos fiscales están seguros
          </Text>
        </View>
      </View>

      <Text style={styles.successDescription}>
        Tu cuenta está lista. Ahora puedes empezar a digitalizar y facturar tus gastos de manera automática.
      </Text>
    </View>

    {/* Action Button */}
    <View style={styles.successFooter}>
      <Button
        label="Continuar a la app"
        onPress={onPress}
      />
    </View>
  </SafeAreaView>
);

export default function CSFScreen({ navigation, route }) {
  // State
  const [modalVisible, setModalVisible] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [csfUploaded, setCsfUploaded] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const isFocused = useIsFocused();

  // Context
  const { saveUser, session } = React.useContext(AuthContext);

  // Props & Dimensions
  const insets = useSafeAreaInsets();
  const screenWidth = Math.round(Dimensions.get('window').width);
  const isOnboarding = route?.params?.isOnboarding || false;
  const isNewUser = route?.params?.isNewUser || false;

  // Get token from route params or session context
  const token = route?.params?.token || session?.token;
  const userId = route?.params?.userId || session?.userId;

  // Debug navigation state
  React.useEffect(() => {
    console.log('CSFScreen Navigation Route Params:', route?.params);
    console.log('CSFScreen isNewUser:', isNewUser);
    console.log('CSFScreen isOnboarding:', isOnboarding);
  }, [route, isNewUser, isOnboarding]);

  // Track screen view when component is focused
  React.useEffect(() => {
    if (isFocused) {
      amplitudeService.trackEvent('CSF_Screen_Viewed', {
        is_onboarding: isOnboarding || false,
        is_new_user: isNewUser || false
      });
    }
  }, [isFocused, isOnboarding, isNewUser]);

  // Hide the default navigation header
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // Add listener for back navigation
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        // Track back navigation
        amplitudeService.trackEvent('Navigation_Back', {
          from_screen: 'csf_upload',
          is_onboarding: isOnboarding,
          csf_uploaded: csfUploaded
        });
      }
    });

    return unsubscribe;
  }, [navigation, isOnboarding, csfUploaded]);

  // Reference for tracking progress
  const prevProgress = React.useRef(0);

  // Function to safely navigate to main screen
  const navigateToMainScreen = () => {
    console.log('Navigating to main screen');

    // Track navigation attempt
    amplitudeService.trackEvent('CSF_Navigation_To_Main', {
      is_new_user: isNewUser,
      is_onboarding: isOnboarding
    });

    // Use CommonActions.reset to ensure clean navigation history
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'appScreens', params: { screen: 'mainScreen' } },
        ],
      })
    );
  };

  // File Upload Handlers
  const initializeUpload = async (uri) => {
    if (!token) {
      Alert.alert(
        'Error de autenticación',
        'No hay un token válido. Por favor, inicia sesión nuevamente.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }

    try {
      setIsUploading(true);

      // Track upload start
      amplitudeService.trackEvent('CSF_Upload_Started', {
        is_new_user: isNewUser
      });

      // Show modal and start upload
      setUploadProgress(0);
      setModalVisible(true);
      prevProgress.current = 0;

      // Get presigned URL for file upload
      const data = await API.getPresignedUploadURL4CSF(token);
      if (!data || typeof data !== 'object' || !data.urlPDF) {
        throw new Error('Invalid URL data');
      }

      // Initialize XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.onload = e => handleUploadComplete(e, data.urlPDF);
      xhr.upload.onerror = handleUploadError;
      xhr.upload.onprogress = event => {
        const progress = event.loaded / event.total;
        setUploadProgress(progress);

        // Track upload progress at important milestones
        if (progress >= 0.5 && prevProgress.current < 0.5) {
          amplitudeService.trackEvent('CSF_Upload_Progress', {
            progress: 50
          });
          prevProgress.current = 0.5;
        } else if (progress >= 0.9 && prevProgress.current < 0.9) {
          amplitudeService.trackEvent('CSF_Upload_Progress', {
            progress: 90
          });
          prevProgress.current = 0.9;
        }
      };

      // Start the upload
      xhr.open('PUT', data.urlPDF, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      // Simple approach - just send the file object with uri
      xhr.send({ uri: uri, type: 'application/pdf' });
    } catch (error) {
      console.log({ error });

      // Track error in upload initialization
      amplitudeService.trackEvent('CSF_Upload_Init_Failed', {
        error: error.message || 'Unknown error',
        tokenAvailable: !!token
      });

      Alert.alert(
        'Error',
        'No se pudo iniciar la carga. Por favor intente nuevamente.',
        [{ text: 'Entendido' }],
        { cancelable: false },
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadComplete = async (event, urlPDF) => {
    setUploadProgress(1);

    try {
      // Check if the upload was successful
      if (event.target.status < 200 || event.target.status >= 300) {
        throw new Error(`HTTP error: ${event.target.status}`);
      }

      // Regular token flow - Update user account with the PDF URL
      const updateJSON = {
        csf_pdf_url: urlPDF.split(/[?#]/)[0],
        csf_verified_status: 'not_verified',
      };
      const updatedUser = await API.accountsUsersUpdate(
        token,
        userId,
        updateJSON,
      );

      setCsfUploaded(true);

      // Track upload success
      amplitudeService.trackEvent('CSF_Upload_Completed', {
        is_new_user: isNewUser,
        is_onboarding: isOnboarding
      });

      if (isNewUser) {
        await handleNewUserFinishedUpload(updatedUser);
      } else {
        saveUser(updatedUser, token);
      }
    } catch (error) {
      console.log({ error });

      // Track upload processing error
      amplitudeService.trackEvent('CSF_Processing_Failed', {
        error: error.message || 'Unknown error'
      });

      Alert.alert(
        'Ups...',
        'Sucedió un error subiendo el PDF. Favor intentarlo más tarde',
        [{ text: 'Continuar' }],
        { cancelable: false },
      );
    } finally {
      setTimeout(() => {
        setModalVisible(false);
      }, 500);
    }
  };

  const handleUploadError = (error) => {
    setUploadProgress(1);

    // Track upload error
    amplitudeService.trackEvent('CSF_Upload_Error', {
      is_new_user: isNewUser,
      error: error?.message || 'Unknown error'
    });

    Alert.alert(
      'Ups...',
      'Sucedió un error subiendo tu PDF. Favor intentar nuevamente',
      [{ text: 'Continuar' }],
      { cancelable: false },
    );

    setTimeout(() => {
      setModalVisible(false);
    }, 500);
  };

  // Button Handlers
  const handlePDFUpload = async () => {
    if (isUploading) return; // Prevent multiple uploads

    amplitudeService.trackEvent('CSF_PDF_Upload_Button_Tapped');

    try {
      const result = await DocumentPicker.pickSingle({
        presentationStyle: 'pageSheet',
        type: [types.pdf],
        copyTo: 'cachesDirectory', // This helps with file access
      });
      // Log the full result for debugging
      console.log('Document picked:', JSON.stringify(result));

      if (result.uri) {
        amplitudeService.trackEvent('CSF_PDF_Selected', {
          file_size: result.size,
          file_type: result.type
        });

        // Validate file size (max 5MB)
        if (result.size > 5 * 1024 * 1024) {
          Alert.alert(
            'Archivo demasiado grande',
            'El archivo seleccionado excede el límite de 5MB. Por favor, selecciona un archivo más pequeño.',
            [{ text: 'Entendido' }],
            { cancelable: false }
          );
          return;
        }

        // Use the fileCopyUri if available (from copyTo option), otherwise use uri
        const fileUri = result.fileCopyUri || result.uri;
        initializeUpload(fileUri);
      }
    } catch (error) {
      console.log({ error });

      // User cancelled the picker - no need to track as error
      if (!DocumentPicker.isCancel(error)) {
        amplitudeService.trackEvent('CSF_PDF_Selection_Error', {
          error: error.message || 'Unknown error'
        });
      }
    }
  };

  const handleManualEntry = () => {
    amplitudeService.trackEvent('CSF_Manual_Entry_Selected');

    navigation.navigate('CSFManualScreen', {
      userId: userId,
      token: token,
      isOnboarding: isOnboarding,
      onComplete: () => {
        setCsfUploaded(true);

        // Track manual entry completed
        amplitudeService.trackEvent('CSF_Manual_Entry_Completed');
      },
    });
  };

  const handleSkip = async () => {
    amplitudeService.trackEvent('CSF_Upload_Skipped', {
      is_new_user: isNewUser
    });

    try {
      if (isNewUser) {
        const data = await API.accountsUserInfoReadOnly(token);
        await saveUser(data.user, token);
      }
      // Navegar siempre al MainScreen
      navigateToMainScreen();
    } catch (error) {
      console.log({ error });
      amplitudeService.trackEvent('CSF_Skip_Error', {
        error: error.message || 'Unknown error'
      });
      Alert.alert('Error', 'No se pudo obtener información del usuario');
    }
  };

  const handleNewUserFinishedUpload = async (updatedUser) => {
    try {
      const updateJSON = {
        taxpayer_name: `CSF_PDF_TAXPAYER_NAME_${userId}`,
        taxpayer_identifier: `CSF_PDF_TAXPAYER_IDENTIFIER_${userId}`,
        taxpayer_entity: `CSF_PDF_TAXPAYER_TYPE_${userId}`,
        taxpayer_address: `CSF_PDF_TAXPAYER_ADDRESS_${userId}`,
        taxpayer_state: `CSF_PDF_TAXPAYER_STATE_${userId}`,
        taxpayer_city: `CSF_PDF_TAXPAYER_CITY_${userId}`,
        taxpayer_zipcode: `CSF_PDF_TAXPAYER_ZIPCODE_${userId}`,
        taxpayer_district: `CSF_PDF_TAXPAYER_DISTRICT_${userId}`,
      };

      const user = await API.accountsUsersUpdate(token, userId, updateJSON);

      // Track tax info saved
      amplitudeService.trackEvent('CSF_Tax_Info_Created');

      // Log before navigation attempt
      console.log('About to save user and navigate to main screen', { userId, hasToken: !!token });

      // Save user and navigate to the main screen
      await saveUser(user, token);

      // Use the safe navigation method with a slight delay to ensure context is updated
      setTimeout(() => {
        navigateToMainScreen();
      }, 300);
    } catch (error) {
      console.log({ error });

      // Track error in updating tax info
      amplitudeService.trackEvent('CSF_Tax_Info_Update_Failed', {
        error: error.message || 'Unknown error'
      });

      Alert.alert(
        'Error',
        'La actualización falló. Por favor intente nuevamente',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  };

  // If CSF uploaded and not a new user, show success screen
  if (csfUploaded && !isNewUser) {
    return <CSFSuccessScreen onPress={() => {
      amplitudeService.trackEvent('CSF_Success_Completed');
      navigation.goBack();
    }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors?.background?.primary || '#FAFAFA'} />

      {/* Progress Modal */}
      <ProgressModal
        visible={modalVisible}
        progress={uploadProgress}
        title="Subiendo tu PDF"
        onCancel={() => {
          amplitudeService.trackEvent('CSF_Upload_Cancelled');
          setModalVisible(false);
        }}
      />

      {/* Header */}
      {isOnboarding ? (
        <ProgressHeader
          navigation={navigation}
          title="Datos Fiscales"
          onPress={() => {
            console.log('progress');
            amplitudeService.trackEvent('Progress_Indicator_Tapped', {
              screen: 'csf_upload'
            });
          }}
        />
      ) : (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              amplitudeService.trackEvent('Back_Button_Tapped', {
                screen: 'csf_upload'
              });
              navigation.goBack();
            }}>
            <Icon name="arrow-left" size={20} color={colors?.text?.primary || '#111827'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
      )}

      {/* Add ProgressSteps component if onboarding */}
      {isOnboarding && <ProgressSteps currentStep={3} />}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingBottom: spacing?.lg || 24
        }}
        showsVerticalScrollIndicator={false}>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          {isOnboarding ? (
            <>
              <Text style={styles.titleFirstLine}>¡Último paso!</Text>
            </>
          ) : (
            <Text style={styles.title}>Agrega un RFC</Text>
          )}

          <Text style={styles.subtitle}>
            Facturamos tus tickets al RFC de la Constancia de Situación Fiscal
            presentada.
          </Text>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('./../assets/csfpreview.jpg')}
            resizeMode="contain"
          />
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          <Button
            label="Subir PDF de la Constancia"
            icon="file-upload"
            IconComponent={IconMC}
            onPress={handlePDFUpload}
            disabled={isUploading}
          />

          <View style={styles.buttonSpacer} />

          <Button
            label="Subir datos manualmente"
            icon="keyboard"
            secondary
            onPress={handleManualEntry}
          />

          {/* Only show skip option if not essential */}
          {!isOnboarding && (
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Omitir por ahora</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: spacing?.lg || 24,
    marginTop: spacing?.md || 16,
    marginBottom: spacing?.lg || 24,
  },
  titleFirstLine: {
    fontSize: typography?.fontSize?.['3xl'] || 32,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginBottom: 4,
  },
  title: {
    fontSize: typography?.fontSize?.['3xl'] || 32,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.md || 16,
  },
  subtitle: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.secondary || '#374151',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: spacing?.lg || 24,
  },
  image: {
    width: 180,
    height: 200,
  },
  buttonsContainer: {
    paddingHorizontal: spacing?.lg || 24,
    marginTop: spacing?.md || 16,
  },
  button: {
    height: 56,
    borderRadius: borderRadius?.lg || 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors?.shadow?.primary || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: colors?.primary?.[500] || '#5B22FA',
  },
  secondaryButton: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderWidth: 1,
    borderColor: colors?.primary?.[500] || '#5B22FA',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.semibold || '600',
  },
  primaryButtonText: {
    color: colors?.text?.inverse || '#FFFFFF',
  },
  secondaryButtonText: {
    color: colors?.primary?.[500] || '#5B22FA',
  },
  buttonSpacer: {
    height: spacing?.md || 16,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: spacing?.lg || 24,
    marginBottom: spacing?.md || 16,
    padding: spacing?.sm || 8,
  },
  skipButtonText: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.primary?.[500] || '#5B22FA',
    fontWeight: typography?.fontWeight?.semibold || '600',
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: spacing?.['2xl'] || 40,
  },

  // Modal Styles
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    paddingVertical: spacing?.lg || 24,
    borderRadius: borderRadius?.xl || 12,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.inverse || 'white',
    marginBottom: spacing?.lg || 20,
  },
  progressBarContainer: {
    marginBottom: spacing?.md || 16,
  },
  progressText: {
    textAlign: 'center',
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.inverse || 'white',
  },

  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: colors?.background?.primary || '#FAFAFA',
    justifyContent: 'space-between',
  },
  
  successIconContainer: {
    alignItems: 'center',
    marginTop: spacing?.['3xl'] || 48,
    marginBottom: spacing?.xl || 32,
  },
  
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors?.success?.[50] || '#ECFDF5',
    borderWidth: 2,
    borderColor: colors?.success?.[200] || '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors?.success?.[500] || '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  successContent: {
    flex: 1,
    paddingHorizontal: spacing?.lg || 24,
    alignItems: 'center',
  },

  successTitle: {
    fontSize: typography?.fontSize?.['3xl'] || 32,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.sm || 8,
    textAlign: 'center',
  },

  successSubtitle: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.secondary || '#6B7280',
    marginBottom: spacing?.xl || 32,
    textAlign: 'center',
  },

  successInfoCard: {
    backgroundColor: colors?.background?.secondary || '#F9FAFB',
    borderRadius: borderRadius?.lg || 8,
    borderWidth: 1,
    borderColor: colors?.border?.light || '#E5E7EB',
    padding: spacing?.lg || 24,
    marginBottom: spacing?.xl || 32,
    width: '100%',
  },

  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.md || 16,
  },

  successInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors?.primary?.[50] || '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing?.md || 16,
  },

  successInfoText: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.primary || '#111827',
    flex: 1,
  },

  successDescription: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.secondary || '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing?.md || 16,
  },

  successFooter: {
    paddingHorizontal: spacing?.lg || 24,
    paddingBottom: spacing?.lg || 24,
    paddingTop: spacing?.md || 16,
  },
});