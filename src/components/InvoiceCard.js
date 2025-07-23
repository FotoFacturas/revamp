import * as React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Feather';
import Moment from 'react-moment';
import {FasterImageView} from '@candlefinance/faster-image';
import { colors, typography, spacing } from '../theme';

// Component optimized: removed problematic lineHeight calculations that caused text invisibility

// Helper function to capitalize merchant names
const capitalizeText = (text) => {
  if (!text) return '';
  
  // Handle ticket numbers differently
  if (text.toLowerCase().includes('ticket en espera')) {
    const parts = text.split('#');
    if (parts.length === 2) {
      return `Ticket en espera #${parts[1]}`;
    }
    return text;
  }
  
  // Capitalize first letter of each word
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function InvoiceCard(props) {
  const statusCopy = React.useMemo(() => {
    switch (props.status) {
      case 'waiting':
        return 'Procesando';
      case 'processing':
        return 'Procesando';
      case 'illegible':
        return 'Ilegible';
      case 'awaiting_merchant':
        return 'Solicitada al comercio';
      case 'awaiting':
        return 'Solicitada al comercio';
      case 'unsignable_merchant_unanswered':
        return 'Infacturable';
      case 'unsignable_merchant_systemless':
        return 'Infacturable';
      case 'unsignable_merchant_expired':
        return 'Infacturable';
      case 'unsignable_merchant_error':
        return 'Infacturable';
      case 'unsignable':
        return 'Infacturable';
      case 'signed':
        return 'Facturado';
      case 'signed_no_files':
        return 'Facturado S/A';
      default:
        return 'Procesando';
    }
  }, [props.status]);

  const statusColor = React.useMemo(() => {
    const processingColor = colors?.gray?.[500] || '#6B7280'; // gray-500
    const unsignableColor = colors?.error?.[500] || '#EF4444'; // red-500  
    const signedColor = colors?.success?.[500] || '#10B981'; // green-500
    const warningColor = colors?.warning?.[500] || '#F59E0B'; // yellow-500

    let _statusColor = processingColor;

    switch (props.status) {
      case 'waiting':
        _statusColor = processingColor;
        break;
      case 'processing':
        _statusColor = processingColor;
        break;
      case 'illegible':
        _statusColor = unsignableColor;
        break;
      case 'awaiting_merchant':
        _statusColor = warningColor;
        break;
      case 'awaiting':
        _statusColor = warningColor;
        break;
      case 'unsignable_merchant_unanswered':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_systemless':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_expired':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_error':
        _statusColor = unsignableColor;
        break;
      case 'unsignable':
        _statusColor = unsignableColor;
        break;
      case 'signed':
        _statusColor = signedColor;
        break;
      case 'signed_no_files':
        _statusColor = signedColor;
        break;
    }

    return _statusColor;
  }, [props.status]);

  // Get merchant name and capitalize it
  const merchantRaw = props.merchant
    ? props.merchant
    : `Ticket en espera #${props.invoiceID}`;
  
  const merchant = capitalizeText(merchantRaw);
  const total = props.total ? `$${props.total}` : '';

  return (
    <TouchableOpacity
      onPress={() => (props.onPress ? props.onPress() : null)}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* Avatar container with consistent sizing */}
      <View style={styles.avatarContainer}>
          <FasterImageView
          style={styles.avatar}
            source={{
              resizeMode: 'cover',
              transitionDuration: 0.3,
              showActivityIndicator: true,
              url: props.scanURL,
            }}
          />
        </View>

      {/* Main content area with proper flex structure */}
      <View style={styles.contentContainer}>
        {/* Primary line: Merchant name + Amount */}
        <View style={styles.primaryRow}>
              <Text 
            style={styles.merchantName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
                {merchant}
              </Text>
          <Text style={styles.amount}>{total}</Text>
            </View>

        {/* Secondary line: Status + Date with consistent spacing */}
        <View style={styles.secondaryRow}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{statusCopy}</Text>
          </View>
              <Moment
                utc
                local
                element={Text}
            format="MMM D"
            style={styles.dateText}
          >
                {props.date}
              </Moment>
            </View>
          </View>

      {/* Action indicator with consistent positioning */}
      <View style={styles.actionContainer}>
        <Icon 
          size={16} 
          color={colors?.text?.tertiary || '#6B7280'} 
          name="chevron-right" 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Main container with standardized padding and structure
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    paddingVertical: spacing?.[4] || 16,
    paddingHorizontal: spacing?.[4] || 16,
    minHeight: 72,
  },
  
  // Avatar container with fixed dimensions y overflow hidden para recorte
  avatarContainer: {
    width: 48,
    height: 48,
    marginRight: spacing?.[3] || 12,
    flexShrink: 0,
    overflow: 'hidden', // <-- importante para recorte
    borderRadius: 8, // <-- también aquí
  },
  
  // Avatar con 100% del contenedor
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Esquinas ligeramente redondeadas
    backgroundColor: colors?.gray?.[100] || '#F3F4F6',
  },
  
  // Content container with proper flex behavior
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 48, // Match avatar height
  },
  
  // Primary row with consistent spacing
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing?.[1] || 4,
  },
  
  // Merchant name with proper text handling
  merchantName: {
    flex: 1,
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    marginRight: spacing?.[3] || 12,
    // Optimizado: sin lineHeight problemático
  },
  
  // Amount with emphasis
  amount: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    // Optimizado: sin lineHeight problemático
  },
  
  // Secondary row with consistent alignment
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Status container with proper alignment
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  // Status indicator with standardized size
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing?.[2] || 8,
  },
  
  // Status text with secondary styling
  statusText: {
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.secondary || '#374151',
    // Optimizado: sin lineHeight problemático
  },
  
  // Date text with tertiary styling
  dateText: {
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.normal || '400',
    color: colors?.text?.tertiary || '#6B7280',
    // Optimizado: sin lineHeight problemático
  },
  
  // Action container with consistent positioning
  actionContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing?.[2] || 8,
    flexShrink: 0,
  },
});