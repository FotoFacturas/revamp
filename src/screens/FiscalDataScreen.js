import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import DocumentPicker, { types } from 'react-native-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme';
import amplitudeService from '../utils/analytics/amplitude';
import * as API from '../lib/api';

const _try = (fn, fallback) => {
  try {
    const result = fn();
    return result === undefined || result === null ? fallback : result;
  } catch (e) {
    return fallback;
  }
};

// Data Item Component
const DataItem = ({ label, value }) => {
  return (
    <View style={styles.dataItem}>
      <View style={styles.dataContent}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataValue}>{value || 'No disponible'}</Text>
      </View>
    </View>
  );
};

// CSF Data Item Component (simplified design)
const CSFDataItem = ({ pdf_url, verified_status, onUpload }) => {
  const hasCSF = pdf_url && pdf_url.length > 0;
  const isVerified = verified_status === 'verified';
  const isPending = verified_status === 'pending';

  const getStatusInfo = () => {
    if (!hasCSF) {
      return {
        label: 'Constancia de Situación Fiscal',
        value: 'No subida',
        statusIcon: 'upload',
        statusColor: colors.text.secondary,
        actionText: 'Subir',
      };
    }

    if (isVerified) {
      return {
        label: 'Constancia de Situación Fiscal',
        value: 'Verificada',
        statusIcon: 'check-circle',
        statusColor: colors.success[500],
        actionText: 'Actualizar',
      };
    }

    if (isPending || verified_status === 'not_verified') {
      return {
        label: 'Constancia de Situación Fiscal',
        value: 'En verificación',
        statusIcon: 'clock',
        statusColor: colors.warning[500],
        actionText: 'Actualizar',
      };
    }

    return {
      label: 'Constancia de Situación Fiscal',
      value: 'Rechazada',
      statusIcon: 'x-circle',
      statusColor: colors.error[500],
      actionText: 'Actualizar',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity onPress={onUpload} style={styles.csfDataItem}>
      <View style={styles.dataContent}>
        <Text style={styles.dataLabel}>{statusInfo.label}</Text>
        <View style={styles.csfStatusContainer}>
          <Icon name={statusInfo.statusIcon} size={16} color={statusInfo.statusColor} />
          <Text style={[styles.dataValue, { marginLeft: spacing[2] }]}>
            {statusInfo.value}
          </Text>
        </View>
      </View>
      <View style={styles.csfActionContainer}>
        <Text style={styles.csfActionText}>{statusInfo.actionText}</Text>
        <Icon name="chevron-right" size={16} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
};



export default function FiscalDataScreen({ navigation }) {
  const { session, saveUser } = React.useContext(AuthContext);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  // Extract fiscal data from session (memoized to update when session changes)
  const fiscalData = React.useMemo(() => ({
    name: _try(() => session.taxpayer_name, ''),
    rfc: _try(() => session.taxpayer_identifier, ''),
    email: _try(() => session.email, ''),
    phone: _try(() => session.taxpayer_cellphone, ''),
    address: _try(() => session.taxpayer_address, ''),
    zipcode: _try(() => session.taxpayer_zipcode, ''),
    city: _try(() => session.taxpayer_city, ''),
    state: _try(() => session.taxpayer_state, ''),
    country: _try(() => session.taxpayer_country?.toUpperCase(), ''),
  }), [session, refreshKey]);

  // Extract CSF data from session (memoized to update when session changes)
  const csfData = React.useMemo(() => ({
    pdf_url: _try(() => session.csf_pdf_url, ''),
    verified_status: _try(() => session.csf_verified_status, ''),
  }), [session, refreshKey]);

  // Function to copy all fiscal data
  const copyAllFiscalData = () => {
    const fiscalDataText = `Razón social: ${fiscalData.name}
RFC: ${fiscalData.rfc}
Dirección: ${fiscalData.address}
Código postal: ${fiscalData.zipcode}
Ciudad: ${fiscalData.city}
Estado: ${fiscalData.state}
País: ${fiscalData.country}`;

    Clipboard.setString(fiscalDataText);
    Alert.alert('Copiado', 'Datos fiscales copiados al portapapeles');
    amplitudeService.trackEvent('All_Fiscal_Data_Copied');
  };

  // Function to handle CSF PDF upload directly
  const handleCSFUpload = async () => {
    if (isUploading) return; // Prevent multiple uploads

    amplitudeService.trackEvent('CSF_Upload_From_Fiscal_Data_Tapped');

    try {
      const result = await DocumentPicker.pickSingle({
        presentationStyle: 'pageSheet',
        type: [types.pdf],
        copyTo: 'cachesDirectory',
      });

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

        const fileUri = result.fileCopyUri || result.uri;
        await initializeUpload(fileUri);
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

  // Upload functions
  const initializeUpload = async (uri) => {
    if (!session.token) {
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

      // Get presigned URL for file upload
      const data = await API.getPresignedUploadURL4CSF(session.token);
      if (!data || typeof data !== 'object' || !data.urlPDF) {
        throw new Error('Invalid URL data');
      }

      // Initialize XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.onload = e => handleUploadComplete(e, data.urlPDF);
      xhr.upload.onerror = handleUploadError;

      // Start the upload
      xhr.open('PUT', data.urlPDF, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');
      xhr.send({ uri: uri, type: 'application/pdf' });
    } catch (error) {
      console.log({ error });
      Alert.alert(
        'Error',
        'No se pudo iniciar la carga. Por favor intente nuevamente.',
        [{ text: 'Entendido' }],
        { cancelable: false },
      );
      setIsUploading(false);
    }
  };

  const handleUploadComplete = async (event, urlPDF) => {
    try {
      // Check if the upload was successful
      if (event.target.status < 200 || event.target.status >= 300) {
        throw new Error(`HTTP error: ${event.target.status}`);
      }

      // Update user account with the PDF URL
      const updateJSON = {
        csf_pdf_url: urlPDF.split(/[?#]/)[0],
        csf_verified_status: 'not_verified',
      };
      const updatedUser = await API.accountsUsersUpdate(
        session.token,
        session.userId,
        updateJSON,
      );

      // Save updated user data
      saveUser(updatedUser, session.token);

      Alert.alert(
        '¡Éxito!',
        'Tu constancia ha sido subida exitosamente y está en proceso de verificación.',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      amplitudeService.trackEvent('CSF_Upload_Completed', {
        is_new_user: false,
        is_onboarding: false
      });

    } catch (error) {
      console.log({ error });
      Alert.alert(
        'Ups...',
        'Sucedió un error subiendo el PDF. Favor intentarlo más tarde',
        [{ text: 'Continuar' }],
        { cancelable: false },
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error) => {
    console.log({ error });
    Alert.alert(
      'Ups...',
      'Sucedió un error subiendo tu PDF. Favor intentar nuevamente',
      [{ text: 'Continuar' }],
      { cancelable: false },
    );
    setIsUploading(false);
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Datos Fiscales',
    });
    amplitudeService.trackEvent('Fiscal_Data_Screen_Viewed');
  }, [navigation]);

  // Refresh data when screen comes into focus (after returning from CSF screens)
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );



  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          <View style={styles.sectionContent}>
            <DataItem
              label="Correo electrónico"
              value={fiscalData.email}
            />
            <DataItem
              label="Teléfono"
              value={fiscalData.phone}
            />
          </View>
        </View>

        {/* Fiscal Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Datos Fiscales</Text>
            <TouchableOpacity onPress={copyAllFiscalData} style={styles.copyAllButton}>
              <Icon name="copy" size={16} color={colors.primary[500]} />
              <Text style={styles.copyAllText}>Copiar todo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            <DataItem
              label="Razón social"
              value={fiscalData.name}
            />
            <DataItem
              label="RFC"
              value={fiscalData.rfc}
            />
            <DataItem
              label="Dirección"
              value={fiscalData.address}
            />
            <DataItem
              label="Código postal"
              value={fiscalData.zipcode}
            />
            <DataItem
              label="Ciudad"
              value={fiscalData.city}
            />
            <DataItem
              label="Estado"
              value={fiscalData.state}
            />
            <DataItem
              label="País"
              value={fiscalData.country}
            />
            {/* CSF integrated as part of fiscal data */}
            <CSFDataItem
              pdf_url={csfData.pdf_url}
              verified_status={csfData.verified_status}
              onUpload={handleCSFUpload}
            />
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Icon name="info" size={16} color={colors.primary[500]} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Para actualizar tus datos fiscales, {' '}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                amplitudeService.trackEvent('Support_Contact_Tapped', { from: 'fiscal_data' });
                const message = encodeURIComponent('Quisiera cambiar mis datos fiscales a:');
                Linking.openURL(`https://wa.me/5522613142?text=${message}`);
              }}
              style={styles.contactButton}
            >
              <Text style={styles.contactButtonText}>contáctanos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Content Styles
  content: {
    flex: 1,
  },

  section: {
    backgroundColor: colors.background.primary,
    marginTop: spacing[4],
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    paddingBottom: spacing[2],
  },

  sectionHeaderSimple: {
    padding: spacing[4],
    paddingBottom: spacing[2],
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },

  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },

  copyAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing[1],
  },

  sectionContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },

  // Data Item Styles
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },

  dataContent: {
    flex: 1,
  },

  dataLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },

  dataValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },

  // CSF Data Item Styles
  csfDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },

  csfStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  csfActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing[3],
  },

  csfActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
    marginRight: spacing[2],
  },



  // Info Note Styles
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },

  infoTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[2],
    flexWrap: 'wrap',
  },

  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: 20,
  },

  contactButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[1],
  },

  contactButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },

  bottomSpacer: {
    height: spacing[8],
  },
}); 