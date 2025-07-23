import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import AIcon from 'react-native-vector-icons/dist/FontAwesome5';
import MIcon from 'react-native-vector-icons/dist/MaterialIcons';
import {AuthContext} from './../contexts/AuthContext';
import Purchases from 'react-native-purchases';
import * as API from './../lib/api';
import DeviceInfo from 'react-native-device-info';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import amplitudeService from '../utils/analytics/amplitude';
import { colors, typography, spacing, borderRadius } from '../theme';

const useDisableGesture = (disable = true) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    const value = !(isFocused && disable);

    navigation.setOptions({gestureEnabled: value});
    navigation.getParent()?.setOptions({gestureEnabled: value});
  }, [navigation, isFocused, disable]);

  React.useEffect(() => {
    return () => {
      navigation.getParent()?.setOptions({gestureEnabled: true});
    };
  }, [navigation]);
};

const _try = (fn, fallback) => {
  try {
    const result = fn();
    return result === undefined || result === null ? fallback : result;
  } catch (e) {
    return fallback;
  }
};

// LinkedIn-style Menu Item Component
const MenuOption = ({ 
  icon, 
  iconType = 'feather', 
  iconColor = colors.text.secondary,
  title, 
  subtitle, 
  rightText, 
  showBadge = false, 
  badgeColor = colors.error[500],
  onPress,
  isLast = false 
}) => {
  const renderIcon = () => {
    const iconProps = {
      size: 20,
      color: iconColor,
      name: icon
    };

    switch (iconType) {
      case 'awesome':
        return <AIcon {...iconProps} />;
      case 'material':
        return <MIcon {...iconProps} />;
      default:
        return <Icon {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuOption, isLast && styles.noBottomBorder]}>
      {/* Icon Avatar */}
      <View style={styles.menuIconContainer}>
        {renderIcon()}
      </View>

      {/* Content */}
      <View style={styles.menuContent}>
        <View style={styles.menuPrimaryLine}>
          <Text style={styles.menuTitle} numberOfLines={1}>
            {title}
          </Text>
          {rightText && (
            <Text style={styles.menuRightText}>{rightText}</Text>
          )}
        </View>
        {subtitle && (
          <Text style={styles.menuSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Action */}
      <View style={styles.menuAction}>
        {showBadge && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]} />
        )}
        <Icon size={16} color={colors.text.tertiary} name="chevron-right" />
      </View>
    </TouchableOpacity>
  );
};

// Profile Header Component (LinkedIn style)
const ProfileHeader = ({ name, id, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.profileHeader}>
      {/* Avatar */}
      <View style={styles.profileAvatar}>
        <Icon name="user" size={20} color={colors.text.secondary} />
      </View>

      {/* Content */}
      <View style={styles.profileContent}>
        <Text style={styles.profileName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.profileId} numberOfLines={1}>
          {id}
        </Text>
      </View>

      {/* Action */}
      <View style={styles.profileAction}>
        <Icon size={16} color={colors.text.tertiary} name="chevron-right" />
      </View>
    </TouchableOpacity>
  );
};

