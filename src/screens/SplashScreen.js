import React, { useEffect } from 'react';
import { View, SafeAreaView, Image, Platform, Dimensions } from 'react-native';
import amplitudeService from '../utils/analytics/amplitude';
import { CompareAppVersions, GetAppVersion } from '../utils';
import { InitRemoteConfig, GetRequiredAppVersion } from '../repositories/firebase';
import { CommonActions } from '@react-navigation/native';

export default function SplashScreen(props) {
  useEffect(() => {
    // Check for updates before proceeding
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      console.log('🚀 Checking for app updates...');
      const appVersion = GetAppVersion();
      global.APP_VERSION = appVersion;
      await InitRemoteConfig();
      const requiredVersion = await GetRequiredAppVersion();
      const needsUpdate = CompareAppVersions(appVersion, requiredVersion) < 0;

      // Track in analytics
      amplitudeService.trackEvent('App_Version_Check', {
        current_version: appVersion,
        required_version: requiredVersion,
        update_needed: needsUpdate,
        platform: Platform.OS
      });

      if (needsUpdate) {
        console.log('⚠️ Update required! Showing update screen');
        // Navigate to force update screen
        props.navigation.replace('forceUpdateScreen', {
          requiredVersion: requiredVersion,
          currentVersion: appVersion,
        });
      } else {
        console.log('✅ App is up to date! Continuing to main app');
        // Continue to main app after delay
        setTimeout(() => {
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'appScreens' }],
            })
          );
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);

      // Track error
      amplitudeService.trackEvent('App_Version_Check_Error', {
        error: error.message,
        platform: Platform.OS
      });

      // Continue to main app on error after delay
      setTimeout(() => {
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'appScreens' }],
          })
        );
      }, 2000);
    }
  };

  if (Platform.OS === 'ios') {
    return <SplashScreenIOS {...props} />;
  } else {
    return <SplashScreenAndroid {...props} />;
  }
}

const SplashScreenIOS = props => {
  return (
    <View style={{ flex: 1, backgroundColor: '#5B22FA' }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Image
          style={{ width: 140, resizeMode: 'contain' }}
          source={require('./../assets/icon-fotofactura.png')}
        />
      </View>
    </View>
  );
};

const SplashScreenAndroid = props => {
  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);
  const imgX = Math.round(screenWidth * 0.5) - 100;
  const imgY = Math.round(screenHeight * 0.5) - 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#5B00FD' }}>
      <View style={{ transform: [{ translateX: imgX }, { translateY: imgY }] }}>
        <Image
          style={{ height: 200, width: 200, resizeMode: 'contain' }}
          source={require('./../assets/ic_logo.png')}
        />
      </View>
    </SafeAreaView>
  );
};