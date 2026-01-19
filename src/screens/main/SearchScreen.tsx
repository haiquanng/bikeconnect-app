import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState([
    'Specialized',
    'Trek',
    'Giant',
    'Cannondale',
  ]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate back to Main and then to Shop tab with params
      navigation.navigate('Main', {
        screen: 'Shop',
        params: { searchQuery: searchQuery.trim() },
      });
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    navigation.navigate('Main', {
      screen: 'Shop',
      params: { searchQuery: query },
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thương hiệu, xe đạp..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Searches */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
        <FlatList
          data={recentSearches}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => handleRecentSearch(item)}
            >
              <Icon name="time-outline" size={20} color={colors.gray[400]} />
              <Text style={styles.recentText}>{item}</Text>
              <Icon
                name="arrow-forward"
                size={20}
                color={colors.gray[300]}
                style={styles.recentArrow}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  recentArrow: {
    marginLeft: 'auto',
  },
});

export default SearchScreen;
