import * as React from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';

// adaptar notificationBar a que tenga un background semitransparent azul
export const NotificationsAnnouncement = props => {
  return (
    <View style={{backgroundColor: 'white'}}>
      <TouchableOpacity
        onPress={props.onPress}
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: 'rgb(0, 122, 255)',
          borderWidth: 1,
          borderStyle: 'solid',
          marginTop: 2,
          marginLeft: 16,
          marginRight: 16,
          marginBottom: 18,
          borderRadius: 8,
          shadowColor: 'rgba(0, 122, 255, 0.6)', // IOS
          shadowOffset: {height: 1, width: 1}, // IOS
          shadowOpacity: 1, // IOS
          shadowRadius: 1, //IOS
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 122, 255,0.015)',
            paddingVertical: 16,
          }}>
          <View style={{marginLeft: 17, marginRight: 17}}>
            <MaterialCommunityIcon
              name="bell-ring"
              size={24}
              color="rgb(0,122,255)"
            />
          </View>
          <View style={{flex: 1, paddingRight: 16}}>
            <Text style={{fontFamily: 'System', color: 'rgba(33,33,33,.9)'}}>
              <Text style={{fontWeight: '600', color: 'rgb(0,122,255)'}}>
                Activa tus notificaciones.
              </Text>{' '}
              Te avisaremos cuando tus tickets estén facturados. 😃
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Anuncio de sube tu CSF Constancia de Situación Fiscal
export const CSFAnnouncement = props => {
  return (
    <View style={{backgroundColor: 'white'}}>
      <TouchableOpacity
        onPress={props.onPress}
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: 'rgb(91, 34, 250)',
          borderWidth: 1,
          borderStyle: 'solid',
          marginTop: 2,
          marginLeft: 16,
          marginRight: 16,
          marginBottom: 16,
          borderRadius: 8,
          shadowColor: 'rgba(91, 34, 250, 0.6)', // IOS
          shadowOffset: {height: 1, width: 1}, // IOS
          shadowOpacity: 1, // IOS
          shadowRadius: 1, //IOS
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: 'rgba(91, 34, 250,0.02)',
            paddingVertical: 16,
          }}>
          <View style={{marginLeft: 17, marginRight: 17}}>
            <MaterialCommunityIcon
              name="file-document"
              size={24}
              color="rgb(91, 34, 250)"
            />
          </View>
          <View style={{flex: 1, paddingRight: 16}}>
            <Text
              style={{
                fontFamily: 'System',
                color: 'rgba(33,33,33,.9)',
                lineHeight: 17,
              }}>
              <Text style={{fontWeight: '600', color: 'rgb(91, 34, 250)'}}>
                Sube tu CSF.
              </Text>{' '}
              La Constancia de Situación Fiscal es necesaria para facturar
              tickets.
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const CSFRejectionAnnouncement = props => {
  const primaryColor = 'rgb(215, 0, 64)';
  const secondaryColor = 'rgba(215, 0, 64,0.02)';
  const shadowColor = 'rgba(215, 0, 64,0.6)';

  return (
    <View style={{backgroundColor: 'white'}}>
      <TouchableOpacity
        onPress={props.onPress}
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: primaryColor,
          borderWidth: 1,
          borderStyle: 'solid',
          marginTop: 2,
          marginLeft: 16,
          marginRight: 16,
          marginBottom: 16,
          borderRadius: 8,
          shadowColor: shadowColor, // IOS
          shadowOffset: {height: 1, width: 1}, // IOS
          shadowOpacity: 1, // IOS
          shadowRadius: 1, //IOS
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: secondaryColor,
            paddingVertical: 16,
          }}>
          <View style={{marginLeft: 17, marginRight: 17}}>
            <MaterialCommunityIcon
              name="file-document"
              size={24}
              color={primaryColor}
            />
          </View>
          <View style={{flex: 1, paddingRight: 16}}>
            <Text
              style={{
                fontFamily: 'System',
                color: 'rgba(33,33,33,.9)',
                lineHeight: 17,
              }}>
              <Text style={{fontWeight: '600', color: primaryColor}}>
                Sube tu CSF nuevamente.
              </Text>{' '}
              La anterior constancia no se pudo validar.
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const DemandWarningAnnouncement = props => {
  return (
    <View style={{backgroundColor: 'white'}}>
      <View
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: 'rgb(227, 160,8)',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          marginTop: 0,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: 'rgba(227, 160,8,0.055)',
            paddingTop: 16,
            paddingBottom: 18,
          }}>
          <View style={{marginLeft: 12, marginRight: 17}}>
            <MaterialCommunityIcon
              name="alert"
              size={24}
              color="rgb(227, 160,8)"
            />
          </View>
          <View style={{flex: 1, paddingRight: 12}}>
            <Text style={{fontFamily: 'System', color: 'rgba(33,33,33,.9)'}}>
              <Text
                style={{
                  fontWeight: '600',
                  color: 'rgb(227, 160,8)',
                  lineHeight: 18,
                }}>
                Alta demanda.
              </Text>{' '}
              Recuerda que algunos comercios no facturan a tiempo los tickets en
              fin de mes.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Anuncio para equipos - múltiples usuarios con el mismo RFC
export const TeamsAnnouncement = props => {
  const primaryColor = 'rgb(0, 150, 136)'; // Teal color
  const secondaryColor = 'rgba(0, 150, 136, 0.02)';
  const shadowColor = 'rgba(0, 150, 136, 0.6)';

  const handlePress = () => {
    Linking.openURL(
      'https://api.whatsapp.com/send?phone=5215522613142&text=Hola%2C%20quisiera%20obtener%20m%C3%A1s%20informaci%C3%B3n%20para%20agregar%20cuentas%20al%20mismo%20RFC.'
    );
  };

  return (
    <View style={{backgroundColor: 'white'}}>
      <View
        style={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderColor: primaryColor,
          borderWidth: 1,
          borderStyle: 'solid',
          marginTop: 2,
          marginLeft: 16,
          marginRight: 16,
          marginBottom: 16,
          borderRadius: 8,
          shadowColor: shadowColor, // IOS
          shadowOffset: {height: 1, width: 1}, // IOS
          shadowOpacity: 1, // IOS
          shadowRadius: 1, //IOS
          position: 'relative',
        }}>
        {/* Close button */}
        <TouchableOpacity
          onPress={props.onDismiss}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialCommunityIcon
            name="close"
            size={16}
            color={primaryColor}
          />
        </TouchableOpacity>

        {/* Main content (touchable) */}
        <TouchableOpacity
          onPress={handlePress}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: secondaryColor,
            paddingVertical: 16,
          }}>
          <View style={{marginLeft: 17, marginRight: 17}}>
            <MaterialCommunityIcon
              name="account-group"
              size={24}
              color={primaryColor}
            />
          </View>
          <View style={{flex: 1, paddingRight: 28}}>
            <Text
              style={{
                fontFamily: 'System',
                color: 'rgba(33,33,33,.9)',
                lineHeight: 17,
              }}>
              <Text style={{fontWeight: '600', color: primaryColor}}>
                Planes para equipos.
              </Text>{' '}
              Tenemos soluciones para múltiples usuarios con el mismo RFC. ¡Da click aquí!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};