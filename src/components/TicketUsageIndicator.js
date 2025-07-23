// src/components/TicketUsageIndicator.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import amplitudeService from '../utils/analytics/amplitude';

/**
 * Componente que muestra el uso de tickets mensuales
 */
const TicketUsageIndicator = ({
  currentCount,
  maxCount,
  userId,
  currentPlan,
  onUpgradePress,
  forceShow = false
}) => {
  // Calculate usage percentage

  // Calcular porcentaje de uso
  const usagePercentage = maxCount > 0 ? Math.min((currentCount / maxCount) * 100, 100) : 0;

  // Determinar color según uso
  const progressColor = usagePercentage > 80 ? '#FF6B6B' : // Rojo
    usagePercentage > 50 ? '#FFD166' : // Amarillo
      '#6023D1'; // Morado normal

  // Manejar click en upgrade
  const handleUpgradePress = () => {
    // Registrar en Amplitude
    amplitudeService.trackEvent('Upgrade_Button_Tapped', {
      user_id: userId,
      current_plan: currentPlan,
      usage_percentage: usagePercentage,
      current_count: currentCount,
      max_count: maxCount
    });

    // Llamar a la función pasada como prop
    if (onUpgradePress && typeof onUpgradePress === 'function') {
      onUpgradePress();
    }
  };

  // No mostrar nada si no hay límite
  if (!maxCount) {
    return null;
  }
  
  // Si forceShow es true, siempre mostrar (para AccountUsageScreen)
  // Si forceShow es false, solo mostrar si uso >= 80% (para MainScreen)
  const shouldShow = forceShow || usagePercentage >= 80;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="file-text" size={16} color="#6023D1" style={styles.icon} />
          <Text style={styles.title}>Uso de tickets mensual</Text>
        </View>
        <Text style={styles.count}>
          <Text style={[styles.countHighlight, { color: progressColor }]}>{currentCount}</Text>
          {` de ${maxCount}`}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${usagePercentage}%`, backgroundColor: progressColor }
            ]}
          />
        </View>

        {/* Mostrar texto descriptivo según el uso */}
        <Text style={styles.usageText}>
          {usagePercentage > 80
            ? 'Estás cerca del límite de tu plan'
            : usagePercentage > 50
              ? 'Uso moderado de tu plan'
              : 'Uso bajo de tu plan'}
        </Text>
      </View>

      {/* Mostrar botón de upgrade si el uso es alto */}
      {usagePercentage > 80 && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgradePress}
        >
          <Text style={styles.upgradeButtonText}>Ampliar mi plan</Text>
          <Icon name="arrow-right" size={16} color="white" style={styles.upgradeIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  countHighlight: {
    fontWeight: '700',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  upgradeButton: {
    backgroundColor: '#6023D1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  upgradeIcon: {
    marginLeft: 8,
  }
});

export default TicketUsageIndicator;