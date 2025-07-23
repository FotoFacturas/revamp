import * as React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import * as API from './../lib/api';
import {AuthContext} from './../contexts/AuthContext';
import amplitudeService from '../utils/analytics/amplitude';

//agregar cuando agreguemos firebase
//import {Notifications} from 'react-native-notifications';

export default function RequestNotificationsScreen(props) {
  const screenHeight = Math.round(Dimensions.get('window').height);

  const mounted = React.useRef(false);
  const hasNavigated = React.useRef(false);
  const {session} = React.useContext(AuthContext);

  const token = session.token;
  // get onScreenExit from navigation props
  const onScreenExit = props.route.params.onScreenExit;

  // Track screen view on mount
  React.useEffect(() => {
    amplitudeService.trackEvent('Notification_Request_Screen_Viewed');
    
    mounted.current = true;

    Notifications.events().registerRemoteNotificationsRegistered(
      async event => {
        // TODO: Send this token to the server
        console.log(
          'Receiving Device Token on RequestNotificationScreen',
          event.deviceToken,
        );
        
        // Track successful registration
        amplitudeService.trackEvent('Push_Notification_Registered', {
          token_length: event.deviceToken ? event.deviceToken.length : 0
        });
        
        await API.updateDevicePushToken(token, event.deviceToken);
        sendToMainScren(true);
      },
    );

    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      event => {
        console.log('Error Receiving Device Token', event);
        
        // Track failed registration
        amplitudeService.trackEvent('Push_Notification_Registration_Failed', {
          error: event.message || 'Unknown error'
        });
        
        sendToMainScren();
      },
    );

    return () => {
      mounted.current = false;
    };
  }, []);

  const isNotificationsPermissionsRequested = async () => {
    var notificationsPermissionsRequested = false;
    try {
      const _notificationsPermissionsRequested = await AsyncStorage.getItem(
        'NOTIFICATIONS_PERMISSIONS_REQUESTED',
      );
      notificationsPermissionsRequested = JSON.parse(
        _notificationsPermissionsRequested || false,
      );
    } catch (e) {
      notificationsPermissionsRequested = false;
    }
    return notificationsPermissionsRequested;
  };

  const setNotificationsPermissionsRequested = async () => {
    try {
      await AsyncStorage.setItem(
        'NOTIFICATIONS_PERMISSIONS_REQUESTED',
        JSON.stringify(true),
      );
    } catch (e) {
      console.warn('savingTicket error: ', e);
      return false;
    }
    return true;
  };

  // ok basically if press the button
  // register that we asked for permission
  //, call for actual notification
  // go to the main screen
  // if the press the other button
  // go to the main screen
  const requestPermissions = async () => {
    // Track permission request button tapped
    amplitudeService.trackEvent('Push_Permission_Request_Button_Tapped');
    
    // don't request permissions twice
    if (await isNotificationsPermissionsRequested()) {
      amplitudeService.trackEvent('Push_Permission_Already_Requested');
      sendToMainScren(true);
      return;
    }

    // Register that user requested notifications
    await setNotificationsPermissionsRequested();

    // Register a callback in case "registerRemoteNotificationsRegistered" notification doesn't get fired
    setTimeout(async () => {
      // Independently if user accepted or declined, force send to main screen after 6 seconds
      if (hasNavigated.current === false) {
        amplitudeService.trackEvent('Push_Permission_Request_Timeout');
        sendToMainScren(true);
      }
    }, 6 * 1000);

    // OS level notifications request
    Notifications.registerRemoteNotifications();
  };

  const sendToMainScren = (requested = false) => {
    // this makes sure we only pop once, either by
    // - the forced timer
    // - the notfications event handler
    // - user clicking "Ir a pantalla principal"
    if (mounted.current) {
      if (hasNavigated.current === false) {
        hasNavigated.current = true;
        
        // Track navigation action
        amplitudeService.trackEvent('Notification_Screen_Exit', {
          requested: requested
        });
        
        requested && onScreenExit && onScreenExit();
        props.navigation.pop(1);
      }
    }
  };

  return (
    <View
      style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          paddingHorizontal: 32,
          paddingTop: 32,
        }}>
        <MaterialCommunityIcon
          name="bell-ring-outline"
          size={56}
          color="rgba(96, 35, 209, 1)"
        />
        <Text
          style={{
            textAlign: 'left',
            fontSize: 27,
            fontWeight: '600',
            marginTop: 24,
          }}>
          ¿Activar las
        </Text>
        <Text
          style={{
            textAlign: 'left',
            fontSize: 27,
            fontWeight: '600',
            marginTop: 2,
          }}>
          notificaciones?
        </Text>
        <Text style={{textAlign: 'left', fontSize: 17, marginTop: 24}}>
          No te pierdas mensajes importantes
        </Text>
        <Text style={{textAlign: 'left', fontSize: 17, marginTop: 2}}>
          como detalles de tu factura.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Sí. Activar Notificaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            amplitudeService.trackEvent('Push_Permission_Later_Selected');
            sendToMainScren(false);
          }}
          style={[styles.buttonSecondary, {marginTop: 24}]}>
          <Text style={styles.buttonTextSecondary}>Después</Text>
        </TouchableOpacity>
        
        {/* Add explanation of benefits */}
        <View style={{marginTop: 32, paddingHorizontal: 8}}>
          <Text style={{fontSize: 15, fontWeight: '600', color: '#333'}}>
            Beneficios de las notificaciones:
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 12}}>
            <MaterialCommunityIcon name="check-circle" size={20} color="#6023D1" />
            <Text style={{marginLeft: 8, fontSize: 14}}>
              Recibe alertas cuando tus facturas estén listas
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
            <MaterialCommunityIcon name="check-circle" size={20} color="#6023D1" />
            <Text style={{marginLeft: 8, fontSize: 14}}>
              Mantente informado sobre el estado de tus facturas
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
            <MaterialCommunityIcon name="check-circle" size={20} color="#6023D1" />
            <Text style={{marginLeft: 8, fontSize: 14}}>
              Recibe recordatorios para facturar antes del fin de mes
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(96, 35, 209, 1)',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 28,
    paddingRight: 28,
    borderRadius: 8,
    marginTop: 28,
  },
  buttonSecondary: {
    backgroundColor: 'rgb(242,242,242)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(96, 35, 209, 1)',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 28,
    paddingRight: 28,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'white',
  },
  buttonTextSecondary: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'rgba(96, 35, 209, 1)',
  },
});