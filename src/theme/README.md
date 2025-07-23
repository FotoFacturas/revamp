# Sistema de Diseño FotoFacturas

## Introducción

Este sistema de diseño unifica todos los colores, tipografía, espaciado y otros elementos visuales de la aplicación FotoFacturas. Está basado en **Design Tokens** para garantizar consistencia y facilitar el mantenimiento.

## Estructura

```
src/theme/
├── tokens.js      # Design tokens (colores, tipografía, espaciado, etc.)
├── styles.js      # Estilos globales y componentes predefinidos
├── index.js       # Exportaciones del sistema
└── README.md      # Esta documentación
```

## Uso Básico

### Importar el sistema de diseño

```javascript
// Importar tokens específicos
import { colors, typography, spacing } from '../theme';

// Importar estilos predefinidos
import { globalStyles, appStyles } from '../theme/styles';

// Importar todo
import theme from '../theme';
```

### Colores

#### Paleta de colores principal

```javascript
// Colores primarios (morado de la marca)
colors.primary[500]  // #5B22FA - Color principal
colors.primary[600]  // #481ECC - Más oscuro
colors.primary[400]  // #A78BFA - Más claro

// Estados
colors.success[500]  // Verde para éxito
colors.warning[500]  // Amarillo para advertencias  
colors.error[500]    // Rojo para errores

// Grises para texto y backgrounds
colors.gray[900]     // Texto principal
colors.gray[600]     // Texto secundario
colors.gray[400]     // Texto terciario
colors.gray[100]     // Background claro
```

#### Colores semánticos

```javascript
// Textos
colors.text.primary     // #111827 - Texto principal
colors.text.secondary   // #374151 - Texto secundario
colors.text.tertiary    // #6B7280 - Texto terciario
colors.text.inverse     // #FFFFFF - Texto en fondos oscuros

// Backgrounds
colors.background.primary   // #FFFFFF - Fondo principal
colors.background.secondary // #F9FAFB - Fondo secundario
colors.background.tertiary  // #F3F4F6 - Fondo terciario

// Bordes
colors.border.light    // #E5E7EB - Borde claro
colors.border.medium   // #D1D5DB - Borde medio
colors.border.dark     // #9CA3AF - Borde oscuro
```

### Tipografía

#### Tamaños de fuente

```javascript
typography.fontSize.xs     // 12px
typography.fontSize.sm     // 14px
typography.fontSize.base   // 16px - Tamaño base
typography.fontSize.lg     // 18px
typography.fontSize.xl     // 20px
typography.fontSize['2xl'] // 24px
typography.fontSize['3xl'] // 30px
typography.fontSize['4xl'] // 36px
```

#### Pesos de fuente

```javascript
typography.fontWeight.normal    // 400
typography.fontWeight.medium    // 500
typography.fontWeight.semibold  // 600
typography.fontWeight.bold      // 700
```

#### Ejemplo de uso

```javascript
const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  }
});
```

### Espaciado

El espaciado usa una escala de 4px:

```javascript
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px - Espaciado base
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
```

#### Ejemplo de uso

```javascript
const styles = StyleSheet.create({
  container: {
    padding: spacing[4],        // 16px
    marginVertical: spacing[6], // 24px
  }
});
```

### Bordes redondeados

```javascript
borderRadius.sm   // 4px
borderRadius.base // 8px - Radio base
borderRadius.md   // 12px
borderRadius.lg   // 16px
borderRadius.xl   // 20px
borderRadius.full // 9999px - Completamente redondo
```

### Sombras

```javascript
shadows.sm    // Sombra pequeña
shadows.base  // Sombra base
shadows.md    // Sombra media
shadows.lg    // Sombra grande
```

## Estilos Predefinidos

### Estilos globales

```javascript
import { globalStyles } from '../theme/styles';

// Contenedores
globalStyles.container         // Container básico
globalStyles.containerPrimary  // Container con fondo primario

// Textos
globalStyles.h1  // Título principal
globalStyles.h2  // Título secundario
globalStyles.h3  // Subtítulo
globalStyles.textPrimary    // Texto principal
globalStyles.textSecondary  // Texto secundario

// Botones
globalStyles.buttonPrimary     // Botón principal
globalStyles.buttonSecondary   // Botón secundario

// Cards
globalStyles.card      // Card básico
globalStyles.cardTitle // Título de card
```

### Estilos específicos de la app

```javascript
import { appStyles } from '../theme/styles';

// Header de FotoFacturas
appStyles.fotofacturasHeader
appStyles.fotofacturasHeaderTitle

// Cards de facturas
appStyles.invoiceCard
appStyles.invoiceCardMerchant
appStyles.invoiceCardAmount

// Estados de facturas
appStyles.statusSuccess
appStyles.statusWarning
appStyles.statusError
```

## Funciones de utilidad

### Crear estilos de texto

```javascript
import { utils } from '../theme';

const titleStyle = utils.textStyle('2xl', 'bold', colors.text.primary);
// Equivale a:
// {
//   fontSize: 24,
//   fontWeight: '700',
//   color: '#111827',
//   lineHeight: 1.5
// }
```

### Espaciado rápido

```javascript
const containerStyle = {
  ...utils.paddingStyle(4, 4, 4, 4), // top, right, bottom, left
  ...utils.marginStyle(2, 0, 2, 0),
};
```

### Color con opacidad

```javascript
backgroundColor: utils.withOpacity(colors.primary[500], 0.1)
// Resultado: #5B22FA con 10% de opacidad
```

## Ejemplos Completos

### Card de factura

```javascript
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const InvoiceCard = ({ merchant, amount, date, status }) => (
  <View style={styles.card}>
    <Text style={styles.merchant}>{merchant}</Text>
    <Text style={styles.amount}>{amount}</Text>
    <Text style={styles.date}>{date}</Text>
    <View style={[styles.status, styles[`status${status}`]]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginVertical: spacing[2],
    ...shadows.base,
  },
  merchant: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  amount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  status: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusSuccess: {
    backgroundColor: colors.success[100],
  },
  statusWarning: {
    backgroundColor: colors.warning[100],
  },
  statusError: {
    backgroundColor: colors.error[100],
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
});
```

### Botón personalizado

```javascript
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const CustomButton = ({ title, onPress, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[styles.button, styles[`button${variant}`]]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, styles[`buttonText${variant}`]]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary[500],
  },
  buttonSecondary: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonTextPrimary: {
    color: colors.text.inverse,
  },
  buttonTextSecondary: {
    color: colors.text.primary,
  },
});
```

## Migración Gradual

Para migrar código existente:

1. **Importa el sistema de diseño**
2. **Reemplaza colores hardcodeados** con tokens
3. **Unifica tamaños de fuente** con la escala tipográfica
4. **Usa espaciado consistente** con los tokens de spacing
5. **Aplica bordes redondeados** uniformes

### Antes:
```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  }
});
```

### Después:
```javascript
import { colors, typography, spacing, borderRadius } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  }
});
```

## Beneficios

- ✅ **Consistencia visual** en toda la app
- ✅ **Mantenimiento fácil** - cambios centralizados
- ✅ **Escalabilidad** - fácil añadir nuevos componentes
- ✅ **Accesibilidad** - colores con contraste adecuado
- ✅ **Documentación** - sistema bien documentado
- ✅ **Performance** - estilos optimizados

## Próximos pasos

1. Migrar componentes restantes al sistema
2. Añadir modo oscuro
3. Implementar animaciones consistentes
4. Crear componentes de UI reutilizables 