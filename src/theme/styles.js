/**
 * Estilos globales usando Design Tokens
 * Estilos reutilizables para componentes comunes de FotoFacturas
 */

import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './tokens';
// TODO: Fix componentStyles usage - temporarily commented out
// import { colors, typography, spacing, borderRadius, shadows, componentStyles } from './tokens';

// ===== ESTILOS GLOBALES =====
export const globalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  containerPrimary: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Headers
  header: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },

  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },

  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },

  // Cards
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.sm,
  },

  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },

  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },

  // Botones
  buttonPrimary: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },

  buttonSecondary: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  buttonTextPrimary: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },

  buttonTextSecondary: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
  },

  inputText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  inputFocused: {
    borderColor: colors.primary[500],
  },

  inputError: {
    borderColor: colors.error[500],
  },

  // Textos
  textPrimary: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal,
  },

  textSecondary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal,
  },

  textTertiary: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.normal,
  },

  // Títulos
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },

  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },

  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.snug,
  },

  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.snug,
  },

  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal,
  },

  h6: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.normal,
  },

  // Estados
  textSuccess: {
    color: colors.success[600],
  },

  textWarning: {
    color: colors.warning[600],
  },

  textError: {
    color: colors.error[600],
  },

  // Separadores
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },

  dividerThick: {
    height: 1,
    backgroundColor: colors.border.medium,
    marginVertical: spacing[6],
  },

  // Espaciado común
  marginVerticalSm: {
    marginVertical: spacing[2],
  },

  marginVerticalMd: {
    marginVertical: spacing[4],
  },

  marginVerticalLg: {
    marginVertical: spacing[6],
  },

  marginHorizontalSm: {
    marginHorizontal: spacing[2],
  },

  marginHorizontalMd: {
    marginHorizontal: spacing[4],
  },

  marginHorizontalLg: {
    marginHorizontal: spacing[6],
  },

  paddingVerticalSm: {
    paddingVertical: spacing[2],
  },

  paddingVerticalMd: {
    paddingVertical: spacing[4],
  },

  paddingVerticalLg: {
    paddingVertical: spacing[6],
  },

  paddingHorizontalSm: {
    paddingHorizontal: spacing[2],
  },

  paddingHorizontalMd: {
    paddingHorizontal: spacing[4],
  },

  paddingHorizontalLg: {
    paddingHorizontal: spacing[6],
  },

  // Centrado
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerHorizontal: {
    alignItems: 'center',
  },

  centerVertical: {
    justifyContent: 'center',
  },

  // Flex
  flex1: {
    flex: 1,
  },

  flexRow: {
    flexDirection: 'row',
  },

  flexColumn: {
    flexDirection: 'column',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  spaceAround: {
    justifyContent: 'space-around',
  },

  spaceEvenly: {
    justifyContent: 'space-evenly',
  },

  // Bordes redondeados
  roundedSm: {
    borderRadius: borderRadius.sm,
  },

  rounded: {
    borderRadius: borderRadius.base,
  },

  roundedMd: {
    borderRadius: borderRadius.md,
  },

  roundedLg: {
    borderRadius: borderRadius.lg,
  },

  roundedXl: {
    borderRadius: borderRadius.xl,
  },

  roundedFull: {
    borderRadius: borderRadius.full,
  },

  // Sombras
  shadowSm: {
    ...shadows.sm,
  },

  shadow: {
    ...shadows.base,
  },

  shadowMd: {
    ...shadows.md,
  },

  shadowLg: {
    ...shadows.lg,
  },

  shadowXl: {
    ...shadows.xl,
  },
});

// ===== ESTILOS ESPECÍFICOS DE LA APP =====
export const appStyles = StyleSheet.create({
  // Header específico de FotoFacturas
  fotofacturasHeader: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  fotofacturasHeaderTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Botón flotante
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  // Card de factura
  invoiceCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    ...shadows.base,
  },

  invoiceCardMerchant: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  invoiceCardAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  invoiceCardDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  // Estados de factura
  statusProcessing: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  statusSuccess: {
    backgroundColor: colors.success[100],
    color: colors.success[700],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  statusWarning: {
    backgroundColor: colors.warning[100],
    color: colors.warning[700],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  statusError: {
    backgroundColor: colors.error[100],
    color: colors.error[700],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
  },

  emptyStateImage: {
    width: '80%',
    height: 200,
    marginBottom: spacing[6],
    opacity: 0.6,
  },

  emptyStateTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },

  emptyStateDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing[6],
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },

  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },

  // Form styles
  formContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },

  formGroup: {
    marginBottom: spacing[4],
  },

  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },

  formHelperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },

  formErrorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error[600],
    marginTop: spacing[1],
  },

  // Tab bar styles
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: spacing[2],
    ...shadows.lg,
  },

  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },

  tabBarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[1],
  },

  tabBarLabelActive: {
    color: colors.primary[500],
  },

  tabBarLabelInactive: {
    color: colors.text.tertiary,
  },
});

// Exportar estilos por defecto
export default {
  ...globalStyles,
  ...appStyles,
}; 