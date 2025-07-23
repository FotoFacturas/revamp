import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing, shadows } from '../theme';

/**
 * StandardLayout - Componente base para layouts consistentes
 * 
 * Props:
 * - children: Contenido del layout
 * - scrollable: Si el contenido debe ser scrolleable (default: false)
 * - padding: Tipo de padding ('none', 'small', 'medium', 'large') (default: 'medium')
 * - backgroundColor: Color de fondo (default: colors.background.primary)
 * - safeArea: Si debe usar SafeAreaView (default: true)
 * - edges: Edges para SafeAreaView (default: ['top', 'bottom'])
 */
export default function StandardLayout({
  children,
  scrollable = false,
  padding = 'medium',
  backgroundColor = colors.background.primary,
  safeArea = true,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
  ...props
}) {
  // Determinar el padding basado en el prop
  const paddingStyle = React.useMemo(() => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: spacing[2] }; // 8px
      case 'medium':
        return { padding: spacing[4] }; // 16px
      case 'large':
        return { padding: spacing[6] }; // 24px
      default:
        return { padding: spacing[4] };
    }
  }, [padding]);

  // Contenido base
  const content = (
    <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
      {children}
    </View>
  );

  // Si es scrollable, envolver en ScrollView
  const scrollableContent = scrollable ? (
    <ScrollView
      style={[styles.scrollView, { backgroundColor }]}
      contentContainerStyle={[paddingStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  ) : content;

  // Si debe usar SafeAreaView, envolver
  if (safeArea) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
        {scrollableContent}
      </SafeAreaView>
    );
  }

  return scrollableContent;
}

/**
 * CardLayout - Layout para tarjetas y contenedores
 */
export function CardLayout({ children, style, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * ListLayout - Layout para listas con separadores
 */
export function ListLayout({ children, style, ...props }) {
  return (
    <View style={[styles.list, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * CenteredLayout - Layout centrado verticalmente
 */
export function CenteredLayout({ children, style, ...props }) {
  return (
    <View style={[styles.centered, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * HeaderLayout - Layout para headers consistentes
 */
export function HeaderLayout({ children, style, ...props }) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * SectionLayout - Layout para secciones con título
 */
export function SectionLayout({ children, style, ...props }) {
  return (
    <View style={[styles.section, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout base
  safeArea: {
    flex: 1,
  },
  
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Card layout
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing[4],
    marginVertical: spacing[2],
    ...shadows.sm,
  },
  
  // List layout
  list: {
    backgroundColor: colors.background.primary,
  },
  
  // Centered layout
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  // Section layout
  section: {
    marginBottom: spacing[6],
  },
});

// Exportar layouts adicionales
export {
  StandardLayout,
  CardLayout,
  ListLayout,
  CenteredLayout,
  HeaderLayout,
  SectionLayout,
}; 