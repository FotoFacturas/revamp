import * as React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  SectionList,
  AppState,
  Modal,
  StyleSheet,
  Linking,
  FlatList,
} from 'react-native';
import InvoiceCard from './../../components/InvoiceCard';
// Import the new ScreenLayout instead of using the old Header and AnnouncementBar directly
import ScreenLayout from './ScreenLayout';
import AnnouncementBar from './AnnouncementBar';
import TicketUsageIndicator from './../../components/TicketUsageIndicator';
import TicketsFacturadosCard from './../../components/TicketsFacturadosCard';
import { ItemSeparator, SectionSeparator } from './../../components/Separators';
import { colors, typography, spacing } from './../../theme';

// Theme imported successfully
import Icon from 'react-native-vector-icons/dist/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import { AuthContext } from './../../contexts/AuthContext';
import * as ImagePicker from 'react-native-image-picker';
import * as API from './../../lib/api';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Purchases from 'react-native-purchases';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import amplitudeService from './../../utils/analytics/amplitude';
import retentionManager from './../../utils/retention';


// cuando instalemos firebase descomentar esto
//import { Notifications } from 'react-native-notifications';
//import notificationsService from './../../utils/notifications';

// IMPORTANT: Define all styles here before the component
const styles = StyleSheet.create({
  // Estilos para empty state mejorado
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[6], // 24px
  },
  emptyStateImage: {
    width: '80%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: spacing[6], // 24px
  },
  emptyStateTitle: {
    fontSize: typography?.fontSize?.['2xl'] || 24, // 24px
    fontWeight: typography?.fontWeight?.bold || '700', // 700
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[6] || 24, // 24px
    textAlign: 'center',
    lineHeight: typography?.lineHeight?.tight || 1.25, // 1.25
  },
  onboardingStepsContainer: {
    width: '100%',
  },
  onboardingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6], // 24px
    padding: spacing[4], // 16px
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4], // 16px
  },
  stepNumber: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold, // 700
    fontSize: typography.fontSize.sm, // 14px
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography?.fontSize?.base || 16, // 16px
    fontWeight: typography?.fontWeight?.bold || '700', // 700
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[1] || 4, // 4px
    lineHeight: typography?.lineHeight?.snug || 1.375, // 1.375
  },
  stepDescription: {
    fontSize: typography?.fontSize?.sm || 14, // 14px
    color: colors?.text?.secondary || '#374151',
    lineHeight: typography?.lineHeight?.normal || 1.5, // 1.5
  },
  // Debug styles
  debugContainer: {
    flex: 1,
    backgroundColor: colors?.background?.secondary || '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5], // 20px
  },
  loadingText: {
    fontSize: typography?.fontSize?.lg || 18, // 18px
    fontWeight: typography?.fontWeight?.bold || '700', // 700
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[5] || 20, // 20px
  },
  errorContainer: {
    flex: 1,
    marginTop: spacing[4], // 16px
    marginHorizontal: spacing[4], // 16px
    backgroundColor: colors.error[50],
    padding: spacing[4], // 16px
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  errorTitle: {
    fontWeight: typography?.fontWeight?.bold || '700', // 700
    fontSize: typography?.fontSize?.lg || 18, // 18px
    color: colors?.error?.[600] || '#DC2626',
    marginBottom: spacing?.[2] || 8, // 8px
  },
  errorText: {
    marginTop: spacing?.[2] || 8, // 8px
    color: colors?.text?.primary || '#111827',
    fontSize: typography?.fontSize?.sm || 14, // 14px
    lineHeight: typography?.lineHeight?.normal || 1.5, // 1.5
  },
  errorHeading: {
    marginTop: spacing?.[4] || 16, // 16px
    fontWeight: typography?.fontWeight?.bold || '700', // 700
    color: colors?.text?.primary || '#111827',
    fontSize: typography?.fontSize?.base || 16, // 16px
  },
  // Estilos para el carrusel
  carouselContainer: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[2], // 8px
  },
  carouselItem: {
    width: '100%',
    paddingHorizontal: 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[2], // 8px
    backgroundColor: colors.background.primary,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing[1], // 4px
  },
  paginationDotActive: {
    backgroundColor: colors.primary[500],
  },
  paginationDotInactive: {
    backgroundColor: colors.gray[300],
  },
  
  // Section header styles
  sectionHeader: {
    backgroundColor: colors.background.secondary,
    paddingTop: spacing[3], // 12px
    paddingBottom: spacing[2], // 8px
    paddingHorizontal: spacing[4], // 16px
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionHeaderText: {
    fontSize: typography?.fontSize?.base || 16, // 16px (reducido de 18px)
    fontWeight: typography?.fontWeight?.semibold || '600', // 600
    color: colors?.text?.primary || '#111827',
    // Removido lineHeight problemático
  },
  
  // Main container styles
  mainContainer: {
    flex: 1,
    backgroundColor: colors?.background?.primary || '#FFFFFF',
  },
  
  // Invoice list styles
  invoiceList: {
    flex: 1,
    backgroundColor: colors.background.primary,
    zIndex: 2,
  },
  
  // Empty state with subscription styles
  emptyStateWithSubscription: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5], // 20px
  },
  
  emptyStateImageSmall: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: spacing[5], // 20px
  },
  
  emptyStateSubtitle: {
    textAlign: 'center',
    marginBottom: spacing[5], // 20px
    color: colors.text.secondary,
    fontSize: typography.fontSize.base, // 16px
    lineHeight: typography.lineHeight.normal, // 1.5
  },
  
  // Primary button styles
  primaryButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 50,
    paddingVertical: spacing[3], // 12px
    paddingHorizontal: spacing[6], // 24px
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold, // 700
    fontSize: typography.fontSize.base, // 16px
  },
});

