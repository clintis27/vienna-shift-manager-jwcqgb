
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, darkColors } from '@/styles/commonStyles';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOptions?: {
    label: string;
    key: string;
    options: FilterOption[];
  }[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  placeholder?: string;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filterOptions = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  placeholder = 'Search...',
}: SearchFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkColors : colors;

  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      {filterOptions.length > 0 && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.card, borderColor: theme.border },
            activeFilterCount > 0 && { borderColor: theme.primary, borderWidth: 2 },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={theme.primary} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol name="xmark" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {filterOptions.map((filter) => (
                <View key={filter.key} style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: theme.text }]}>{filter.label}</Text>
                  <View style={styles.filterOptions}>
                    {filter.options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          { backgroundColor: theme.background, borderColor: theme.border },
                          activeFilters[filter.key] === option.value && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primary + '20',
                          },
                        ]}
                        onPress={() => {
                          if (onFilterChange) {
                            onFilterChange(filter.key, option.value);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            { color: theme.text },
                            activeFilters[filter.key] === option.value && {
                              color: theme.primary,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              {activeFilterCount > 0 && (
                <TouchableOpacity
                  style={[styles.clearButton, { backgroundColor: theme.background }]}
                  onPress={() => {
                    if (onClearFilters) {
                      onClearFilters();
                    }
                    setShowFilters(false);
                  }}
                >
                  <Text style={[styles.clearButtonText, { color: theme.text }]}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  filterOptionText: {
    fontSize: 14,
  },
  clearButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    margin: 24,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
