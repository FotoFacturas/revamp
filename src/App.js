import React from 'react';
import { Platform, Linking } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/dist/Feather';
import { Amplitude } from '@amplitude/react-native';
import amplitudeService from './utils/analytics/amplitude';
import appsFlyerService from './utils/analytics/appsflyer';
import retentionAdvanced from './utils/retention/retentionAdvanced';
import retentionManager from './utils/retention';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './utils/core';


const SplashScreen = React.lazy(() => import('./screens/SplashScreen'));
const InvoiceUploadScreen = React.lazy(() =>
  import('./screens/InvoiceUploadScreen'),
);
const InvoiceTypeScreen = React.lazy(() =>
  import('./screens/InvoiceTypeScreen'),
);
const IntroScreen = React.lazy(() => import('./screens/IntroScreen'));
const EmailLoginScreen = React.lazy(() => import('./screens/EmailLoginScreen'));
const EmailSignupScreen = React.lazy(() =>
  import('./screens/EmailSignupScreen'),
);
const EmailOTPScreen = React.lazy(() => import('./screens/EmailOTPScreen'));
const ForceScreen = React.lazy(() =>
  import('./screens/UpdateAppScreen').then(module => ({
    default: props => <module.default {...props} forceUpdate={true} />,
  })),
);
const PayWallScreenV2 = React.lazy(() => import('./screens/PayWallScreenV2'));
const RequestNotificationsScreen = React.lazy(() =>
  import('./screens/RequestNotificationsScreen'),
);

const PhoneLoginScreen = React.lazy(() => import('./screens/PhoneLoginScreen'));
const PhoneOTPScreen = React.lazy(() => import('./screens/PhoneOTPScreen'));
const PhoneSignupScreen = React.lazy(() =>
  import('./screens/PhoneSignupScreen'),
);
const CSFScreen = React.lazy(() => import('./screens/CSFScreen'));
const CSFManualScreen = React.lazy(() =>
  import('./screens/CSFManualScreen/CSFManualScreen'),
);
const TaxEntityScreen = React.lazy(() =>
  import('./screens/CSFManualScreen/TaxEntityScreen'),
);
const TaxStateScreen = React.lazy(() =>
  import('./screens/CSFManualScreen/TaxStateScreen'),
);

const CSFScreenNewUserWrapper = props => {
  return <CSFScreen {...props} isNewUser={true} />;
};

const CSFScreenExistingUserWrapper = props => {
  return <CSFScreen {...props} isNewUser={false} />;
};

const amplitude = new Amplitude();
amplitude.init('964eb6b9283aae3c20691b67f3eb1028');

const MainScreen = React.lazy(() => import('./screens/MainScreen/MainScreen'));
const MenuScreen = React.lazy(() => import('./screens/MenuScreen'));
const HelpScreen = React.lazy(() => import('./screens/HelpScreen'));
const InvoiceScreen = React.lazy(() => import('./screens/InvoiceScreen'));
const AccountUsageScreen = React.lazy(() => import('./screens/AccountUsageScreen'));
const FiscalDataScreen = React.lazy(() => import('./screens/FiscalDataScreen'));
// TabNavigator should not be lazy-loaded as it causes navigation issues
import TabNavigator from './navigation/TabNavigator';

