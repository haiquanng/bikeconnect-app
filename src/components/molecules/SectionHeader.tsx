import { Text, TouchableOpacity, View } from "react-native";

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = {
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
  },
} as const;

export default SectionHeader;