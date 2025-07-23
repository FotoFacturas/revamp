import React from 'react';
import { View, Platform, BackHandler, Alert, InteractionManager } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { AuthContext } from '../contexts/AuthContext';

export default function PaywallScreenV2({ navigation }) {
  const { session } = React.useContext(AuthContext);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isModalPresented, setIsModalPresented] = React.useState(false);
  const [hasCheckedAccess, setHasCheckedAccess] = React.useState(false);
  const isMounted = React.useRef(true);
  const hasShownPaywall = React.useRef(false);

  const safeNavigateBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      setIsModalPresented(false);
      navigation.goBack();
    }
  }, [navigation]);

  const checkAccess = React.useCallback(async () => {
    if (!isMounted.current || hasCheckedAccess || hasShownPaywall.current) return;

    try {
      await Purchases.invalidateCustomerInfoCache();
      const customerInfo = await Purchases.getCustomerInfo();
      
      const validEntitlements = [
        'entitlement_individual',
        'entitlement_ahorro',
        'entitlement_empresarial',
        '100_tickets_mensuales'
      ];

      const hasValidEntitlement = validEntitlements.some(
        entitlement => customerInfo.entitlements.active[entitlement]
      );

      const isWhitelisted = session?.whitelisted_for_purchase === false;
      
      console.log('🔍 Access check:', {
        hasValidEntitlement,
        isWhitelisted,
        activeEntitlements: customerInfo.entitlements.active
      });

      setHasCheckedAccess(true);

      if (isMounted.current) {
        if (hasValidEntitlement || isWhitelisted) {
          console.log('✅ User has access - navigating back');
          safeNavigateBack();
        } else if (!hasShownPaywall.current) {
          console.log('🔒 No access - showing paywall');
          hasShownPaywall.current = true;
          showRevenueCatPaywall();
        }
      }
    } catch (error) {
      console.error('🚨 Error checking access:', error);
      setHasCheckedAccess(true);
      if (isMounted.current && !hasShownPaywall.current) {
        hasShownPaywall.current = true;
        showRevenueCatPaywall();
      }
    }
  }, [session, hasCheckedAccess, safeNavigateBack]);

  React.useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isPurchasing) return true;
      safeNavigateBack();
      return true;
    });
    return () => backHandler.remove();
  }, [isPurchasing, safeNavigateBack]);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      console.log('🧹 Cleaning up PaywallScreenV2');
      isMounted.current = false;
    };
  }, []);

  // Solo RevenueCatUI
  const showRevenueCatPaywall = () => {
    if (!isMounted.current) return;
    console.log('🔍 Presenting RevenueCatUI paywall...');
    setIsModalPresented(true);
    const presentPaywall = async () => {
      if (!isMounted.current) return;
      try {
        const result = await RevenueCatUI.presentPaywall();
        console.log('✅ Paywall result:', result);
        if (isMounted.current) {
          setIsModalPresented(false);
          safeNavigateBack();
        }
      } catch (error) {
        console.error('🚨 Error with RevenueCatUI paywall:', error);
        if (isMounted.current) {
          setIsModalPresented(false);
          safeNavigateBack();
        }
      }
    };
    InteractionManager.runAfterInteractions(presentPaywall);
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log('🚪 Cleaning up before navigation');
      setIsModalPresented(false);
    });
    return unsubscribe;
  }, [navigation]);

  // Mientras se chequea acceso, renderiza transparente
  if (hasCheckedAccess && !isModalPresented) {
    return null;
  }

  // Vista por defecto mientras se muestra el paywall
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}