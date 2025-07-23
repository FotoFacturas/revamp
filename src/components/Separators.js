import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * ItemSeparator - Separador entre items de lista
 */
export function ItemSeparator({ style, ...props }) {
  return <View style={[styles.itemSeparator, style]} {...props} />;
}

/**
 * SectionSeparator - Separador entre secciones
 */
export function SectionSeparator({ style, ...props }) {
  return <View style={[styles.sectionSeparator, style]} {...props} />;
}

/**
 * LineSeparator - Línea separadora simple
 */
export function LineSeparator({ style, color = colors.border.light, ...props }) {
  return (
    <View 
      style={[styles.lineSeparator, { backgroundColor: color }, style]} 
      {...props} 
    />
  );
}

/**
 * SpaceSeparator - Separador de espacio sin línea
 */
export function SpaceSeparator({ height = spacing[4], style, ...props }) {
  return (
    <View 
      style={[{ height }, style]} 
      {...props} 
    />
  );
}

/**
 * CardSeparator - Separador para tarjetas con padding
 */
export function CardSeparator({ style, ...props }) {
  return <View style={[styles.cardSeparator, style]} {...props} />;
}

const styles = StyleSheet.create({
  // Separador estándar entre items de lista
  itemSeparator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4], // 16px - alineado con el contenido
  },
  
  // Separador entre secciones con más espacio
  sectionSeparator: {
    height: spacing[6], // 24px
    backgroundColor: colors.background.secondary,
  },
  
  // Línea separadora simple
  lineSeparator: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  
  // Separador para tarjetas
  cardSeparator: {
    height: spacing[3], // 12px
    backgroundColor: 'transparent',
  },
});

export default {
  ItemSeparator,
  SectionSeparator,
  LineSeparator,
  SpaceSeparator,
  CardSeparator,
}; 