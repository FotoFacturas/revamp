// StatusComponents.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Status Header Component
export const StatusHeader = ({ statusText, statusColor }) => (
  <View style={[styles.statusBar, { backgroundColor: statusColor }]}>
    <Text style={styles.statusText}>{statusText}</Text>
  </View>
);

// Title Component
export const StatusTitle = ({ title, icon }) => (
  <View style={styles.titleContainer}>
    {icon && <View style={styles.iconContainer}>{icon}</View>}
    <Text style={styles.titleText}>{title}</Text>
  </View>
);

// Content Container Component
export const StatusContent = ({ children }) => (
  <View style={styles.contentContainer}>
    {children}
  </View>
);

// Info Card Component
export const InfoCard = ({ children }) => (
  <View style={styles.infoCard}>
    {children}
  </View>
);

// Info Button Component
export const InfoButton = ({ onPress }) => (
  <TouchableOpacity style={styles.infoButton} onPress={onPress}>
    <Text style={styles.infoButtonText}>Más información</Text>
  </TouchableOpacity>
);

// Delete Button Component
export const DeleteButton = ({ onPress, label = "Eliminar ticket" }) => (
  <TouchableOpacity style={styles.deleteButton} onPress={onPress}>
    <Text style={styles.deleteButtonText}>{label}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  statusBar: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  iconContainer: {
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Color más oscuro para mejor visibilidad
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
  },
  infoButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  infoButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
  },
});