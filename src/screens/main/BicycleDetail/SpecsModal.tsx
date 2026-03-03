import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import type { BicycleListing } from '../../../types/bicycle';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  POOR: 'Cũ',
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

interface Props {
  visible: boolean;
  onClose: () => void;
  item: BicycleListing;
}

const SpecsModal = ({ visible, onClose, item }: Props) => {
  const specs = item.specifications;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {item.brand && (
                <Text style={styles.headerBrand}>{item.brand.name}</Text>
              )}
              <Text style={styles.headerTitle}>{item.title}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>
            <DetailRow
              label="Tình trạng"
              value={CONDITION_LABELS[item.condition] ?? item.condition}
            />
            {specs?.yearManufactured ? (
              <DetailRow label="Năm sản xuất" value={`${specs.yearManufactured}`} />
            ) : null}
            {specs?.frameSize ? (
              <DetailRow label="Kích cỡ khung" value={specs.frameSize} />
            ) : null}
            {specs?.frameMaterial ? (
              <DetailRow label="Chất liệu khung" value={specs.frameMaterial} />
            ) : null}
            {specs?.color ? (
              <DetailRow label="Màu sắc" value={specs.color} />
            ) : null}
            {item.usageMonths ? (
              <DetailRow label="Thời gian sử dụng" value={`${item.usageMonths} tháng`} />
            ) : null}
            {item.location?.city ? (
              <DetailRow label="Khu vực" value={item.location.city} />
            ) : null}
            {item.category ? (
              <DetailRow label="Danh mục" value={item.category.name} />
            ) : null}
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  headerBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});

export default SpecsModal;
