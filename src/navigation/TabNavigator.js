import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Alert, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/dist/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'react-native-image-picker';
import amplitudeService from '../utils/analytics/amplitude';
// Temporary hardcoded colors to fix immediate issue
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: 4,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  addTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  addButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#5B22FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addTabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#5B22FA',
    fontWeight: '500',
  },
});

// Import existing screens - using normal imports instead of lazy for tab screens
import MainScreen from '../screens/MainScreen/MainScreen';
import MenuScreen from '../screens/MenuScreen';
import { AuthContext } from '../contexts/AuthContext';
import Purchases from 'react-native-purchases';
import * as API from '../lib/api';

const Tab = createBottomTabNavigator();

// No need for custom add button anymore - will be integrated

// Custom Tab Bar with integrated add button logic
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { session } = React.useContext(AuthContext);
  const [customerInfo, setCustomerInfo] = React.useState({});
  const [this_month_tickets_count, setThisMonthTicketsCount] = React.useState(0);
  const [isProcessingClick, setIsProcessingClick] = React.useState(false);

  // Refrescar entitlements al volver del paywall o al enfocar el tab
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (session?.taxpayer_cellphone) {
        try {
          await Purchases.invalidateCustomerInfoCache();
          const { customerInfo: _customerInfo } = await Purchases.logIn(session.taxpayer_cellphone);
          setCustomerInfo(_customerInfo);
        } catch (error) {
          console.error('Error refreshing entitlements on focus in TabBar:', error);
        }
      }
    });
    return unsubscribe;
  }, [navigation, session?.taxpayer_cellphone]);

  // Check entitlements for Add button functionality
  React.useEffect(() => {
    const checkEntitlements = async () => {
      if (session?.taxpayer_cellphone) {
        try {
          const { customerInfo: _customerInfo } = await Purchases.logIn(session.taxpayer_cellphone);
          setCustomerInfo(_customerInfo);
        } catch (error) {
          console.error('Error checking entitlements in TabBar:', error);
        }
      }
    };

    checkEntitlements();
  }, [session?.taxpayer_cellphone]);

  // Get ticket limit helper
  const getTicketLimit = (customerInfo) => {
    if (!customerInfo?.entitlements?.active) return 0;

    const planLimits = {
      'entitlement_empresarial': 100,
      'entitlement_individual': 60,
      '100_tickets_mensuales': 30,
      'entitlement_ahorro': 10
    };

    let maxTickets = 0;
    const entitlements = Object.keys(customerInfo.entitlements.active);

    for (const entitlement of entitlements) {
      if (planLimits[entitlement] && planLimits[entitlement] > maxTickets) {
        maxTickets = planLimits[entitlement];
      }
    }

    return maxTickets;
  };

  // Get subscription status helper
  const getSubscriptionStatus = (info) => {
    if (!info || !info.entitlements || !info.entitlements.active) return 'none';

    const entitlements = Object.keys(info.entitlements.active);
    if (entitlements.includes('entitlement_empresarial')) return 'empresarial';
    if (entitlements.includes('entitlement_individual')) return 'individual';
    if (entitlements.includes('100_tickets_mensuales')) return 'standard';
    if (entitlements.includes('entitlement_ahorro')) return 'ahorro';
    return 'unknown';
  };

  // Get plan name helper
  const getPlanName = (plan) => {
    switch (plan) {
      case 'empresarial': return 'Empresarial';
      case 'individual': return 'Individual';
      case 'standard': return 'Estándar';
      case 'ahorro': return 'Ahorro';
      default: return 'actual';
    }
  };

  // Check if user can invoice
  const checkCanInvoice = async () => {
    const hasActiveSubscription = customerInfo?.entitlements?.active && 
      Object.keys(customerInfo.entitlements.active).length > 0;

    if (!hasActiveSubscription) {
      return { canInvoice: false, reason: 'no_subscription' };
    }

    // Get monthly ticket count
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const startDate = firstDayOfMonth.toISOString();
      const endDate = lastDayOfMonth.toISOString();

      const result = await API.getMonthlyTicketCount(session.token, startDate, endDate);
      const currentCount = result.success ? (result.count || 0) : 0;
      const ticketLimit = getTicketLimit(customerInfo);

      if (currentCount >= ticketLimit) {
        return { canInvoice: false, reason: 'limit_reached' };
      }

      return { canInvoice: true, reason: 'success' };
    } catch (error) {
      console.error('Error checking ticket limit:', error);
      return { canInvoice: true, reason: 'success' }; // Allow on error
    }
  };

  // Open subscription management
  const openSubscriptionManagement = () => {
    const paymentsManagementURL = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });

    amplitudeService.trackEvent('Subscription_Management_Opened', {
      has_subscription: true,
      subscription_type: getSubscriptionStatus(customerInfo),
      platform: Platform.OS
    });

    Linking.openURL(paymentsManagementURL).catch(err => {
      console.error('Error opening subscription management:', err);
      amplitudeService.trackEvent('Subscription_Management_Open_Error', {
        error: err.message
      });
    });
  };

  // Camera functions (same as MainScreen)
  const addFromCamera = () => {
    amplitudeService.trackEvent('Camera_Button_Tapped', { source: 'tab_bar' });

    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        console.log({ response });
        if (response.didCancel) {
          amplitudeService.trackEvent('Camera_Cancelled', { source: 'tab_bar' });
          return;
        }
        if (response.errorCode) {
          amplitudeService.trackEvent('Camera_Error', {
            error_code: response.errorCode,
            source: 'tab_bar'
          });

          if (response.errorCode !== 'camera_unavailable') {
            return;
          }
        }
        console.log({ assets: response.assets });

        amplitudeService.trackEvent('Photo_Captured', {
          uri_type: typeof response.assets?.[0]?.uri,
          source: 'tab_bar'
        });

        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
          parentNavigation.navigate('invoiceUploadScreen', {
            image: response.assets?.[0] || {},
          });
        }
      },
    );
  };

  const addFromGallery = () => {
    amplitudeService.trackEvent('Gallery_Button_Tapped', { source: 'tab_bar' });

    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          amplitudeService.trackEvent('Gallery_Selection_Cancelled', { source: 'tab_bar' });
          return;
        }

        amplitudeService.trackEvent('Gallery_Photo_Selected', { source: 'tab_bar' });

        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
          parentNavigation.navigate('invoiceUploadScreen', {
            image: response.assets[0],
          });
        }
      },
    );
  };

  // Show image picker alert (same as MainScreen)
  const showImagePickerAlert = () => {
    Alert.alert(
      'Agregar ticket',
      '',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            amplitudeService.trackEvent('Add_Ticket_Cancelled', { source: 'tab_bar' });
          }
        },
        {
          text: 'Tomar una foto',
          onPress: () => {
            amplitudeService.trackEvent('Camera_Option_Selected', { source: 'tab_bar' });
            addFromCamera();
          }
        },
        {
          text: 'Abrir la galería',
          onPress: () => {
            amplitudeService.trackEvent('Gallery_Option_Selected', { source: 'tab_bar' });
            addFromGallery();
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Handle Add button press with same logic as MainScreen
  const handleAddButtonPress = async () => {
    if (isProcessingClick) {
      console.log('🛑 Ya se está procesando un clic, ignorando');
      return;
    }

    setIsProcessingClick(true);
    amplitudeService.trackEvent('Add_Ticket_Button_Tapped', { source: 'tab_bar' });

    try {
      const { canInvoice, reason } = await checkCanInvoice();

      if (canInvoice) {
        console.log("✅ Access granted - showing image picker");
        amplitudeService.trackEvent('Ticket_Access_Granted', { reason, source: 'tab_bar' });
        showImagePickerAlert();
      } else {
        console.log("🚨 Access denied - reason:", { reason });

        if (reason === 'limit_reached') {
          const currentPlan = getSubscriptionStatus(customerInfo);
          const planName = getPlanName(currentPlan);

          amplitudeService.trackEvent('Ticket_Limit_Reached_Alert_Shown', {
            platform: Platform.OS,
            current_plan: currentPlan,
            ticket_count: this_month_tickets_count,
            ticket_limit: getTicketLimit(customerInfo),
            source: 'tab_bar'
          });

          Alert.alert(
            'Límite de tickets alcanzado',
            `Has llegado al máximo de tickets permitidos en tu plan ${planName} para este mes.`,
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Gestionar suscripción',
                onPress: () => {
                  amplitudeService.trackEvent('Subscription_Management_Button_Tapped_FromLimitAlert', {
                    current_plan: currentPlan,
                    source: 'tab_bar'
                  });
                  openSubscriptionManagement();
                }
              }
            ],
            { cancelable: true }
          );
        } else {
          amplitudeService.trackEvent('Paywall_Shown', {
            platform: Platform.OS,
            reason,
            source: 'tab_bar'
          });
          const parentNavigation = navigation.getParent();
          if (parentNavigation) {
            parentNavigation.navigate("paywallScreenV2");
          }
        }
      }
    } catch (error) {
      console.error("🚨 Error during access check:", error);

      amplitudeService.trackEvent('Ticket_Access_Check_Error', {
        error: error.message,
        source: 'tab_bar'
      });

      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.navigate("paywallScreenV2");
      }
    } finally {
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 500);
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          // Special handling for Add tab
          if (route.name === 'AddTab') {
            handleAddButtonPress();
            return;
          }

          // Track tab navigation
          amplitudeService.trackEvent('Tab_Navigation', {
            tab_name: route.name,
            previous_tab: state.routes[state.index]?.name
          });

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon and label for each tab
        const getTabInfo = () => {
          switch (route.name) {
            case 'Facturas':
              return {
                icon: <Icon name={isFocused ? "file" : "file-text"} size={18} color={isFocused ? '#111827' : '#6B7280'} />,
                label: 'Facturas'
              };
            case 'AddTab':
              return {
                icon: <Icon name="plus" size={16} color="#FFFFFF" />,
                label: 'Subir ticket'
              };
            case 'Cuenta':
              return {
                icon: <Icon name="user" size={18} color={isFocused ? '#111827' : '#6B7280'} />,
                label: 'Cuenta'
              };
            default:
              return {
                icon: <Icon name="home" size={20} color={isFocused ? '#111827' : '#6B7280'} />,
                label: 'Inicio'
              };
          }
        };

        const { icon, label: tabLabel } = getTabInfo();
        const isAddTab = route.name === 'AddTab';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[styles.tabItem, isAddTab && styles.addTabItem]}
          >
            {isAddTab ? (
              <View style={styles.addButtonContainer}>
                {icon}
              </View>
            ) : (
              icon
            )}
            <Text style={[
              styles.tabLabel, 
              isAddTab 
                ? styles.addTabLabel 
                : { color: isFocused ? '#111827' : '#6B7280' }
            ]}>
              {tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Placeholder component for the center tab (won't be rendered)
const AddTabPlaceholder = () => null;



export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Facturas"
        component={MainScreen}
        options={{
          tabBarLabel: 'Facturas',
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddTabPlaceholder}
        options={{
          tabBarLabel: 'Subir ticket',
        }}
      />
      <Tab.Screen
        name="Cuenta"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Cuenta',
        }}
      />
    </Tab.Navigator>
  );
}