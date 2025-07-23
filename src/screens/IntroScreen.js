import * as React from 'react';
import {
  ScrollView,
  Text,
  Image,
  Dimensions,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NeuButton from './../components/NeuButton';
import amplitudeService from './../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default function IntroScreen(props) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef(null);

  // Refined height calculations for better visual balance
  const availableHeight = screenHeight - insets.top - insets.bottom;
  const imageHeight = availableHeight * 0.32; // Reduced slightly from 0.35
  const logoHeight = 60;
  const textHeight = 80; // Increased slightly to accommodate larger text
  const paginationHeight = 30;
  const buttonsHeight = availableHeight * 0.23; // Reduced slightly 
  
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [renderKey, setRenderKey] = React.useState(0);
  
  // Función para verificar Apple Search Ads attribution
  const checkAppleSearchAdsAttribution = async () => {
    try {
      // Solo en iOS
      if (Platform.OS !== 'ios') return;
      
      // Verificar si ya se verificó antes
      const alreadyChecked = await AsyncStorage.getItem('apple_search_ads_checked');
      if (alreadyChecked) {
        console.log('🍎 Apple Search Ads attribution ya verificada anteriormente');
        return;
      }
      
      console.log('🍎 Verificando Apple Search Ads attribution en IntroScreen...');
      
      // Crear userData básico (sin userId porque no está logueado)
      const userData = {
        userId: 'anonymous_' + Date.now(),
        installDate: new Date().toISOString(), // Aproximar fecha de instalación
        country: 'MX', // Tu país base
        platform: Platform.OS,
        orgIds: [3839590, 3839580, 3841110], // Basic, Main, Advanced
        defaultOrgId: 3839590 // Search Ads Basic (primary)
      };
      
      // Intentar obtener atribución
      const attribution = await amplitudeService.handleAppleSearchAdsAttribution(
        userData.userId, 
        userData
      );
      
      if (attribution) {
        console.log('🍎 Apple Search Ads attribution encontrada en IntroScreen:', {
          campaign_id: attribution.apple_campaign_id,
          org_id: attribution.apple_org_id,
          confidence: attribution.attribution_confidence,
          country: attribution.apple_country
        });
        
        // Almacenar datos de atribución para uso posterior en MainScreen
        const attributionStorageData = {
          ...attribution,
          detected_on: 'intro_screen',
          detected_timestamp: new Date().toISOString(),
          user_data: userData
        };
        
        await AsyncStorage.setItem('apple_search_ads_attribution_data', JSON.stringify(attributionStorageData));
        console.log('🍎 Datos de atribución almacenados para uso posterior');
        
        // Enviar evento específico
        amplitudeService.trackEvent('Apple_Search_Ads_Attribution_Found', {
          attribution_confidence: attribution.attribution_confidence,
          apple_campaign_id: attribution.apple_campaign_id,
          apple_org_id: attribution.apple_org_id,
          detected_on: 'intro_screen',
          stored_for_later: true
        });
      } else {
        console.log('🍎 No se encontró Apple Search Ads attribution en IntroScreen');
        
        // Almacenar que se verificó pero no se encontró atribución
        await AsyncStorage.setItem('apple_search_ads_attribution_data', JSON.stringify({
          attribution_found: false,
          checked_on: 'intro_screen',
          checked_timestamp: new Date().toISOString(),
          user_data: userData
        }));
      }
      
      // Marcar como verificado
      await AsyncStorage.setItem('apple_search_ads_checked', 'true');
      console.log('🍎 Verificación de Apple Search Ads completada en IntroScreen');
      
    } catch (error) {
      console.error('🚨 Error en Apple Search Ads attribution en IntroScreen:', error);
      
      // Almacenar error para debugging
      await AsyncStorage.setItem('apple_search_ads_attribution_error', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        detected_on: 'intro_screen'
      }));
      
      // Track error pero no fallar
      amplitudeService.trackEvent('Apple_Search_Ads_Attribution_Error', {
        error: error.message,
        detected_on: 'intro_screen',
        error_timestamp: new Date().toISOString()
      });
    }
  };
  
  // Track screen view when component mounts
  React.useEffect(() => {
    amplitudeService.trackEvent('Intro_Screen_Viewed', {
      is_first_open: true
    });
    
    // Verificar Apple Search Ads attribution
    checkAppleSearchAdsAttribution();
  }, []);

  // Reset carousel state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset to first slide
      setActiveIndex(0);
      
      // Force re-render of images by changing the key
      setRenderKey(prev => prev + 1);
      
      // Reset scroll position with a small delay to ensure the component is ready
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const handleSignup = () => {
    amplitudeService.trackEvent('Signup_Button_Clicked', {
      source: 'intro_screen'
    });
    props.navigation.navigate('nameSignupScreen');
  };

  const handleLogin = () => {
    amplitudeService.trackEvent('Login_Button_Clicked', {
      source: 'intro_screen'
    });
    props.navigation.navigate('emailLoginScreen');
  };

  const handleOnMomentumScrollEnd = ({ nativeEvent }) => {
    const index = Math.round(nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
    amplitudeService.trackEvent('Intro_Carousel_Viewed', {
      slide_index: index,
      slide_content: ['factura_gastos', 'unete_comunidad', 'proceso_facil'][index]
    });
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        flexDirection: 'column',
        backgroundColor: 'white',
        flex: 1,
        height: screenHeight,
        overflow: 'hidden',
      }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        bounces={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleOnMomentumScrollEnd}
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center">
        {/* First Slide */}
        <View
          style={{
            width: screenWidth,
            height: imageHeight + logoHeight + textHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            key={`carousel-1-${renderKey}`}
            style={{
              height: imageHeight,
              width: screenWidth / 1.3,
              resizeMode: 'contain',
              marginBottom: 24,
            }}
            source={require('./../assets/carrousel-1.png')}
          />
          {/* Logo container */}
          <View style={styles.logoContainer}>
            <Image
              key={`logo-1-${renderKey}`}
              style={{
                width: '80%',
                height: '80%',
                resizeMode: 'contain',
              }}
              source={require('./../assets/logo-ff-no-bg.png')}
            />
          </View>
          {/* Text container for better grouping */}
          <View style={styles.textContainer}>
            <Text style={[styles.introCopyText]}>Factura tus gastos</Text>
            <Text style={styles.introCopyText}>automáticamente.</Text>
          </View>
        </View>
        
        {/* Second Slide */}
        <View
          style={{
            width: screenWidth,
            height: imageHeight + logoHeight + textHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            key={`carousel-2-${renderKey}`}
            style={{
              height: imageHeight,
              width: screenWidth / 1.6,
              resizeMode: 'contain',
              marginBottom: 24,
              alignSelf: 'center',
            }}
            source={require('./../assets/carrousel-2.png')}
          />
          {/* Logo container */}
          <View style={styles.logoContainer}>
            <Image
              key={`logo-2-${renderKey}`}
              style={{
                width: '80%',
                height: '80%',
                resizeMode: 'contain',
              }}
              source={require('./../assets/logo-ff-no-bg.png')}
            />
          </View>
          {/* Text container */}
          <View style={styles.textContainer}>
            <Text style={styles.introCopyText}>
              Únete a +1000 personas que
            </Text>
            <Text style={styles.introCopyText}>deducen sus tickets.</Text>
          </View>
        </View>
        
        {/* Third Slide */}
        <View
          style={{
            width: screenWidth,
            height: imageHeight + logoHeight + textHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            key={`carousel-3-${renderKey}`}
            style={{
              height: imageHeight,
              width: screenWidth / 3,
              resizeMode: 'contain',
              marginBottom: 24,
            }}
            source={require('./../assets/carrousel-3.png')}
          />
          {/* Logo container */}
          <View style={styles.logoContainer}>
            <Image
              key={`logo-3-${renderKey}`}
              style={{
                width: '80%',
                height: '80%',
                resizeMode: 'contain',
              }}
              source={require('./../assets/logo-ff-no-bg.png')}
            />
          </View>
          {/* Text container */}
          <View style={styles.textContainer}>
            <Text style={styles.introCopyText}>
              Es muy fácil: foto de tus
            </Text>
            <Text style={styles.introCopyText}>tickets y recibe la factura.</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Pagination dots - enhanced visibility */}
      <View
        style={{
          height: paginationHeight,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 5,
        }}>
        {[0, 1, 2].map((index) => (
          <Text
            key={index}
            style={{
              fontSize: typography?.fontSize?.sm || 14,
              color: activeIndex === index 
                ? colors?.primary?.[500] || '#5B22FA' 
                : colors?.primary?.[200] || '#DDD6FE',
              marginLeft: index > 0 ? spacing?.[2] || 10 : 0,
            }}>
            ●
          </Text>
        ))}
      </View>
      
      {/* Bottom buttons - improved spacing and sizing */}
      <View
        style={{
          height: buttonsHeight,
          alignItems: 'stretch',
          justifyContent: 'center',
          paddingHorizontal: 36,
          marginTop: 10,
        }}>
        <NeuButton
          label="Crear una cuenta"
          callback={handleSignup}
          userPressStyle={{ marginBottom: 14 }}
        />
        <NeuButton
          type="secondary"
          label="Ya tengo cuenta"
          callback={handleLogin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: colors?.primary?.[500] || '#5B22FA',
    borderRadius: borderRadius?.md || 10,
    width: screenWidth / 1.9,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing?.[2] || 8,
    marginBottom: spacing?.[3] || 12,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center', 
    height: 70,
  },
  introCopyText: {
    fontSize: typography?.fontSize?.[22] || 22, // Aumentado de 20 a 22
    color: colors?.text?.primary || '#111827',
    fontFamily: typography?.fontFamily?.primary || 'System',
    fontWeight: typography?.fontWeight?.medium || '500',
    textAlign: 'center',
    letterSpacing: typography?.letterSpacing?.tight || -0.025,
  },
  loginButton: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 1,
    borderBottomColor: colors?.text?.primary || '#111827',
    paddingBottom: 1,
    marginLeft: 4,
  },
  buttonContainer: {
    borderRadius: borderRadius?.md || 10,
    overflow: 'hidden',
    marginVertical: spacing?.[2] || 10,
    borderBottomRightRadius: borderRadius?.lg || 12,
    borderBottomLeftRadius: borderRadius?.lg || 12,
  },
  button: {
    paddingVertical: spacing?.[3] || 14,
    paddingHorizontal: spacing?.[5] || 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors?.primary?.[500] || '#5B22FA',
    borderBottomWidth: 4,
    borderBottomColor: colors?.primary?.[600] || '#481ECC',
  },
  secondaryButton: {
    backgroundColor: colors?.white || '#FFFFFF',
    borderWidth: 1,
    borderColor: colors?.border?.light || '#E5E7EB',
    borderBottomWidth: 2,
    borderBottomColor: colors?.border?.medium || '#D1D5DB',
  },
  buttonText: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  primaryButtonText: {
    color: colors?.text?.inverse || '#FFFFFF',
  },
  secondaryButtonText: {
    color: colors?.primary?.[500] || '#5B22FA',
  },
});