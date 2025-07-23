import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {AuthContext} from './../../contexts/AuthContext';
import {
  DemandWarningAnnouncement,
  NotificationsAnnouncement,
  CSFAnnouncement,
  CSFRejectionAnnouncement,
  TeamsAnnouncement,
} from './../../components/AnnouncementBars';

import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AnnouncementBar(props) {
  // Rules for announcement priority:
  // 1. If no free trial/entitlements -> Show free trial announcement (highest priority)
  // 2. If last days of month -> Show high demand announcement
  // 3. If no CSF (or CSF rejected) -> Show CSF announcement
  // 4. If notifications not enabled -> Show notifications announcement
  // 5. If teams announcement not dismissed or dismissal date is older than a week -> Show teams announcement (lowest priority)
  
  const {session} = React.useContext(AuthContext);
  const {customerInfo} = props;

  // Force notifications to be considered as requested to disable that announcement
  const [notificationsPermissionsRequested, setNotificationsPermissionsRequested] = React.useState(true);
  const [teamsAnnouncementDismissed, setTeamsAnnouncementDismissed] = React.useState(false);

  const checkPermissions = async () => {
    try {
      // Notifications permissions check is skipped since we're setting it to true by default
      
      // Check if user has dismissed the teams announcement and when
      const teamsAnnouncementDismissedData = await AsyncStorage.getItem('TEAMS_ANNOUNCEMENT_DISMISSED_DATA');
      
      if (teamsAnnouncementDismissedData) {
        const dismissData = JSON.parse(teamsAnnouncementDismissedData);
        const dismissedDate = new Date(dismissData.timestamp);
        const currentDate = new Date();
        
        // Calculate difference in days
        const diffTime = currentDate.getTime() - dismissedDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // If it's been dismissed less than 7 days ago, consider it dismissed
        setTeamsAnnouncementDismissed(diffDays < 7);
      } else {
        setTeamsAnnouncementDismissed(false);
      }
    } catch (e) {
      console.error('Error checking permissions:', e);
    }
  };

  React.useEffect(() => {
    checkPermissions();
  }, []);

  const currentDate = new Date();
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const isLastTwoDaysOfMonth = currentDate.getDate() >= lastDayOfMonth - 2; // three days actually

  // Check CSF status
  const csf_pdf_url = props.csfPdfUrl;
  const csf_verified_status = session?.csf_verified_status || 'not_verified';
  const csfIsUploaded = !!csf_pdf_url;
  const csfIsRejected = csf_verified_status === 'rejected';

  // Check subscription status
  const hasActiveSubscription = customerInfo?.activeSubscriptions?.length > 0;
  const _userIsWhitelistedForPurchase = session?.whitelisted_for_purchase ?? false;

  const handleTeamsAnnouncementDismiss = async () => {
    try {
      // Save dismissal with timestamp
      const dismissData = {
        dismissed: true,
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('TEAMS_ANNOUNCEMENT_DISMISSED_DATA', JSON.stringify(dismissData));
      setTeamsAnnouncementDismissed(true);
    } catch (error) {
      console.error('Error saving teams announcement dismissed state:', error);
    }
  };

  // PRIORITY 1: Free trial announcement for non-subscribers
  // Comment out this condition to hide the "Empieza ya a facturar" announcement
  /* 
  if (!hasActiveSubscription && _userIsWhitelistedForPurchase) {
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('paywallScreenV2');
        }}
        style={{backgroundColor: 'white'}}>
        <View
          style={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderColor: 'rgb(91, 34,250)',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderStyle: 'solid',
            marginTop: -2,
            marginBottom: 6,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              backgroundColor: 'rgba(91, 34, 250,0.02)',
              paddingTop: 20,
              paddingBottom: 22,
            }}>
            <View style={{marginLeft: 15, marginRight: 11}}>
              <MaterialIcons
                name="verified-user"
                size={24}
                color="rgb(91, 34,250)"
              />
            </View>
            <View style={{flex: 1, paddingRight: 12}}>
              <Text
                style={{fontFamily: 'System', color: 'rgba(33,33,33,.9)'}}>
                <Text
                  style={{
                    fontWeight: '600',
                    color: 'rgb(91, 34,250)',
                    lineHeight: 18,
                  }}>
                  Empieza ya a facturar.
                </Text>{' '}
                Prueba gratis por 7 días nuestro servicio de facturación.
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  */

  // PRIORITY 2: End of month high demand warning
  if (isLastTwoDaysOfMonth) {
    return <DemandWarningAnnouncement />;
  }

  // PRIORITY 3a: CSF upload announcement
  if (!csfIsUploaded) {
    return (
      <CSFAnnouncement
        onPress={() => {
          props.navigation.navigate('CSFScreenExistingUser', {
            token: props.token,
            userId: props.userId,
          });
        }}
      />
    );
  }
  
  // PRIORITY 3b: CSF rejection announcement
  if (csfIsRejected) {
    return (
      <CSFRejectionAnnouncement
        onPress={() => {
          props.navigation.navigate('CSFScreenExistingUser', {
            token: props.token,
            userId: props.userId,
          });
        }}
      />
    );
  }

  // PRIORITY 4: Regular notifications announcement - Now disabled by default state

  // PRIORITY 5: Teams announcement (if not dismissed or dismissal was over a week ago)
  if (!teamsAnnouncementDismissed) {
    return (
      <TeamsAnnouncement onDismiss={handleTeamsAnnouncementDismiss} />
    );
  }

  // No announcements to show
  return null;
}