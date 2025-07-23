import React, { useCallback, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  BackHandler,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import logo from './../assets/logo-ff-no-bg.png';
import amplitudeService from '../utils/analytics/amplitude';
import { GetAppStoreLink } from '../utils';

export default function ForceUpdateScreen() {
  const route = useRoute();
  const { requiredVersion, currentVersion } = route.params ?? {};

  useEffect(() => {
    // Prevent back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleUpdatePress = useCallback(() => {
    // Track update button press
    amplitudeService.trackEvent('Update_App_Button_Pressed', {
      platform: Platform.OS,
      current_version: currentVersion,
      required_version: requiredVersion
    });

    // Open appropriate store URL
    let updateUrl = GetAppStoreLink();
    Linking.openURL(updateUrl).catch(err => {
      console.error('Error opening update URL:', err);

      // Track error
      amplitudeService.trackEvent('Update_URL_Open_Error', {
        error: err.message,
        url: updateUrl
      });
    });
  }, [currentVersion, requiredVersion]);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>¡Tenemos nuevas mejoras!</Text>
      <Text style={styles.subtitle}>
        Ayúdanos actualizando la aplicación para continuar usando el servicio.
      </Text>

      {/* Version info section */}
      {currentVersion && requiredVersion && (
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Versión actual: <Text style={styles.versionHighlight}>{currentVersion}</Text>
          </Text>
          <Text style={styles.versionText}>
            Versión requerida: <Text style={styles.versionHighlight}>{requiredVersion}</Text>
          </Text>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <AppButton text="ACTUALIZAR APP" onPress={handleUpdatePress} />
      </View>
    </View>
  );
}

function AppButton({ text, onPress, backgroundColor = '#F35352', textColor = '#FFF' }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B22FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 240,  // Increased size for better visibility
    height: 80,  // Adjusted height to maintain aspect ratio
    resizeMode: 'contain', // Ensure logo displays properly
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
    width: '90%',
  },
  versionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    marginBottom: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
  },
  versionHighlight: {
    fontWeight: '700',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});