// This helper function prevents the gesture from being enabled
const useDisableGesture = (disable = true) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (!isFocused) return;

    // More aggressive gesture disabling
    const disableAllGestures = () => {
      navigation.setOptions({ 
        gestureEnabled: false,
        swipeEnabled: false,
        headerShown: false
      });
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ 
          gestureEnabled: false,
          swipeEnabled: false
        });
        const grandParent = parent.getParent?.();
        if (grandParent) {
          grandParent.setOptions({ 
            gestureEnabled: false,
            swipeEnabled: false
          });
        }
      }
    };
    if (disable) {
      disableAllGestures();
      const timer = setTimeout(disableAllGestures, 100);
      return () => clearTimeout(timer);
    }
  }, [navigation, isFocused, disable]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (disable) {
        setTimeout(() => {
          navigation.setOptions({ 
            gestureEnabled: false,
            swipeEnabled: false
          });
          navigation.getParent()?.setOptions({ 
            gestureEnabled: false,
            swipeEnabled: false
          });
        }, 50);
      }
    });
    return unsubscribe;
  }, [navigation, disable]);
};

export default function MainScreen(props) {
  // console.log('🚀 MainScreen rendering - START'); // Removed to reduce log spam
  const { session, saveUser } = React.useContext(AuthContext);
  

  const [userIsWhitelistedForPurchase, setUserIsWhitelistedForPurchase] = React.useState(false);
  const [customerInfo, setCustomerInfo] = React.useState({});
  const appState = React.useRef(AppState.currentState);
  const disableBackGesture = useDisableGesture(true);
  const isFocused = useIsFocused();

  const [ticketsFilter, setTicketsFilter] = React.useState('last_100'); // last_3_months, last_100, all
  const [hasZeroTickets, setHasZeroTickets] = React.useState(true);
  const [this_month_tickets_count, setThisMonthTicketsCount] = React.useState(0);
  const [sessionStartTime] = React.useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = React.useState(Date.now());

  // Estado para el carrusel
  const [carouselActiveIndex, setCarouselActiveIndex] = React.useState(0);
  const carouselRef = React.useRef(null);

  // Estado para tickets facturados
  const [hasInvoicedTickets, setHasInvoicedTickets] = React.useState(false);

  const token = session.token;
  const userId = session.userId;
  const csf_pdf_url = session.csf_pdf_url;
  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);

  const [isProcessingClick, setIsProcessingClick] = React.useState(false);

  // Debug useEffect to track component state
  React.useEffect(() => {
    if (isFocused) {
      // console.log('💬 DEBUG - Component State:', {
      //   isLoading,
      //   hasError: !!error,
      //   invoicesCount: filteredInvoices?.length || 0,
      //   customerInfo: !!Object.keys(customerInfo || {}).length,
      //   ticketsFilter,
      //   token: !!token,
      //   userId: !!userId
      // });
    }
  }, [isFocused, isLoading, error, filteredInvoices, customerInfo, ticketsFilter, token, userId]);

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Track when main screen is viewed with session info
  React.useEffect(() => {
    if (isFocused) {
      // console.log('DEBUG - Session email data:', {
      //   email: session?.email,
      //   taxpayer_email: session?.taxpayer_email,
      //   email_type: typeof session?.email,
      //   email_length: session?.email?.length,
      //   full_session: session
      // });
      
      const subscriptionStatus = getSubscriptionStatus(customerInfo);
      const userProperties = {
        subscription_status: subscriptionStatus,
        has_csf: !!csf_pdf_url,
        is_whitelisted: userIsWhitelistedForPurchase,
        email: session?.email || null,
        phone: session?.taxpayer_cellphone || null,
        registration_date: session?.created_at || null
      };
      
      // console.log('DEBUG - User properties being sent:', userProperties);
      
      // Set user properties in Amplitude
      if (userId) {
        amplitudeService.identifyUser(String(userId), userProperties);
      }

      // Verificar límite de tickets cuando entra a la pantalla
      checkTicketLimit();
      
      // Verificar tickets facturados
      checkInvoicedTickets();
    }
  }, [isFocused, customerInfo, csf_pdf_url, userId, session?.email]);

  // Track user session duration
  React.useEffect(() => {
    // Record interaction on app state changes
    const handleAppStateChange = nextAppState => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App going to background - track session duration
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        amplitudeService.trackEvent('App_Background', {
          session_duration_seconds: sessionDuration,
          last_interaction_seconds_ago: Math.round((Date.now() - lastInteractionTime) / 1000)
        });
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground
        amplitudeService.trackEvent('App_Foreground');
        setLastInteractionTime(Date.now());

        // Verificar límite de tickets cuando vuelve a la app
        checkTicketLimit();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [sessionStartTime, lastInteractionTime, userId]);

  // Helper function to determine subscription status
  const getSubscriptionStatus = (info) => {
    if (!info || !info.entitlements || !info.entitlements.active) return 'none';

    const entitlements = Object.keys(info.entitlements.active);
    if (entitlements.includes('entitlement_empresarial')) return 'empresarial';
    if (entitlements.includes('entitlement_individual')) return 'individual';
    if (entitlements.includes('100_tickets_mensuales')) return 'standard';
    if (entitlements.includes('entitlement_ahorro')) return 'ahorro';
    return 'unknown';
  };

  // Función para calcular días desde registro
  const getDaysSinceSignup = (createdAt) => {
    if (!createdAt) return 0;
    const signupDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - signupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyTicketCount = async () => {
    try {
      // Get current month boundaries for the query
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      // Format dates for API request
      const startDate = firstDayOfMonth.toISOString();
      const endDate = lastDayOfMonth.toISOString();

      // console.log('📊 Fetching monthly ticket count...', {
      //   startDate,
      //   endDate,
      //   token: token ? token.substring(0, 8) + '...' : 'missing',
      //   userId
      // });

      // Use the API function from api.js 
      const result = await API.getMonthlyTicketCount(token, startDate, endDate);

      if (result.success) {
        const count = result.count || 0;
        setThisMonthTicketsCount(count);
        return count;
      } else {
        console.warn('⚠️ API returned unsuccessful response:', result);
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.warn('⚠️ Database ticket count failed, falling back to UI state count', error);

      // Track error in analytics
      amplitudeService.trackEvent('API_Error', {
        endpoint: '/api/tickets/count',
        error: error.message
      });

      // Fallback to counting tickets from UI
      return countTicketsFromUI();
    }
  };

  const countTicketsFromUI = () => {
    try {
      const currentMonthKeyname = () => {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const keyname = `${monthNames[month]} ${year}`;
        return keyname;
      };

      // Find the current month's section in filtered invoices
      const this_month_section = filteredInvoices.find(
        section => section.title === currentMonthKeyname()
      );

      let count = 0;
      if (this_month_section) {
        count = this_month_section.data.length;
      }

      // console.log('📊 Current month ticket count from UI state:', count);
      // Update the state with the count
      setThisMonthTicketsCount(count);
      return count;
    } catch (error) {
      console.warn('⚠️ Error counting tickets from UI:', error);
      return 0;
    }
  };

  const checkCanInvoice = async () => {
    try {
      // Update user info once to get latest status
      await updateUserInfo();

      // Get user's whitelist status
      const isWhitelisted = session?.whitelisted_for_purchase === false; // false means whitelisted

      // If whitelisted, they can always create invoices
      if (isWhitelisted) {
        return { canInvoice: true, reason: 'whitelisted' };
      }

      // Check subscription status
      const entitlements = customerInfo?.entitlements?.active || {};
      const hasValidEntitlement = Object.keys(entitlements).length > 0;

      // If no subscription, they can't create invoices
      if (!hasValidEntitlement) {
        return { canInvoice: false, reason: 'no_subscription' };
      }

      // Check ticket limit
      const ticketCount = await getMonthlyTicketCount();
      const ticketLimit = getTicketLimit(customerInfo);

      // If they've reached their limit, they can't create more invoices
      if (ticketCount >= ticketLimit) {
        return { canInvoice: false, reason: 'limit_reached' };
      }

      // Otherwise, they can create invoices
      return { canInvoice: true, reason: 'has_subscription' };
    } catch (error) {
      console.error('Error checking invoice permission:', error);
      // Default to false on error for safety
      return { canInvoice: false, reason: 'error' };
    }
  };

  const checkTicketLimit = async () => {
    try {
      // console.log('🔍 checkTicketLimit iniciando...');
      
      // Get the ticket count
      const ticketCount = await getMonthlyTicketCount();

      // Get the ticket limit
      const ticketLimit = getTicketLimit(customerInfo);

      // console.log('🔍 checkTicketLimit resultados:', { // Commented to reduce log spam
      //   ticketCount,
      //   ticketLimit,
      //   this_month_tickets_count: this_month_tickets_count,
      //   customerInfo: customerInfo?.entitlements?.active
      // });

      // Only perform additional checks if subscription status is valid
      if (ticketLimit > 0) {
        // Solo usar el tracking de amplitude y no mostrar modal automáticamente
        amplitudeService.trackTicketUsage(userId, ticketCount, ticketLimit);
      }

      return ticketCount;
    } catch (error) {
      console.error('Error checking ticket limit:', error);
      amplitudeService.trackEvent('Ticket_Limit_Check_Error', {
        error: error.message
      });
      // Return 0 as fallback
      return 0;
    }
  };

  const checkInvoicedTickets = async () => {
    try {
      if (!token) return false;
      
      const response = await API.getTickets(token, 'all');
      
      if (response && response.tickets) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const hasInvoiced = response.tickets.some(t =>
          t.status === 'signed' &&
          t.ticket_total !== null &&
          new Date(t.created_at).getMonth() === currentMonth &&
          new Date(t.created_at).getFullYear() === currentYear
        );
        
        setHasInvoicedTickets(hasInvoiced);
        return hasInvoiced;
      }
      
      setHasInvoicedTickets(false);
      return false;
    } catch (error) {
      console.error('Error checking Invoiced tickets:', error);
      setHasInvoicedTickets(false);
      return false;
    }
  };

  const handleAddButton = async () => {
    // console.log('📸 Photo button clicked, checking access...');

    // Prevenir múltiples procesamientos - esto es importante mantenerlo
    if (isProcessingClick) {
      // console.log('🛑 Ya se está procesando un clic, ignorando');
      return;
    }

    // Establecer bandera de procesamiento
    setIsProcessingClick(true);

    // Track button tap
    amplitudeService.trackEvent('Add_Ticket_Button_Tapped');

    // Record user interaction
    setLastInteractionTime(Date.now());

    try {
      // Check if the user can create an invoice
      const { canInvoice, reason } = await checkCanInvoice();

      if (canInvoice) {
        // console.log("✅ Access granted - showing image picker");
        amplitudeService.trackEvent('Ticket_Access_Granted', { reason });
        showImagePickerAlert();
      } else {
        // console.log("🚨 Access denied - reason:", { reason });

        // Mostrar alerta solo cuando se alcanza el límite de tickets al dar clic en botón +
        if (reason === 'limit_reached') {
          const currentPlan = getSubscriptionStatus(customerInfo);
          const planName = getPlanName(currentPlan);

          amplitudeService.trackEvent('Ticket_Limit_Reached_Alert_Shown', {
            platform: Platform.OS,
            current_plan: currentPlan,
            ticket_count: this_month_tickets_count,
            ticket_limit: getTicketLimit(customerInfo)
          });

          // Usar la alerta nativa en lugar del modal personalizado
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
                    current_plan: currentPlan
                  });
                  openSubscriptionManagement();
                }
              }
            ],
            { cancelable: true }
          );
        } else {
          // Para otros casos (no suscripción, etc.) mostrar el paywall normal
          amplitudeService.trackEvent('Paywall_Shown', {
            platform: Platform.OS,
            reason
          });
          props.navigation.navigate("paywallScreenV2");
        }
      }
    } catch (error) {
      console.error("🚨 Error during access check:", error);

      // Track error
      amplitudeService.trackEvent('Ticket_Access_Check_Error', {
        error: error.message
      });

      // Default to showing paywall on error
      props.navigation.navigate("paywallScreenV2");
    } finally {
      // Asegurar que siempre se libere la bandera de procesamiento
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 500);
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'empresarial': return 'Empresarial';
      case 'individual': return 'Individual';
      case 'standard': return 'Estándar';
      case 'ahorro': return 'Ahorro';
      default: return 'actual';
    }
  };

  const openSubscriptionManagement = () => {
    const paymentsManagementURL = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });

    // Track the action with amplitude
    amplitudeService.trackEvent('Subscription_Management_Opened', {
      has_subscription: true,
      subscription_type: getSubscriptionStatus(customerInfo),
      platform: Platform.OS
    });

    // Open the URL
    Linking.openURL(paymentsManagementURL).catch(err => {
      console.error('Error opening subscription management:', err);

      // Track error
      amplitudeService.trackEvent('Subscription_Management_Open_Error', {
        error: err.message
      });
    });
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['invoicesQuery', token, ticketsFilter],
    queryFn: async () => {
      if (!token) return { tickets: [] }; // Previene el fetch si no hay token
      try {
        // Use the API module function instead of direct fetch
        const data = await API.getTickets(token, ticketsFilter);
        // If data is undefined or empty, provide a default empty response
        if (!data || !data.tickets) {
          return { tickets: [] };
        }
        return data;
      } catch (error) {
        console.error('❌ Error fetching tickets:', error);
        // Track in analytics
        amplitudeService.trackEvent('API_Error', {
          endpoint: '/api/tickets/filtered',
          filter: ticketsFilter,
          error: error.message
        });
        // Return empty data to prevent UI crashes
        return { tickets: [] };
      }
    },
    enabled: !!token, // Solo ejecuta la query si hay token
    retry: 2,
    retryDelay: attempt => Math.min(1000 * Math.pow(2, attempt), 10000), // 1s, 2s, 4s with 10s max
    refetchInterval: 30000, // Longer interval to reduce API load
    onSuccess: (data) => {
      if (data && data.tickets) {
        // Track success
        amplitudeService.trackEvent('Invoices_Loaded', {
          count: data.tickets.length || 0,
          filter: ticketsFilter
        });
        setHasZeroTickets(data.tickets.length === 0);
        if (data.tickets.length > 0) {
          checkTicketLimit();
        }
      }
    },
    onError: (error) => {
      console.error('❌ Error loading invoices:', error);
      amplitudeService.trackEvent('Invoices_Load_Error', {
        error: error.message
      });
    }
  });

  const filteredInvoices = React.useMemo(() => {
    // console.log('📋 Processing invoices data:', {
    //   hasData: !!data,
    //   hasTickets: !!data?.tickets,
    //   ticketsLength: data?.tickets?.length || 0
    // });

    if (!data) return [];
    if (!data.tickets) return [];
    if (Array.isArray(data.tickets) && data.tickets.length === 0) return [];

    const _filteredInvoices = data.tickets;
    if (_filteredInvoices.length > 0) {
      setHasZeroTickets(false);
    } else {
      setHasZeroTickets(true);
    }

    const _sectionedInvoices = {};

    for (let i = 0; i < _filteredInvoices.length; i++) {
      const current = _filteredInvoices[i];
      const date = new Date(current.created_at);
      const month = date.getMonth();
      const year = date.getFullYear();
      const keyname = `${year}-${month}`;

      if (!_sectionedInvoices[keyname]) {
        _sectionedInvoices[keyname] = {
          title: `${monthNames[month]} ${year}`,
          data: [],
        };
      }

      _sectionedInvoices[keyname].data.push(current);
    }

    return Object.values(_sectionedInvoices);
  }, [data]);

  const currentFilter = ticketsFilter === 'last_3_months' ? 1 : 0;

  // keeps the deviceToken on sync with the server

  //this needs to use firebase
  /*const requestSubscription = async () => {
    // NOTIFICATIONS_PERMISSIONS_REQUESTED
    var _notificationsPermissionsRequested = false;
    try {
      const _notificationsPermissionsRequested_string =
        await AsyncStorage.getItem('NOTIFICATIONS_PERMISSIONS_REQUESTED');
      _notificationsPermissionsRequested = JSON.parse(
        _notificationsPermissionsRequested_string,
      );
    } catch (e) {
      _notificationsPermissionsRequested = false;
    }

    if (_notificationsPermissionsRequested) {
      // if the user cancelled notifications this doesnt have any effect
      // if the user re-accepted notifications this will register the new token
      Notifications.registerRemoteNotifications();

      Notifications.events().registerRemoteNotificationsRegistered(event => {
        // TODO: Send this token to the server
        // console.log('Receiving Device Token on MainScreen', event.deviceToken);
        API.updateDevicePushToken(token, event.deviceToken);

        // Track successful push registration
        amplitudeService.trackEvent('Push_Token_Registered');
      });
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        event => {
          // console.log('Error Receiving Device Token', event);

          // Track failed push registration
          amplitudeService.trackEvent('Push_Token_Registration_Failed', {
            error: event && event.message
          });
        },
      );
    }
    // if false just don't bother doing this step
  };

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      requestSubscription();
    }
  }, []);*/

  // Navigation listener to force-disable gestures on focus/blur
  React.useEffect(() => {
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      // console.log('MainScreen blur - maintaining gesture settings');
    });
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
      // console.log('MainScreen focus - re-disabling gestures');
      setTimeout(() => {
        props.navigation.setOptions({ 
          gestureEnabled: false,
          swipeEnabled: false
        });
        const parent = props.navigation.getParent();
        if (parent) {
          parent.setOptions({ 
            gestureEnabled: false,
            swipeEnabled: false
          });
        }
      }, 100);
    });
    return () => {
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [props.navigation]);

  // Debug logging for gesture state
  React.useEffect(() => {
    if (isFocused) {
      // console.log('🎯 MainScreen Focus - Gesture State Check:', {
      //   screenOptions: props.navigation.getState(),
      //   parentOptions: props.navigation.getParent()?.getState(),
      // });
    }
  }, [isFocused, props.navigation]);

  // Verificar Apple Search Ads attribution
  const checkAppleSearchAdsAttribution = async () => {
    try {
      if (Platform.OS !== 'ios') return;
      
      // console.log('🍎 Verificando Apple Search Ads attribution en MainScreen...');
      
      // Verificar si hay datos de atribución almacenados desde IntroScreen
      const storedAttributionData = await AsyncStorage.getItem('apple_search_ads_attribution_data');
      
      if (storedAttributionData) {
        const attributionData = JSON.parse(storedAttributionData);
        console.log('🍎 Datos de atribución encontrados en MainScreen:', {
          found: attributionData.attribution_found !== false,
          detected_on: attributionData.detected_on,
          campaign_id: attributionData.apple_campaign_id
        });
        
        // Si se encontró atribución, aplicarla al usuario actual
        if (attributionData.attribution_found !== false && attributionData.apple_campaign_id) {
          console.log('🍎 Aplicando atribución almacenada al usuario actual');
          
          // Obtener userId actual (si está logueado)
          const currentUserId = await AsyncStorage.getItem('userId') || 'anonymous';
          
          // Crear userData actualizado
          const currentUserData = {
            userId: currentUserId,
            installDate: attributionData.user_data?.installDate || new Date().toISOString(),
            country: attributionData.apple_country || 'MX',
            platform: Platform.OS,
            orgIds: attributionData.user_data?.orgIds || [3839590, 3839580, 3841110],
            defaultOrgId: attributionData.apple_org_id || 3839590
          };
          
          // Aplicar atribución al usuario actual
          const appliedAttribution = await amplitudeService.handleAppleSearchAdsAttribution(
            currentUserId,
            currentUserData
          );
          
          if (appliedAttribution) {
            console.log('🍎 Atribución aplicada exitosamente en MainScreen:', {
              user_id: currentUserId,
              campaign_id: appliedAttribution.apple_campaign_id,
              confidence: appliedAttribution.attribution_confidence
            });
            
            // Track evento de aplicación de atribución
            amplitudeService.trackEvent('Apple_Search_Ads_Attribution_Applied', {
              user_id: currentUserId,
              original_detection_screen: attributionData.detected_on,
              attribution_confidence: appliedAttribution.attribution_confidence,
              apple_campaign_id: appliedAttribution.apple_campaign_id,
              apple_org_id: appliedAttribution.apple_org_id,
              applied_on: 'main_screen'
            });
          }
        } else {
          console.log('🍎 No se encontró atribución válida en datos almacenados');
        }
        
        // Limpiar datos de atribución temporal (ya procesados)
        await AsyncStorage.removeItem('apple_search_ads_attribution_data');
        console.log('🍎 Datos de atribución temporal limpiados');
        
      } else {
        console.log('🍎 No hay datos de atribución almacenados, verificando como usuario nuevo...');
        
        // Verificar si es un usuario nuevo que no pasó por IntroScreen
        const alreadyChecked = await AsyncStorage.getItem('apple_search_ads_checked');
        if (!alreadyChecked) {
          console.log('🍎 Usuario nuevo detectado, verificando atribución...');
          
          const currentUserId = await AsyncStorage.getItem('userId') || 'anonymous';
          const userData = {
            userId: currentUserId,
            installDate: new Date().toISOString(),
            country: 'MX',
            platform: Platform.OS,
            orgIds: [3839590, 3839580, 3841110],
            defaultOrgId: 3839590
          };
          
          const attribution = await amplitudeService.handleAppleSearchAdsAttribution(
            currentUserId,
            userData
          );
          
          if (attribution) {
            console.log('🍎 Atribución encontrada para usuario nuevo en MainScreen:', attribution);
            amplitudeService.trackEvent('Apple_Search_Ads_Attribution_Found_New_User', {
              user_id: currentUserId,
              attribution_confidence: attribution.attribution_confidence,
              apple_campaign_id: attribution.apple_campaign_id,
              detected_on: 'main_screen_new_user'
            });
          }
          
          await AsyncStorage.setItem('apple_search_ads_checked', 'true');
        }
      }
      
    } catch (error) {
      console.error('🚨 Error verificando Apple Search Ads attribution en MainScreen:', error);
      
      // Almacenar error para debugging
      await AsyncStorage.setItem('apple_search_ads_attribution_error_main', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        detected_on: 'main_screen'
      }));
      
      amplitudeService.trackEvent('Apple_Search_Ads_Attribution_Error', {
        error: error.message,
        detected_on: 'main_screen',
        error_timestamp: new Date().toISOString()
      });
    }
  };

  // Updates user info when needed
  const updateUserInfo = async () => {
    if (!token) return;
    try {
      await Purchases.invalidateCustomerInfoCache();
      const data = await API.accountsUserInfo(token);
      if (data?.user) {
        // console.log('🔑 User info updated:', { 
        //   whitelistStatus: data.user.whitelisted_for_purchase,
        //   email: data.user.email
        // });
        saveUser(data.user, token);
        
        // Update Amplitude user properties when user info is updated
        if (data.user && userId && data.user.email) {
          const updatedUserProperties = {
            email: data.user.email,
            phone: data.user.taxpayer_cellphone || null,
            subscription_status: getSubscriptionStatus(customerInfo),
            is_whitelisted: data.user.whitelisted_for_purchase === true
          };
          
          // console.log('DEBUG - Updating user properties with email:', updatedUserProperties);
          amplitudeService.identifyUser(String(userId), updatedUserProperties);
          
          // Check Apple Search Ads attribution after user properties are set
          await checkAppleSearchAdsAttribution();
        }
      } else {
        console.warn('⚠️ No user data received from API.');
      }
    } catch (error) {
      console.error('🚨 Error updating user info:', error);

      // Track error
      amplitudeService.trackEvent('User_Info_Update_Failed', {
        error: error.message
      });
    }
  };

  React.useEffect(() => {
    const fetchSession = async () => {
      if (!token) return;
      try {
        const data = await API.accountsUserInfo(token);
        if (data?.user) {
          console.log('🔄 Updated session from API:', { whitelisted: data.user.whitelisted_for_purchase });
          saveUser(data.user, token);
        }
      } catch (error) {
        console.error('🚨 Failed to update session:', error);

        // Track error
        amplitudeService.trackEvent('Session_Update_Failed', {
          error: error.message
        });
      }
    };
    fetchSession();
  }, []);

  React.useEffect(() => {
    // call a function when the screen focuses
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
      console.log('mainScreen[focus]');
      updateUserInfo();

      // Record user interaction
      setLastInteractionTime(Date.now());
    });

    const unsubscribeBeforeRemove = props.navigation.addListener(
      'beforeRemove',
      e => {
        if (!e.data.action.source) {
          e.preventDefault();
        }
      },
    );

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {
      unsubscribeFocus();
      unsubscribeBeforeRemove();
    };
  }, [props.navigation]);

  const loginRevCat = async userId => {
    userId = String(userId);
    console.log('loginRevCat', { userId });
    if (userId === '') return;

    try {
      const { customerInfo: _customerInfo, created } = await Purchases.logIn(userId);
      console.log('RevenueCat login success:', {
        activeEntitlements: _customerInfo.entitlements?.active
      });
      setCustomerInfo(_customerInfo);

      // Track successful RevenueCat login
      amplitudeService.trackEvent('RevenueCat_Login_Success', {
        subscription_status: getSubscriptionStatus(_customerInfo),
        new_customer: created
      });
    } catch (error) {
      console.error('RevenueCat login failed:', error);

      // Track RevenueCat login error
      amplitudeService.trackEvent('RevenueCat_Login_Failed', {
        error: error.message
      });
    }
  };

  const addFromCamera = () => {
    amplitudeService.trackEvent('Camera_Button_Tapped');

    ImagePicker.launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        console.log({ response });
        if (response.didCancel) {
          amplitudeService.trackEvent('Camera_Cancelled');
          return;
        }
        if (response.errorCode) {
          amplitudeService.trackEvent('Camera_Error', {
            error_code: response.errorCode
          });

          if (response.errorCode !== 'camera_unavailable') {
            return;
          }
        }
        console.log({ assets: response.assets });

        amplitudeService.trackEvent('Photo_Captured', {
          uri_type: typeof response.assets?.[0]?.uri
        });

        props.navigation.navigate('invoiceUploadScreen', {
          image: response.assets?.[0] || {},
        });
      },
    );
  };

  const addFromGallery = () => {
    amplitudeService.trackEvent('Gallery_Button_Tapped');

    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          amplitudeService.trackEvent('Gallery_Selection_Cancelled');
          return;
        }

        amplitudeService.trackEvent('Gallery_Photo_Selected');

        props.navigation.navigate('invoiceUploadScreen', {
          image: response.assets[0],
        });
      },
    );
  };

  // New function for handling alternative input methods
  const handleAlternativeInput = () => {
    amplitudeService.trackEvent('Alternative_Input_Tapped');

    Alert.alert(
      'Agregar factura manualmente',
      '¿Cómo quieres agregar tu factura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ingresar datos',
          onPress: () => {
            amplitudeService.trackEvent('Manual_Entry_Selected');
            props.navigation.navigate('invoiceUploadScreen', {
              manualEntry: true
            });
          }
        },
        {
          text: 'Subir PDF',
          onPress: () => {
            amplitudeService.trackEvent('PDF_Upload_Selected');
            props.navigation.navigate('invoiceUploadScreen', {
              pdfUpload: true
            });
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Show image picker alert
  const showImagePickerAlert = () => {
    Alert.alert(
      'Agregar ticket',
      '',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            amplitudeService.trackEvent('Add_Ticket_Cancelled');
          }
        },
        {
          text: 'Tomar una foto',
          onPress: () => {
            amplitudeService.trackEvent('Camera_Option_Selected');
            addFromCamera();
          }
        },
        {
          text: 'Abrir la galería',
          onPress: () => {
            amplitudeService.trackEvent('Gallery_Option_Selected');
            addFromGallery();
          }
        }
      ],
      { cancelable: true }
    );
  };

  // We are doing this to update the customerInfo state when the user opens the app from a suspended state
  React.useEffect(() => {
    // Update whitelist status with strict check
    const isWhitelisted = session.whitelisted_for_purchase === true;
    setUserIsWhitelistedForPurchase(isWhitelisted);

    console.log('Session update:', {
      whitelistStatus: isWhitelisted,
      rawValue: session.whitelisted_for_purchase
    });

    if (session.taxpayer_cellphone) {
      loginRevCat(session.taxpayer_cellphone);
    }
    const onAppStateChange = nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (session?.taxpayer_cellphone) {
          loginRevCat(session.taxpayer_cellphone);
        }
      }
      appState.current = nextAppState;
    };

    const appstateSubscription = AppState.addEventListener('change', onAppStateChange);
    return () => appstateSubscription.remove();
  }, [session]);
  // RENDERING SECTION STARTS HERE

  // Función auxiliar para obtener el límite de tickets según el plan
  const getTicketLimit = (customerInfo) => {
    if (!customerInfo?.entitlements?.active) return 0;

    const planLimits = {
      'entitlement_empresarial': 100,
      'entitlement_individual': 60,
      '100_tickets_mensuales': 30,
      'entitlement_ahorro': 10
    };

    // Determinar el plan activo con el límite más alto
    let maxTickets = 0;
    const entitlements = Object.keys(customerInfo.entitlements.active);

    for (const entitlement of entitlements) {
      if (planLimits[entitlement] && planLimits[entitlement] > maxTickets) {
        maxTickets = planLimits[entitlement];
      }
    }

    return maxTickets;
  };

  // Lógica condicional para el carrusel
  const ticketLimit = getTicketLimit(customerInfo);
  const usagePercentage = ticketLimit > 0 ? Math.min((this_month_tickets_count / ticketLimit) * 100, 100) : 0;

  // Determinar qué componentes mostrar
  const shouldShowUsageIndicator = usagePercentage >= 80;
  const shouldShowInvoicedCard = hasInvoicedTickets;
  const shouldShowCarousel = shouldShowUsageIndicator || shouldShowInvoicedCard;

  // Crear array dinámico de componentes para el carrusel
  const carouselData = [];
  if (shouldShowUsageIndicator) {
    carouselData.push({ id: 'usage', component: TicketUsageIndicator });
  }
  if (shouldShowInvoicedCard) {
    carouselData.push({ id: 'facturados', component: TicketsFacturadosCard });
  }

  // Debug logging - Commented to reduce log spam
  // console.log('🎯 Carrusel Debug:', {
  //   hasInvoicedTickets,
  //   shouldShowUsageIndicator,
  //   shouldShowInvoicedCard,
  //   shouldShowCarousel,
  //   carouselDataLength: carouselData.length,
  //   usagePercentage
  // });

  // Funciones para el carrusel
  const renderCarouselItem = ({ item }) => {
    const Component = item.component;
    
    // Props específicas para TicketUsageIndicator
    if (item.id === 'usage') {
      return (
        <View style={[styles.carouselItem, { width: screenWidth }]}>
          <Component
            currentCount={this_month_tickets_count}
            maxCount={getTicketLimit(customerInfo)}
            userId={userId}
            currentPlan={getSubscriptionStatus(customerInfo)}
            onUpgradePress={() => {
              amplitudeService.trackEvent('Subscription_Management_Button_Tapped', {
                from_screen: 'main_screen',
                current_plan: getSubscriptionStatus(customerInfo)
              });
              openSubscriptionManagement();
            }}
          />
        </View>
      );
    }
    
    // Props específicas para TicketsFacturadosCard
    if (item.id === 'facturados') {
      return (
        <View style={[styles.carouselItem, { width: screenWidth }]}>
          <Component forceRefresh={false} />
        </View>
      );
    }
    
    return null;
  };

  const renderPagination = () => {
    // Solo mostrar paginación si hay más de 1 elemento
    if (carouselData.length <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === carouselActiveIndex
                ? styles.paginationDotActive
                : styles.paginationDotInactive
            ]}
          />
        ))}
      </View>
    );
  };

  const onCarouselSnapToItem = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    // Asegurar que el índice esté dentro del rango
    const safeIndex = Math.max(0, Math.min(index, carouselData.length - 1));
    setCarouselActiveIndex(safeIndex);
  };

  // console.log('🚩 RENDERING DECISION POINT:', { // Commented to reduce log spam
  //   isLoading,
  //   hasError: !!error,
  //   hasZeroTickets,
  //   filteredInvoicesLength: filteredInvoices?.length || 0,
  //   hasEntitlements: customerInfo?.entitlements?.active && Object.keys(customerInfo?.entitlements?.active || {}).length > 0
  // });

  // Loading state
  if (isLoading) {
          // console.log('⏳ DEBUG - Rendering loading state');
    return (
      <ScreenLayout
        token={token}
        userId={userId}
        announcements={{
          navigation: props.navigation,
          token,
          userId,
          customerInfo,
          csfPdfUrl: csf_pdf_url,
        }}
        customerInfo={customerInfo}
        handleAddButton={handleAddButton}
        handleAlternativeInput={handleAlternativeInput}
        {...props}
      >
        <View style={styles.debugContainer}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Cargando facturas...
            </Text>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        </View>
      </ScreenLayout>
    );
  }

  // Error state
  if (error) {
    console.log('❌ DEBUG - Rendering error state:', error);
    return (
      <ScreenLayout
        token={token}
        userId={userId}
        customerInfo={customerInfo}
        disabled
        handleAddButton={handleAddButton}
        handleAlternativeInput={handleAlternativeInput}
        {...props}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error inesperado</Text>
          <Text style={styles.errorText}>Error: {error.toString()}</Text>
          <Text style={styles.errorHeading}>Resolución del problema:</Text>
          <Text style={styles.errorText}>1- Revisa tu conexión a internet.</Text>
          <Text style={styles.errorText}>2- Vuelve a abrir la aplicación.</Text>
          <Text style={styles.errorText}>3- Si el problema persiste, contacta al soporte.</Text>
        </View>
      </ScreenLayout>
    );
  }

  // Empty state with all steps visible - VERSIÓN MEJORADA
  // This file only contains the relevant part of the code being modified.
  // The specific change requested was to modify the empty state header from 
  // "¡Inicia a facturar tus tickets!" to "¡Libérate de los tickets!" with styling from Image 2.

  // Only changing the empty state section of the render function:

  // Verificar si hay tickets en la respuesta
  // Check subscription status before deciding what to show
  const hasSubscription = customerInfo?.entitlements?.active &&
    Object.keys(customerInfo?.entitlements?.active || {}).length > 0;

  // Verificar si hay tickets en la respuesta
  if (filteredInvoices.length === 0 && !hasSubscription) {
    console.log('🗒️ DEBUG - Rendering empty state, no subscription detected');
    return (
      <ScreenLayout
        token={token}
        userId={userId}
        customerInfo={customerInfo}
        announcements={{
          navigation: props.navigation,
          token,
          userId,
          customerInfo,
          csfPdfUrl: csf_pdf_url,
        }}
        handleAddButton={handleAddButton}
        handleAlternativeInput={handleAlternativeInput}
        {...props}
      >
        <ScrollView 
          style={{ flex: 1, backgroundColor: 'white' }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
            {/* Encabezado actualizado con ilustración */}
            <View style={{
              backgroundColor: '#7b4efb',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              flexDirection: 'row',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 8,
                }}>
                  ¡Libérate de los tickets!
                </Text>

                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 16,
                }}>
                  Prueba gratis 7 días.
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#5B22FA',
                    borderRadius: 50,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                  }}
                  onPress={handleAddButton}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#ffffff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Icon name="plus" size={12} color="#5B22FA" />
                  </View>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Subir ticket</Text>
                </TouchableOpacity>
              </View>

              {/* Ilustración del personaje */}
              <Image
                source={require('./../../assets/carrousel-mainscreen-1.png')}
                style={{
                  width: 120,
                  height: 140,
                  resizeMode: 'contain',
                }}
              />
            </View>

            {/* Pasos de onboarding */}
            {/* Paso 1 */}
            <View style={{
              backgroundColor: '#f8f8f8',
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#5B22FA',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: '#333' }}>
                  Toma foto de tu ticket
                </Text>
                <Text style={{ color: '#666', fontSize: 14 }}>
                  Da click en el botón de Subir Ticket
                </Text>
              </View>
              <TouchableOpacity onPress={handleAddButton}>
                <Icon name="camera" size={24} color="#7c7c7c" />
              </TouchableOpacity>
            </View>

            {/* Paso 2 */}
            <View style={{
              backgroundColor: '#f8f8f8',
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#5B22FA',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: '#333' }}>
                  Procesaremos tu factura
                </Text>
                <Text style={{ color: '#666', fontSize: 14 }}>
                  Nuestro equipo trabajará para facturar tu ticket
                </Text>
              </View>
              <Icon name="check-circle" size={24} color="#7c7c7c" />
            </View>

            {/* Paso 3 */}
            <View style={{
              backgroundColor: '#f8f8f8',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#5B22FA',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2, color: '#333' }}>
                  ¡Recibe tu factura!
                </Text>
                <Text style={{ color: '#666', fontSize: 14 }}>
                  Sin esfuerzo y al instante
                </Text>
              </View>
              <Icon name="file-text" size={24} color="#7c7c7c" />
            </View>
        </ScrollView>
      </ScreenLayout>
    );
  } else if (filteredInvoices.length === 0 && hasSubscription) {
    // console.log('🗒️ DEBUG - User has subscription but no tickets, showing normal interface'); // Commented to reduce log spam
    // Return the normal view but with no data
    return (
      <ScreenLayout
        token={token}
        userId={userId}
        customerInfo={customerInfo}
        announcements={{
          navigation: props.navigation,
          token,
          userId,
          customerInfo,
          csfPdfUrl: csf_pdf_url,
        }}
        handleAddButton={handleAddButton}
        handleAlternativeInput={handleAlternativeInput}
        {...props}
      >
        <View style={styles.mainContainer}>
          {/* Carrusel de indicadores - lógica condicional */}
          {shouldShowCarousel && (
            <View style={styles.carouselContainer}>
              <FlatList
                data={carouselData}
                renderItem={renderCarouselItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                onScroll={onCarouselSnapToItem}
                scrollEventThrottle={16}
              />
              {/* Solo mostrar paginación si hay más de 1 elemento */}
              {carouselData.length > 1 && renderPagination()}
            </View>
          )}
          
          <View style={styles.emptyStateWithSubscription}>
            <Image
              source={require('./../../assets/carrousel-mainscreen-1.png')}
              style={styles.emptyStateImageSmall}
            />
            <Text style={[styles.emptyStateTitle, { lineHeight: 32 }]}>  {/* Ajuste de lineHeight */}
              Aún no tienes tickets
            </Text>
            <Text style={[styles.emptyStateSubtitle, { lineHeight: 22 }]}>  {/* Ajuste de lineHeight */}
              ¡Sube tu primer ticket para empezar a facturar!
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddButton}
            >
              <Text style={styles.primaryButtonText}>Subir ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  // Regular state with tickets
  // console.log('📃 DEBUG - Rendering regular state with tickets'); // Commented to reduce log spam
  
  // Debug logs para TicketUsageIndicator - Commented to reduce log spam
  // console.log('🎯 TicketUsageIndicator Debug:', {
  //   currentCount: this_month_tickets_count,
  //   maxCount: ticketLimit,
  //   usagePercentage: usagePercentage,
  //   shouldShow: usagePercentage >= 80,
  //   hasSubscription: !!customerInfo?.entitlements?.active,
  //   subscriptionStatus: getSubscriptionStatus(customerInfo),
  //   customerInfo: customerInfo?.entitlements?.active
  // });
  
  return (
    <ScreenLayout
      token={token}
      userId={userId}
      customerInfo={customerInfo}
      announcements={{
        navigation: props.navigation,
        token,
        userId,
        customerInfo,
        csfPdfUrl: csf_pdf_url,
      }}
      handleAddButton={handleAddButton}
      handleAlternativeInput={handleAlternativeInput}
      {...props}
    >
      <View style={styles.mainContainer}>
        {/* Carrusel de indicadores - lógica condicional */}
        {shouldShowCarousel && (
          <View style={styles.carouselContainer}>
            <FlatList
              data={carouselData}
              renderItem={renderCarouselItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              onScroll={onCarouselSnapToItem}
              scrollEventThrottle={16}
            />
            {/* Solo mostrar paginación si hay más de 1 elemento */}
            {carouselData.length > 1 && renderPagination()}
          </View>
        )}
        
        <SectionList
          style={styles.invoiceList}
          scrollIndicatorInsets={{ right: 1 }}
          sections={filteredInvoices}
          contentInsetAdjustmentBehavior="automatic"
          onScroll={() => {
            // Record user interaction
            setLastInteractionTime(Date.now());
          }}
          renderItem={({ item, index, section }) => {
            const invoice = item;
            const isLastInSection = index === section.data.length - 1;
            
            return (
              <View>
                <InvoiceCard
                  key={invoice.id}
                  invoiceID={invoice.id}
                  scanURL={invoice.scan_url}
                  merchant={invoice.ticket_merchant}
                  total={invoice.ticket_total}
                  category={invoice.ticket_category}
                  date={invoice.created_at}
                  status={invoice.status}
                  onPress={() => {
                    amplitudeService.trackEvent('Invoice_Selected', {
                      invoice_id: invoice.id,
                      status: invoice.status,
                      merchant: invoice.ticket_merchant || 'unknown'
                    });

                    props.navigation.navigate('invoiceScreen', {
                      invoice: invoice,
                      invoiceID: invoice.id,
                      status: invoice.status,
                    });
                  }}
                />
                {!isLastInSection && <ItemSeparator />}
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
              {section.title}
            </Text>
            </View>
          )}
          keyExtractor={item => item.id}
          refreshing={isLoading}
          onRefresh={() => {
            amplitudeService.trackEvent('Invoice_List_Refreshed');
          }}
        />
      </View>
    </ScreenLayout>
  );
}