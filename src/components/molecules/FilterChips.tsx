import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedFilters,
  onFilterToggle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.chip,
            selectedFilters.includes(filter.id) && styles.chipActive,
          ]}
          onPress={() => onFilterToggle(filter.id)}
        >
          <Icon
            name={filter.icon}
            size={16}
            color={
              selectedFilters.includes(filter.id)
                ? colors.white
                : colors.textPrimary
            }
          />
          <Text
            style={[
              styles.chipText,
              selectedFilters.includes(filter.id) && styles.chipTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 6,
  },
  chipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  chipText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
  },
});

export default FilterChips;
