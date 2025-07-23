import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';

/**
 * Progress steps component for showing the current step in a multi-step flow
 * @param {Object} props
 * @param {number} props.currentStep - Current step (1-3)
 */
const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Correo' },
    { id: 2, label: 'Celular' },
    { id: 3, label: 'Datos Fiscales' }
  ];
  
  return (
    <View style={styles.progressStepsContainer}>
      {steps.map((step) => (
        <View key={step.id} style={styles.progressStep}>
          <View
            style={[
              styles.progressCircle, 
              step.id === currentStep ? styles.activeStep : 
              step.id < currentStep ? styles.completedStep : styles.inactiveStep
            ]} 
          >
            {step.id < currentStep && (
              <Icon name="check" size={12} color="#FFFFFF" />
            )}
          </View>
          <Text style={[
            styles.progressText,
            step.id === currentStep ? styles.activeStepText : {}
          ]}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0, // Sin padding horizontal adicional
    marginBottom: 16, // Espaciado antes del contenido principal
    marginTop: 0,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#6023D1',
  },
  completedStep: {
    backgroundColor: '#8F6BD9',
  },
  inactiveStep: {
    backgroundColor: '#E0E0E0',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  activeStepText: {
    color: '#6023D1',
    fontWeight: '600',
  },
});

export default ProgressSteps;