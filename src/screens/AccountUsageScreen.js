import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import TicketUsageIndicator from '../components/TicketUsageIndicator';
import TicketsFacturadosCard from '../components/TicketsFacturadosCard';
import amplitudeService from '../utils/analytics/amplitude';
import { AuthContext } from '../contexts/AuthContext';
import * as API from '../lib/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { StandardLayout } from '../components/StandardLayout';

export default function AccountUsageScreen({ route }) {
  const navigation = useNavigation();
  const { session } = useContext(AuthContext);
  const token = session?.token;
  const userId = session?.taxpayer_cellphone;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({});
  const [currentCount, setCurrentCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [currentPlan, setCurrentPlan] = useState('none');

  // Helper functions
  const getSubscriptionStatus = (info) => {
    if (!info || !info.entitlements || !info.entitlements.active) return 'none';

    const entitlements = Object.keys(info.entitlements.active);
    if (entitlements.includes('entitlement_empresarial')) return 'empresarial';
    if (entitlements.includes('entitlement_individual')) return 'individual';
    if (entitlements.includes('100_tickets_mensuales')) return 'standard';
    if (entitlements.includes('entitlement_ahorro')) return 'ahorro';
    return 'unknown';
  };

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

  const getMonthlyTicketCount = useCallback(async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const startDate = firstDayOfMonth.toISOString();
      const endDate = lastDayOfMonth.toISOString();

      const result = await API.getMonthlyTicketCount(token, startDate, endDate);

      if (result.success) {
        const count = result.count || 0;
        setCurrentCount(count);
        return count;
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.warn('⚠️ Error getting monthly ticket count:', error);
      return 0;
    }
  }, [token]);

  const checkEntitlements = useCallback(async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { customerInfo: _customerInfo } = await Purchases.logIn(userId);
      setCustomerInfo(_customerInfo);
      
      const plan = getSubscriptionStatus(_customerInfo);
      setCurrentPlan(plan);
      
      const ticketLimit = getTicketLimit(_customerInfo);
      setMaxCount(ticketLimit);

      // Get ticket count if there's an active subscription
      if (plan !== 'none' && plan !== 'unknown') {
        await getMonthlyTicketCount();
      }
    } catch (error) {
      console.error('Error checking entitlements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getMonthlyTicketCount]);

  const openSubscriptionManagement = () => {
    const paymentsManagementURL = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });

    amplitudeService.trackEvent('Subscription_Management_Opened', {
      has_subscription: true,
      subscription_type: currentPlan,
      platform: Platform.OS,
      from_screen: 'account_usage'
    });

    Linking.openURL(paymentsManagementURL).catch(err => {
      console.error('Error opening subscription management:', err);
    });
  };

  const getPlanDisplayName = (plan) => {
    switch (plan) {
      case 'empresarial': return 'Plan Empresarial';
      case 'individual': return 'Plan Individual';
      case 'standard': return 'Plan Estándar';
      case 'ahorro': return 'Plan Ahorro';
      default: return 'Plan Actual';
    }
  };

  // Effects
  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Uso de tu cuenta',
    });
  }, [navigation]);

  React.useEffect(() => {
    if (userId) {
      checkEntitlements(userId);
    }
  }, [userId, checkEntitlements]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        checkEntitlements(userId);
      }
    }, [userId, checkEntitlements])
  );

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors?.primary?.[500] || "#7B4EFB"} />
          <Text style={styles.loadingText}>Cargando información de tu cuenta...</Text>
        </View>
      </View>
    );
  }

  // Show special content for users without subscription
  if (currentPlan === 'none' || currentPlan === 'unknown') {
    // Check if user has already used free trial
    const hasUsedFreeTrial = customerInfo?.managementURL || 
                            customerInfo?.allPurchaseDates ||
                            (customerInfo?.entitlements?.all && Object.keys(customerInfo.entitlements.all).length > 0);

    const isNewUser = !hasUsedFreeTrial;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Promotion Card - Free Trial or Subscribe */}
          <View style={styles.freeTrialCard}>
            <View style={styles.freeTrialHeader}>
              {isNewUser && (
                <Icon 
                  name="gift" 
                  size={24} 
                  color={colors?.primary?.[500] || "#7B4EFB"} 
                />
              )}
              <Text style={[styles.freeTrialTitle, !isNewUser && styles.freeTrialTitleNoIcon]}>
                {isNewUser ? "¡Prueba gratis 7 días!" : "¡Factura automáticamente!"}
              </Text>
            </View>
            {isNewUser && (
              <Text style={styles.freeTrialSubtitle}>
                Accede a todas las funciones premium sin costo
              </Text>
            )}
            
            <View style={styles.benefitsList}>
              {isNewUser ? (
                <>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Facturas ilimitadas</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Soporte prioritario</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Sin compromisos</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Factura con una sola foto</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Factura desde gasolina, casetas hasta restaurantes.</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon name="check" size={16} color={colors?.success?.[500] || "#10B981"} />
                    <Text style={styles.benefitText}>Gestiona tus gastos personales o de equipo</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.freeTrialButton}
              onPress={() => {
                amplitudeService.trackEvent(isNewUser ? 'Free_Trial_Button_Tapped' : 'Subscribe_Button_Tapped', {
                  from_screen: 'account_usage',
                  user_type: isNewUser ? 'new_user' : 'returning_user'
                });
                navigation.navigate('paywallScreenV2');
              }}>
              <Text style={styles.freeTrialButtonText}>
                {isNewUser ? "Iniciar prueba gratis" : "Comprar suscripción"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info about subscription plans */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="info" size={16} color={colors?.text?.tertiary || "#6B7280"} />
              <Text style={styles.infoText}>
                {isNewUser
                  ? "Prueba todas las funciones gratis por 7 días, sin compromisos ni cargos automáticos."
                  : "Con una suscripción activa podrás generar facturas según tu plan y ver estadísticas detalladas de uso."
                }
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name={isNewUser ? "calendar" : "trending-up"} size={16} color={colors?.text?.tertiary || "#6B7280"} />
              <Text style={styles.infoText}>
                {isNewUser
                  ? "Cancela en cualquier momento desde tu cuenta, sin penalizaciones."
                  : "Planes desde $99 MXN/mes con diferentes límites de tickets mensuales."
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={openSubscriptionManagement}>
            <Text style={styles.manageButtonText}>
              {isNewUser ? "Ver detalles de la prueba" : "Ver todos los planes"}
            </Text>
            <Icon name="external-link" size={16} color={colors?.text?.primary || "#111827"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Regular content for subscribed users
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* TicketsFacturadosCard */}
        <View style={styles.ticketsFacturadosWrapper}>
          <TicketsFacturadosCard forceRefresh={true} />
        </View>

        {/* TicketUsageIndicator */}
        <View style={styles.ticketUsageWrapper}>
          <TicketUsageIndicator
            currentCount={currentCount}
            maxCount={maxCount}
            userId={userId}
            currentPlan={currentPlan}
            onUpgradePress={openSubscriptionManagement}
            forceShow={true}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="info" size={16} color={colors?.text?.tertiary || "#6B7280"} />
            <Text style={styles.infoText}>
              Tu límite de tickets en {getPlanDisplayName(currentPlan)} se renueva cada mes el día 1.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Icon name="zap" size={16} color={colors?.text?.tertiary || "#6B7280"} />
            <Text style={styles.infoText}>
              Si necesitas más tickets, puedes actualizar tu plan en cualquier momento.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={openSubscriptionManagement}>
          <Text style={styles.manageButtonText}>Gestionar suscripción</Text>
          <Icon name="external-link" size={16} color={colors?.text?.primary || "#111827"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background?.secondary || '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing?.[4] || 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing?.[4] || 16,
  },
  loadingText: {
    marginTop: spacing?.[3] || 12,
    fontSize: 16,
    color: colors?.text?.secondary || '#6B7280',
    textAlign: 'center',
  },

  // Free Trial Promotion Styles
  freeTrialCard: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderRadius: borderRadius?.lg || 12,
    padding: spacing?.[6] || 24,
    marginTop: spacing?.[4] || 16,
    marginBottom: spacing?.[4] || 16,
    borderWidth: 2,
    borderColor: colors?.primary?.[200] || '#C4B5FD',
    ...shadows?.md || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  freeTrialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.[3] || 12,
  },
  freeTrialTitle: {
    fontSize: typography?.fontSize?.xl || 20,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    marginLeft: spacing?.[2] || 8,
  },
  freeTrialTitleNoIcon: {
    marginLeft: 0,
  },
  freeTrialSubtitle: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.secondary || '#6B7280',
    marginBottom: spacing?.[4] || 16,
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: spacing?.[5] || 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.[2] || 8,
  },
  benefitText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.primary || '#111827',
    marginLeft: spacing?.[2] || 8,
    fontWeight: typography?.fontWeight?.medium || '500',
  },
  freeTrialButton: {
    backgroundColor: colors?.primary?.[500] || '#7B4EFB',
    borderRadius: borderRadius?.lg || 12,
    paddingVertical: spacing?.[4] || 16,
    paddingHorizontal: spacing?.[6] || 24,
    alignItems: 'center',
    ...shadows?.sm || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  freeTrialButtonText: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: '#FFFFFF',
  },

  infoContainer: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12, // spacing[3]
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors?.text?.secondary || '#374151',
  },
  manageButton: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  manageButtonText: {
    fontSize: 16,
    color: colors?.text?.primary || '#111827',
    marginRight: 8,
    fontWeight: '500',
  },
  ticketsFacturadosWrapper: {
    marginTop: 16, // spacing[4]
    marginBottom: 4, // spacing[1]
    marginHorizontal: -16, // -spacing[4]
  },
  ticketUsageWrapper: {
    marginBottom: 12, // spacing[3]
    marginHorizontal: -16, // -spacing[4]
  },
}); 