import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function HelpScreen(props) {
  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: 'Centro de ayuda',
    });
  }, [props.navigation]);
  
  const contactOptions = [
    {
      id: 'whatsapp',
      icon: 'message-circle',
      title: 'WhatsApp',
      value: '+52 55 2261 3142',
      onPress: () => Linking.openURL('https://wa.me/5522613142'),
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Correo Electrónico',
      value: 'hola@fotofacturas.ai',
      onPress: () => Linking.openURL('mailto:hola@fotofacturas.ai'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.supportSection}>
          <View style={styles.supportImageContainer}>
            <Image
              style={styles.supportImage}
              source={require('./../assets/support.png')}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Contacto</Text>
          
          <View style={styles.contactOptions}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={option.onPress}
              >
                <View style={styles.contactIconContainer}>
                  <Icon name={option.icon} size={20} color={colors?.text?.secondary || "#374151"} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactValue}>{option.value}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors?.text?.tertiary || "#6B7280"} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursTitle}>Horarios de Atención</Text>
            <Text style={styles.hoursValue}>Lunes a Viernes 09:00 a 18:00</Text>
          </View>
        </View>
        
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL('mailto:hola@fotofacturas.ai')}>
            <Text style={styles.supportButtonText}>Abrir Ticket de Soporte</Text>
          </TouchableOpacity>
        </ScrollView>
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
  supportSection: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  supportImage: {
    height: 160,
    width: 160,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: colors?.text?.primary || '#111827',
  },
  contactOptions: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors?.gray?.[50] || '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors?.text?.primary || '#111827',
  },
  contactValue: {
    fontSize: 14,
    color: colors?.text?.secondary || '#374151',
    marginTop: 2,
  },
  hoursContainer: {
    backgroundColor: colors?.gray?.[50] || '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.text?.primary || '#111827',
    marginBottom: 8,
  },
  hoursValue: {
    fontSize: 14,
    color: colors?.text?.secondary || '#374151',
  },
  supportButton: {
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors?.text?.primary || '#111827',
  },
});