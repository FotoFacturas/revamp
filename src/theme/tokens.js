/**
 * Design Tokens para FotoFacturas
 * Sistema unificado de colores, tipografía, espaciado y otros elementos de diseño
 */

// ===== COLORES =====
export const colors = {
  // Colores primarios
  primary: {
    50: '#F5F2FF',
    100: '#EDE9FE', 
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#5B22FA', // Color principal de la marca
    600: '#481ECC',
    700: '#3B1A99',
    800: '#2E1366',
    900: '#1E0D44',
  },

  // Colores secundarios (para acentos y estados)
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Estados
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Verde para éxito
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Amarillo para advertencias
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Rojo para errores
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Grises (para textos y backgrounds)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Colores base
  white: '#FFFFFF',
  black: '#000000',
  
  // Colores de la app (compatibilidad con código existente)
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
};

// ===== TIPOGRAFÍA =====
export const typography = {
  // Familias de fuentes
  fontFamily: {
    primary: 'System', // Usa la fuente del sistema
    mono: 'Menlo, Monaco, Consolas, monospace',
  },

  // Tamaños de fuente
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Pesos de fuente
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Altura de línea
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Espaciado de letras
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
};

// ===== ESPACIADO =====
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// ===== RADIOS DE BORDE =====
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ===== SOMBRAS =====
export const shadows = {
  none: 'none',
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ===== OPACIDAD =====
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

// ===== ESTILOS DE COMPONENTES PREDEFINIDOS =====
// Nota: Los estilos de componentes se definen como funciones para evitar referencias circulares
export const componentStyles = {
  // Función para obtener estilos de botón
  getButtonStyles: () => ({
    primary: {
      backgroundColor: '#5B22FA',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    text: {
      primary: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
      },
      secondary: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
      },
    },
  }),

  // Función para obtener estilos de card
  getCardStyles: () => ({
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: '#374151',
      marginBottom: 12,
    },
  }),

  // Función para obtener estilos de input
  getInputStyles: () => ({
    container: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: '#FFFFFF',
    },
    text: {
      fontSize: 16,
      color: '#111827',
    },
    placeholder: {
      color: '#6B7280',
    },
    focused: {
      borderColor: '#5B22FA',
    },
    error: {
      borderColor: '#EF4444',
    },
  }),

  // Función para obtener estilos de header
  getHeaderStyles: () => ({
    container: {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      letterSpacing: -0.025,
    },
    subtitle: {
      fontSize: 16,
      color: '#374151',
    },
  }),
};

// ===== UTILIDADES =====
export const utils = {
  // Función para obtener color con opacidad
  withOpacity: (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  
  // Función para crear estilos de texto consistentes
  textStyle: (size, weight = 'normal', textColor = null) => {
    const fontSize = {
      xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48
    };
    const fontWeight = {
      thin: '100', extralight: '200', light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900'
    };
    return {
      fontSize: fontSize[size] || 16,
      fontWeight: fontWeight[weight] || '400',
      color: textColor || '#111827',
      lineHeight: 1.5,
    };
  },

  // Función para crear espaciado consistente
  marginStyle: (top = 0, right = 0, bottom = 0, left = 0) => {
    const spacingMap = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128];
    return {
      marginTop: spacingMap[top] || 0,
      marginRight: spacingMap[right] || 0,
      marginBottom: spacingMap[bottom] || 0,
      marginLeft: spacingMap[left] || 0,
    };
  },

  paddingStyle: (top = 0, right = 0, bottom = 0, left = 0) => {
    const spacingMap = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128];
    return {
      paddingTop: spacingMap[top] || 0,
      paddingRight: spacingMap[right] || 0,
      paddingBottom: spacingMap[bottom] || 0,
      paddingLeft: spacingMap[left] || 0,
    };
  },
};

// Exportar todo como default también
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  opacity,
  componentStyles,
  utils,
}; 