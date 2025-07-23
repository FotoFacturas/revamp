import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import SelectDropdown from 'react-native-select-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnnouncementBar from './AnnouncementBar';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

// Theme system imported successfully

// Header component with improved standardization
const Header = ({ currentFilter = 0, onFilterChange, title = "Facturas" }) => {
  const insets = useSafeAreaInsets();
  const dropdownRef = React.useRef(null);

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        {/* Filter Section */}
          {onFilterChange && (
          <View style={styles.filterSection}>
              <SelectDropdown
                ref={dropdownRef}
                data={['Últimos 100', 'Últimos 3 meses']}
                defaultValueByIndex={currentFilter}
              buttonStyle={styles.dropdownButton}
              dropdownStyle={styles.dropdownContainer}
              buttonTextStyle={styles.dropdownButtonText}
              rowTextStyle={styles.dropdownRowText}
              renderCustomizedButtonChild={selectedItem => (
                <View style={styles.dropdownButtonContent}>
                      <MaterialCommunityIcon
                        name="filter"
                        size={16}
                    color={colors.text.secondary}
                    style={styles.filterIcon}
                  />
                  <Text style={styles.dropdownSelectedText}>
                          {selectedItem}
                        </Text>
                      </View>
              )}
              renderDropdownIcon={focused => (
                <View style={styles.dropdownIconContainer}>
                        <MaterialCommunityIcon
                    name={focused ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.text.secondary}
                        />
                      </View>
              )}
                dropdownIconPosition="right"
                onSelect={(selectedItem, index) => {
                  onFilterChange(index);
                }}
              />
            </View>
          )}
      </View>
    </View>
  );
};

// Standardized ScreenLayout component
const ScreenLayout = ({ 
  children, 
  announcements,
  backgroundColor = colors.background.primary,
  ...headerProps 
}) => {
  return (
    <View style={[styles.screenContainer, { backgroundColor }]}>
      {/* Header */}
      <Header {...headerProps} />
      
      {/* Announcements */}
      {announcements && <AnnouncementBar {...announcements} />}
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Screen container
  screenContainer: {
    flex: 1,
  },
  
  // Header styles
  headerContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.xs,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4], // 16px
    paddingTop: Platform.OS === 'ios' ? spacing[5] : spacing[6], // 20px/24px
    paddingBottom: spacing[4], // 16px
    minHeight: 60, // Consistent header height
  },
  
  // Title section
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: typography?.fontSize?.['3xl'] || 30,
    fontWeight: typography?.fontWeight?.bold || '700',
    color: colors?.text?.primary || '#111827',
    // Optimizado: theme system sin lineHeight/letterSpacing problemáticos
  },
  
  // Filter section
  filterSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  
  // Dropdown styles
  dropdownButton: {
    width: 160,
    height: 40,
    borderRadius: borderRadius.lg, // 8px
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing[3], // 12px
  },
  
  dropdownContainer: {
    borderRadius: borderRadius.lg,
    width: 160,
    marginTop: spacing[1], // 4px
    borderColor: colors.border.light,
    ...shadows.md,
  },
  
  dropdownButtonText: {
    fontSize: typography?.fontSize?.sm || 14, // sm
    color: colors?.text?.primary || '#111827', // CORREGIDO
    fontWeight: typography?.fontWeight?.medium || '500', // medium
  },
  
  dropdownRowText: {
    fontSize: typography?.fontSize?.sm || 14, // sm
    color: colors?.text?.primary || '#111827', // CORREGIDO
    fontWeight: typography?.fontWeight?.normal || '400', // normal
    paddingVertical: spacing?.[2] || 8, // spacing[2]
  },
  
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  
  filterIcon: {
    marginRight: spacing[2], // 8px
  },
  
  dropdownSelectedText: {
    fontSize: typography?.fontSize?.sm || 14, // sm
    color: colors?.text?.primary || '#111827', // CORREGIDO
    fontWeight: typography?.fontWeight?.medium || '500', // medium
    flex: 1,
    textAlign: 'center',
  },
  
  dropdownIconContainer: {
    paddingLeft: spacing[2], // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Content container
  contentContainer: {
    flex: 1,
  },
});

export default ScreenLayout;
export { Header };