import { AuthContext, AuthContextProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OldPaywallUI from './screens/OldPaywallUI';
import HelpScreenDirect from './screens/HelpScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NameSignupScreen from './screens/NameSignupScreen';

const queryClient = new QueryClient();

// Mock navigation props para renderizar pantallas fuera del flujo
const mockNavigation = {
  setOptions: () => {},
  goBack: () => {},
  navigate: () => {},
  addListener: () => () => {},
  canGoBack: () => true,
};

const mockRoute = {
  params: {},
};
const RootStack = createStackNavigator();
const AppStack = createStackNavigator();
export const navigationRef = React.createRef();

// RevenueCat SDK setup function
const setupRevcatSDK = async () => {
  const revCatApiKey = Platform.select({
    ios: 'appl_SjFjwBVBbOjasgVEXvVdDtACpVY',
    android: 'goog_CvNNBMJJgEFGOAATpkSamzAGexf',
  });

  if (__DEV__) {
    Purchases.setDebugLogsEnabled(true);
  }

  try {
    await Purchases.configure({
      apiKey: revCatApiKey,
      observerMode: false
    });

    const offerings = await Purchases.getOfferings();
    Logger.success('REVENUECAT', 'RevenueCat SDK configured successfully');
    Logger.info('REVENUECAT', 'Current offering:', offerings.current);

  } catch (error) {
    Logger.error('REVENUECAT', 'RevenueCat setup failed:', error);
  }
};

export default function App() {
  React.useEffect(() => {
    setupRevcatSDK();
    
    // Initialize attribution tracking
    amplitudeService.initAttributionTracking();
    
    // Initialize AppsFlyer SDK
    appsFlyerService.initAppsFlyer();
    
    
    
    // Handle deep links when app is opened with a deep link
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          Logger.info('NAVIGATION', 'Initial URL received:', initialURL);
          await amplitudeService.handleDeepLink(initialURL);
        }
      } catch (error) {
        Logger.error('NAVIGATION', 'Error handling initial URL:', error);
      }
    };

    // Handle deep links during app usage
    const handleURL = async (event) => {
      try {
        const url = event.url;
        Logger.info('NAVIGATION', 'URL received during app usage:', url);
        await amplitudeService.handleDeepLink(url);
      } catch (error) {
        Logger.error('NAVIGATION', 'Error handling URL during app usage:', error);
      }
    };

    // Set up deep link listeners
    const linkingSubscription = Linking.addEventListener('url', handleURL);
    
    // Handle initial URL
    handleInitialURL();
    
    // Setup RevenueCat event tracking
    setupRevenueCatTracking();

    // Cleanup function
    return () => {
      if (linkingSubscription) {
        linkingSubscription.remove();
      }
    };
  }, []);
  

  
  // Track RevenueCat purchase events with Amplitude
  const setupRevenueCatTracking = () => {
    Purchases.addCustomerInfoUpdateListener(async (info) => {
      try {
        // Tracking existente para Amplitude (mantener)
        if (info.entitlements?.active && Object.keys(info.entitlements.active).length > 0) {
          const eventProperties = {
            active_entitlements: Object.keys(info.entitlements.active)
          };
          
          // Amplitude (mantener como está)
          amplitudeService.trackEvent('Subscription_Status_Updated', eventProperties);
          
          // AppsFlyer (mantener como está)
          appsFlyerService.trackEvent('Subscription_Status_Updated', eventProperties);
        }
        
        // NUEVO: Tracking específico para eventos de revenue
        const activeEntitlements = Object.keys(info.entitlements?.active || {});
        
        if (activeEntitlements.length > 0) {
          const entitlementId = activeEntitlements[0];
          const subscriptionType = appsFlyerService.getSubscriptionType(entitlementId);
          const price = appsFlyerService.getSubscriptionPrice(subscriptionType);
          
          // Determinar si es primera compra o renovación
          const isFirstPurchase = await checkIfFirstPurchase(info.originalAppUserId);
          
          const revenueEventData = {
            product_id: entitlementId,
            subscription_type: subscriptionType,
            revenue: price,
            $revenue: price,
            currency: 'MXN',
            platform: Platform.OS
          };
          
          if (isFirstPurchase) {
            // Primera conversión (día 7)
            await appsFlyerService.trackRevenueEvent('rc_trial_converted_event', revenueEventData);
            amplitudeService.trackEvent('rc_trial_converted_event', revenueEventData);
          } else {
            // Renovación (día 30+)
            await appsFlyerService.trackRevenueEvent('rc_renewal_event', revenueEventData);
            amplitudeService.trackEvent('rc_renewal_event', revenueEventData);
          }
        }
        
      } catch (error) {
        Logger.error('REVENUECAT TRACKING', 'Error in customer info listener:', error);
      }
    });
  };

  // AGREGAR función helper
  const checkIfFirstPurchase = async (userId) => {
    try {
      const key = `first_purchase_${userId}`;
      const hasBeenTracked = await AsyncStorage.getItem(key);
      
      if (!hasBeenTracked) {
        await AsyncStorage.setItem(key, 'true');
        return true;
      }
      
      return false;
    } catch {
      return true; // Default to first purchase if error
    }
  };

  // AGREGAR función para inicializar retención cuando el usuario se autentica
  const initializeRetentionForUser = async (userId, userEmail) => {
    try {
      Logger.info('RETENTION', 'App: Initializing retention for authenticated user:', userId);
      
      // Check if user already has retention initialized
      const isInitialized = await retentionManager.isUserRetentionInitialized(userId);
      
      if (!isInitialized) {
        Logger.info('RETENTION', 'User needs retention initialization');
        
        // Initialize complete retention system
        const result = await retentionManager.initializeUserRetention(userId, userEmail);
        
        if (result.success) {
          Logger.success('RETENTION', `Retention initialized for ${result.segment} user:`, userId);
          
          // Store successful initialization
          await AsyncStorage.setItem('last_retention_init', new Date().toISOString());
          
        } else {
          Logger.error('RETENTION', 'Failed to initialize retention:', result.error);
        }
      } else {
        Logger.info('RETENTION', 'User retention already initialized');
      }
      
    } catch (error) {
      Logger.error('RETENTION', 'App: Error initializing retention:', error);
    }
  };

  // AGREGAR función para trackear screen views con segmentación
  const trackScreenView = async (screenName) => {
    try {
      // Obtener user ID del contexto de autenticación
      // No usar React.useContext aquí porque no estamos en un componente
      const userId = null; // Se obtendrá desde el componente que llama esta función
      
      if (userId) {
        // Track screen view with segmentation
        await retentionManager.trackScreenView(userId, screenName, {
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      Logger.error('NAVIGATION', 'Error tracking screen view:', error);
    }
  };

  // 🚀 DESCOMENTA LA SIGUIENTE LÍNEA PARA VER vistas
   /*
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HelpScreenDirect navigation={mockNavigation} route={mockRoute} />
    </GestureHandlerRootView>
  ); 
   */

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={state => {
        // Track screen views when navigation changes
        const currentRouteName = getActiveRouteName(state);
        if (currentRouteName) {
          const eventProperties = {
            screen_name: currentRouteName
          };
          
          // Track with Amplitude (existing)
          amplitudeService.trackEvent('Screen_Viewed', eventProperties);
          
          // Track with AppsFlyer (existing)
          appsFlyerService.trackEvent('Screen_Viewed', eventProperties);
          
          // ✅ AGREGAR tracking con segmentación usando retentionManager
          trackScreenView(currentRouteName);
        }
      }}
    >
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <RootScreens />
        </QueryClientProvider>
      </AuthContextProvider>
    </NavigationContainer>
  );
}

// Helper to get the current active route name
const getActiveRouteName = state => {
  if (!state || !state.routes) return null;
  
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  
  return route.name;
};

const RootScreens = props => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <RootStack.Screen name="splashScreen" component={SplashScreen} />
      <RootStack.Screen name="forceUpdateScreen" component={ForceScreen} />
      <RootStack.Screen
        name="appScreens"
        component={AppScreens}
        options={{
          headerShown: false,
          detachPreviousScreen: false,
        }}
      />
      <RootStack.Screen
        name="invoiceUploadScreen"
        component={InvoiceUploadScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Group
        screenOptions={({ route, navigation }) => ({
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.ModalPresentationIOS,
        })}>
        <RootStack.Screen
          name="paywallScreenV2"
          component={PayWallScreenV2}
          options={{
            headerShown: false,
            presentation: Platform.OS === 'ios' ? 'modal' : 'transparentModal',
            ...TransitionPresets.ModalPresentationIOS,
            cardStyle: { backgroundColor: 'transparent' },
            animationEnabled: true,
            cardOverlayEnabled: true,
            android: {
              windowTranslucentStatus: true,
              windowTranslucentNavigation: true
            }
          }}
          listeners={({ navigation }) => ({
            beforeRemove: () => {
              Logger.info('NAVIGATION', 'PaywallScreen being removed');
              amplitudeService.trackEvent('Paywall_Dismissed');
            },
            blur: () => {
              Logger.info('NAVIGATION', 'Paywall blurred');
              navigation.goBack();
            },
          })}
        />
        <RootStack.Screen
          name="CSFManualScreen"
          component={CSFManualScreen}
          options={{
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="invoiceTypeScreen"
          component={InvoiceTypeScreen}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="requestNotificationsScreen"
          component={RequestNotificationsScreen}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="taxEntityScreen"
          component={TaxEntityScreen}
          options={{
            gestureDirection: 'horizontal',
            headerShown: true,
            headerTitle: 'Regimen Fiscal',
            headerTitleStyle: {
              fontSize: 19,
            },
            headerLeft: props => (
              <HeaderBackButton
                {...props}
                label=""
                backImage={() => (
                  <Icon
                    size={29}
                    color="rgb(0, 122, 255)"
                    name="chevron-left"
                    style={{ marginRight: -1 }}
                  />
                )}
              />
            ),
          }}
        />
        <RootStack.Screen
          name="taxStateScreen"
          component={TaxStateScreen}
          options={{
            gestureDirection: 'horizontal',
            headerShown: true,
            headerTitle: 'Estado',
            headerTitleStyle: {
              fontSize: 19,
            },
            headerLeft: props => (
              <HeaderBackButton
                {...props}
                label=""
                backImage={() => (
                  <Icon
                    size={29}
                    color="rgb(0, 122, 255)"
                    name="chevron-left"
                    style={{ marginRight: -1 }}
                  />
                )}
              />
            ),
          }}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};

const AppScreens = props => {
  const [currentRouteName, setCurrentRouteName] = React.useState('mainScreen');
  const { session } = React.useContext(AuthContext);

  React.useEffect(() => {
    let unsubscribe = () => { };

    if (navigationRef.current?.addListener) {
      unsubscribe = navigationRef.current.addListener('state', e => {
        // Safely access the navigation state using optional chaining
        const routes = e?.data?.state?.routes;

        if (Array.isArray(routes) && routes.length > 0) {
          const routeName = routes[routes.length - 1]?.name;

          if (routeName) {
            setCurrentRouteName(routeName);
            Logger.info('NAVIGATION', `New routeName ${routeName}`);
          } else {
            Logger.warning('NAVIGATION', 'Route name is not available.');
          }
        } else {
          Logger.warning('NAVIGATION', 'Routes are not available in the navigation state.');
        }
      });
    } else {
      Logger.warning('NAVIGATION', 'navigationRef.current.addListener is not available.');
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppStack.Navigator
      style={{ backgroundColor: 'white' }}
      screenOptions={{
        headerShown: false,
      }}>
      {session.loggedIn === true ? (
        <>
          <AppStack.Screen
            name="tabNavigator"
            component={TabNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
          <AppStack.Screen
            name="helpScreen"
            component={HelpScreen}
            options={{
              gestureDirection: 'horizontal',
              headerShown: true,
              headerTitleStyle: {
                fontSize: 19,
              },
              headerLeft: props => (
                <HeaderBackButton
                  {...props}
                  label=""
                  backImage={() => (
                    <Icon
                      size={29}
                      color="rgb(0, 122, 255)"
                      name="chevron-left"
                      style={{ marginRight: -2, marginLeft: 4 }}
                    />
                  )}
                />
              ),
            }}
          />
          <AppStack.Screen
            name="accountUsageScreen"
            component={AccountUsageScreen}
            options={{
              gestureDirection: 'horizontal',
              headerShown: true,
              headerTitleStyle: {
                fontSize: 19,
              },
              headerLeft: props => (
                <HeaderBackButton
                  {...props}
                  label=""
                  backImage={() => (
                    <Icon
                      size={29}
                      color="rgb(0, 122, 255)"
                      name="chevron-left"
                      style={{ marginRight: -2, marginLeft: 4 }}
                    />
                  )}
                />
              ),
            }}
          />
          <AppStack.Screen
            name="fiscalDataScreen"
            component={FiscalDataScreen}
            options={{
              gestureDirection: 'horizontal',
              headerShown: true,
              headerTitleStyle: {
                fontSize: 19,
              },
              headerLeft: props => (
                <HeaderBackButton
                  {...props}
                  label=""
                  backImage={() => (
                    <Icon
                      size={29}
                      color="rgb(0, 122, 255)"
                      name="chevron-left"
                      style={{ marginRight: -2, marginLeft: 4 }}
                    />
                  )}
                />
              ),
            }}
          />
          <AppStack.Screen
            name="CSFScreenExistingUser"
            component={CSFScreenExistingUserWrapper}
            options={({ route, navigation }) => ({
              headerShown: false,
              ...TransitionPresets.ModalPresentationIOS,
              gestureEnabled: true,
              gestureDirection: 'vertical',
            })}
          />
          <AppStack.Screen
            name="invoiceScreen"
            component={InvoiceScreen}
            options={{
              gestureDirection: 'horizontal',
              headerShown: true,
              headerTitleStyle: {
                fontSize: 19,
              },
              headerLeft: props => (
                <HeaderBackButton
                  {...props}
                  label=""
                  backImage={() => (
                    <Icon
                      size={29}
                      color="rgb(0, 122, 255)"
                      name="chevron-left"
                      style={{ marginRight: -2, marginLeft: 4 }}
                    />
                  )}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <AppStack.Screen 
            name="introScreen" 
            component={IntroScreen}
            options={{
              gestureEnabled: false, // No gesture back from intro screen
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="emailLoginScreen"
            component={EmailLoginScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="nameSignupScreen"
            component={NameSignupScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="emailSignupScreen"
            component={EmailSignupScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen 
            name="emailOTPScreen" 
            component={EmailOTPScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="phoneLoginScreen"
            component={PhoneLoginScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="phoneSignupScreen"
            component={PhoneSignupScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen 
            name="phoneOtpScreen" 
            component={PhoneOTPScreen}
            options={{
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationEnabled: true,
            }}
          />
          <AppStack.Screen
            name="CSFScreenNewUser"
            component={CSFScreenNewUserWrapper}
            options={{
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </AppStack.Navigator>
  );
};