export default function MenuScreen(props) {
  const [activeEntitlement, setActiveEntitlement] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [customerInfo, setCustomerInfo] = React.useState({});
  const [this_month_tickets_count, setThisMonthTicketsCount] = React.useState(0);
  const [appVersion, setAppVersion] = React.useState('');
  const [buildNumber, setBuildNumber] = React.useState('');
  const [systemVersion, setSystemVersion] = React.useState('');
  useDisableGesture(true);

  const {session, logout} = React.useContext(AuthContext);
  const insets = useSafeAreaInsets();

  // Función para obtener el límite de tickets según el plan
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

  // Función para obtener el conteo mensual de tickets
  const getMonthlyTicketCount = React.useCallback(async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const startDate = firstDayOfMonth.toISOString();
      const endDate = lastDayOfMonth.toISOString();

      const result = await API.getMonthlyTicketCount(session.token, startDate, endDate);

      if (result.success) {
        const count = result.count || 0;
        setThisMonthTicketsCount(count);
        return count;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.warn('⚠️ Error getting monthly ticket count:', error);
      return 0;
    }
  }, [session.token]);

  // Función para determinar el estado de suscripción
  const getSubscriptionStatus = (info) => {
    if (!info || !info.entitlements || !info.entitlements.active) return 'none';

    const entitlements = Object.keys(info.entitlements.active);
    if (entitlements.includes('entitlement_empresarial')) return 'empresarial';
    if (entitlements.includes('entitlement_individual')) return 'individual';
    if (entitlements.includes('100_tickets_mensuales')) return 'standard';
    if (entitlements.includes('entitlement_ahorro')) return 'ahorro';
    return 'unknown';
  };

  // Función para calcular el porcentaje de uso
  const getUsagePercentage = () => {
    const ticketLimit = getTicketLimit(customerInfo);
    if (ticketLimit === 0) return 0;
    return Math.min((this_month_tickets_count / ticketLimit) * 100, 100);
  };

  const checkEntitlements = React.useCallback(async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const {customerInfo: _customerInfo} = await Purchases.logIn(userId);
      setCustomerInfo(_customerInfo);

      const priorityList = [
        'entitlement_empresarial',
        'entitlement_individual', 
        '100_tickets_mensuales',
        'entitlement_ahorro',
      ];

      const activeEntitlements = _customerInfo.entitlements?.active;

      let highestPriorityEntitlement = null;
      if (activeEntitlements) {
        for (const entitlement of priorityList) {
          if (activeEntitlements[entitlement]) {
            highestPriorityEntitlement = entitlement;
            break;
          }
        }
      }

      setActiveEntitlement(highestPriorityEntitlement);

      // Obtener el conteo de tickets si hay suscripción activa
      if (highestPriorityEntitlement) {
        await getMonthlyTicketCount();
      }
    } catch (error) {
      console.error('Error checking entitlements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setCustomerInfo, setActiveEntitlement, getMonthlyTicketCount]);

  React.useEffect(() => {
    if (session?.taxpayer_cellphone) {
      checkEntitlements(session.taxpayer_cellphone);
    }
  }, [session, checkEntitlements]);

  // Obtener información de versión
  React.useEffect(() => {
    const getAppInfo = async () => {
      try {
        const version = DeviceInfo.getVersion();
        const build = DeviceInfo.getBuildNumber();
        const system = DeviceInfo.getSystemVersion();
        
        setAppVersion(version);
        setBuildNumber(build);
        setSystemVersion(system);
      } catch (error) {
        console.warn('Error obteniendo información de la app:', error);
      }
    };

    getAppInfo();
  }, []);

  const taxpayer_id = _try(() => session.taxpayer_identifier, '');
  const taxpayer_name = _try(() => session.taxpayer_name, '');
  const user_email = _try(() => session.email, '');
  const user_address = _try(() => session.taxpayer_address, '');
  const user_zip = _try(() => session.taxpayer_zipcode, '');
  const user_city = _try(() => session.taxpayer_city, '');
  const user_state = _try(() => session.taxpayer_state, '');
  const user_country = _try(() => session.taxpayer_country, '');
  const user_cellphone = _try(() => session.taxpayer_cellphone, '');
  const csf_pdf_url = _try(() => session.csf_pdf_url, '');
  const csf_verified_status = _try(() => session.csf_verified_status, '');

  const handleLogOut = () => {
    logout();
  };

  const handleDeleteAccountConfirmation = async () => {
    try {
      const response = await API.deleteUserAccount(session.token);
      
      if (response.success) {
        amplitudeService.trackEvent('Account_Deleted_Successfully');
        logout();
      } else {
      Alert.alert(
          'Error',
          'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
          [{ text: 'OK' }]
      );
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al eliminar la cuenta. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteAccountButton = () => {
    amplitudeService.trackEvent('Delete_Account_Button_Tapped');
    
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDeleteAccountConfirmation 
        }
      ]
    );
  };

  const openSubscriptionManagement = () => {
    const currentPlan = getSubscriptionStatus(customerInfo);
    
    // Si no tiene plan activo, mostrar paywall
    if (currentPlan === 'none' || currentPlan === 'unknown') {
      amplitudeService.trackEvent('Subscription_Management_No_Plan_Paywall_Opened', {
        has_subscription: false,
        subscription_type: currentPlan,
        platform: Platform.OS
      });
      
      props.navigation.navigate('paywallScreenV2');
      return;
    }

    // Si tiene plan activo, abrir gestión de suscripción
    const paymentsManagementURL = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });

    amplitudeService.trackEvent('Subscription_Management_Opened', {
      has_subscription: true,
      subscription_type: currentPlan,
      platform: Platform.OS
    });

    Linking.openURL(paymentsManagementURL).catch(err => {
      console.error('Error opening subscription management:', err);
      amplitudeService.trackEvent('Subscription_Management_Open_Error', {
        error: err.message
      });
    });
  };

  const openAccountUsage = () => {
    const currentPlan = getSubscriptionStatus(customerInfo);
    
    // Siempre ir a AccountUsageScreen, que manejará la lógica interna
    amplitudeService.trackEvent('Account_Usage_Tapped', {
      current_plan: currentPlan,
      has_subscription: currentPlan !== 'none' && currentPlan !== 'unknown'
    });
    props.navigation.navigate('accountUsageScreen');
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'empresarial': return 'Plan Empresarial';
      case 'individual': return 'Plan Individual';
      case 'standard': return 'Plan Estándar';
      case 'ahorro': return 'Plan Ahorro';
      default: return 'Sin plan activo';
    }
  };

  const currentPlan = getSubscriptionStatus(customerInfo);
  const planName = getPlanName(currentPlan);
  const usagePercentage = getUsagePercentage();
  const ticketLimit = getTicketLimit(customerInfo);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Cuenta</Text>
          </View>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.section}>
          <ProfileHeader 
            name={taxpayer_name || _try(() => session.email, '')}
            id="Datos fiscales"
            onPress={() => {
              amplitudeService.trackEvent('Fiscal_Data_Tapped');
              props.navigation.navigate('fiscalDataScreen');
            }}
          />
        </View>

        {/* Subscription Section Header */}
        <Text style={styles.sectionHeader}>Suscripción</Text>
        
        {/* Plan and Usage Section */}
        <View style={styles.section}>
          <MenuOption
            icon="crown"
            iconType="awesome"
            iconColor={colors.warning[500]}
            title={planName}
            subtitle={currentPlan === 'none' || currentPlan === 'unknown' ? "Suscribirse" : "Gestionar Suscripción"}
            onPress={openSubscriptionManagement}
          />
          
          <MenuOption
            icon="bar-chart-2"
            iconColor={colors.text.secondary}
            title="Uso de tu cuenta"
            subtitle={currentPlan === 'none' || currentPlan === 'unknown' ? "Ver planes disponibles" : "Ver límites y estadísticas"}
            showBadge={usagePercentage >= 80}
            badgeColor={colors.error[500]}
            onPress={openAccountUsage}
            isLast
          />
        </View>

        {/* Options Section Header */}
        <Text style={styles.sectionHeader}>Opciones</Text>
        
        {/* Account Section */}
        <View style={styles.section}>
          <MenuOption
            icon="help-circle"
            iconColor={colors.text.secondary}
            title="Centro de ayuda"
            subtitle="Preguntas frecuentes y soporte"
            onPress={() => {
              amplitudeService.trackEvent('Help_Menu_Tapped');
              props.navigation.navigate('helpScreen');
            }}
          />
          
          <MenuOption
            icon="log-out"
            iconColor={colors.text.secondary}
            title="Cerrar sesión"
            onPress={handleLogOut}
          />
          
          <MenuOption
            icon="trash-2"
            iconColor={colors.error[500]}
            title="Eliminar cuenta"
            subtitle="Esta acción no se puede deshacer"
            onPress={handleDeleteAccountButton}
            isLast
          />
        </View>

        {/* Version Information */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Fotofacturas {appVersion} ({buildNumber})
          </Text>
          <Text style={styles.versionSubtext}>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'} {systemVersion}
          </Text>
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

  section: {
    backgroundColor: colors.background.primary,
    marginTop: spacing[2],
    marginHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginTop: spacing[4],
    marginBottom: spacing[1],
    marginHorizontal: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Profile Header Styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },

  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },



  profileContent: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },

  profileId: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  profileAction: {
    padding: spacing[1],
  },
  
  // Menu Option Styles (LinkedIn pattern)
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },

  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  menuContent: {
    flex: 1,
  },
  
  menuPrimaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },

  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },

  menuRightText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },

  menuSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing[2],
  },

  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },

  noBottomBorder: {
    borderBottomWidth: 0,
  },

  bottomSpacer: {
    height: spacing[8],
  },

  // Header Styles (matching ScreenLayout)
  headerContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4], // 16px
    paddingTop: Platform.OS === 'ios' ? spacing[5] : spacing[6], // 20px/24px
    paddingBottom: spacing[4], // 16px
    minHeight: 60, // Consistent header height
  },

  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: typography?.fontSize?.['3xl'] || 30,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    // Optimizado: theme system sin lineHeight/letterSpacing problemáticos
  },

  // Version Information Styles
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },

  versionText: {
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.secondary || '#374151',
    textAlign: 'center',
    marginBottom: spacing[1],
  },

  versionSubtext: {
    fontSize: typography?.fontSize?.xs || 12,
    color: colors?.text?.tertiary || '#6B7280',
    textAlign: 'center',
  },
});