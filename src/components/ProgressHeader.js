import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import { colors, spacing, typography } from '../theme';

/**
 * A header with back navigation and optional title
 * @param {Object} props
 * @param {Object} props.navigation - Navigation object
 * @param {Function} props.onPress - Optional callback for when back is pressed
 * @param {string} props.title - Optional title to display in the header
 */
const ProgressHeader = ({ navigation, onPress, title }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation && navigation.canGoBack()) {
              navigation.goBack();
            } else if (onPress) {
              onPress();
            }
          }}
        >
          <Icon name="arrow-left" size={22} color={colors?.text?.primary || '#111827'} />
        </TouchableOpacity>
        
        {/* Title */}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContent: {
    padding: spacing?.[4] || 16,
    backgroundColor: colors?.background?.primary || '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    zIndex: 1,
  },
});

export default ProgressHeader;