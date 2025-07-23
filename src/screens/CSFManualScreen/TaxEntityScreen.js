import * as React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import { colors, typography, spacing, borderRadius } from '../../theme';

const OptionItem = ({ title, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.optionItem} 
      onPress={() => onPress(title)}
      activeOpacity={0.7}>
      <Text style={styles.optionText}>{title}</Text>
      <Icon name="chevron-right" size={14} color={colors?.text?.tertiary || '#9CA3AF'} />
    </TouchableOpacity>
  );
};

export default function TaxEntityScreen({ navigation, route }) {
  const _onSelectedItem = route.params.onSelectedItem || (() => undefined);

  const onSelectedItem = (selectedItem) => {
    _onSelectedItem(selectedItem);
    navigation.goBack();
  };
  
  // Hide the default navigation header to avoid duplicate back buttons
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // All tax entity options in a single list
  const taxEntityOptions = [
    "Personas Físicas con Actividad Empresarial y Profesional",
    "General de Ley Personas Morales",
    "Régimen Incorporacion Fiscal (RIF)",
    "Régimen Sueldos y Salarios",
    "Régimen Simplificado de Confianza",
    "Arrendamiento",
    "Demás ingresos",
    "Ingresos por Dividendos (socios y accionistas)",
    "Ingresos por Intereses",
    "Ingresos por obtención de premios",
    "Sin obligaciones fiscales",
    "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
    "Personas Morales con Fines no Lucrativos",
    "Sociedades Cooperativas de Producción que optan por Diferir sus Ingresos",
    "Opcional para Grupos de Sociedades",
    "Consolidación",
    "Coordinados",
    "Hidrocarburos",
    "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
    "Régimen de Enajenación o Adquisición de Bienes",
    "De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales",
    "Residentes en el Extranjero sin Establecimiento Permanente en México",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors?.background?.primary || '#FAFAFA'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color={colors?.text?.primary || '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar Régimen</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.optionsContainer}>
          {taxEntityOptions.map((option, index) => (
            <OptionItem
              key={`option-${index}`}
              title={option}
              onPress={onSelectedItem}
            />
          ))}
        </View>
        
        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background?.secondary || '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing?.md || 16,
    paddingVertical: spacing?.xs || 12,
    backgroundColor: colors?.background?.primary || '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: colors?.border?.light || '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing?.md || 16,
    paddingHorizontal: spacing?.md || 16,
  },
  optionsContainer: {
    backgroundColor: colors?.background?.primary || '#FAFAFA',
    borderRadius: borderRadius?.md || 8,
    shadowColor: colors?.shadow?.primary || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing?.md || 16,
    paddingHorizontal: spacing?.md || 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors?.border?.light || '#E5E7EB',
  },
  optionText: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.primary || '#111827',
    flex: 1,
  },
  bottomPadding: {
    height: spacing?.['2xl'] || 40,
  },
});