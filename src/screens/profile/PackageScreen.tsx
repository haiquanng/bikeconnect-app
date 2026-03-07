import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { packageService, Package, UserPackage } from '../../api/packageService';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const STATUS_LABEL: Record<UserPackage['status'], string> = {
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Đã hết hạn',
  CANCELLED: 'Đã huỷ',
};

const STATUS_COLOR: Record<UserPackage['status'], string> = {
  ACTIVE: colors.success,
  EXPIRED: colors.textSecondary,
  CANCELLED: colors.error,
};

const PackageCard = ({ pkg, isActive }: { pkg: Package; isActive: boolean }) => (
  <View style={[styles.pkgCard, isActive && styles.pkgCardActive]}>
    {isActive && (
      <View style={styles.activeBadge}>
        <Icon name="checkmark-circle" size={13} color={colors.white} />
        <Text style={styles.activeBadgeText}>Đang dùng</Text>
      </View>
    )}
    <View style={styles.pkgTop}>
      <View style={styles.pkgIconBox}>
        <Icon name="cube-outline" size={22} color={isActive ? colors.primaryGreen : colors.textSecondary} />
      </View>
      <View style={styles.pkgInfo}>
        <Text style={styles.pkgName}>{pkg.name}</Text>
        <Text style={styles.pkgCode}>{pkg.code}</Text>
      </View>
      <Text style={styles.pkgPrice}>{formatPrice(pkg.price)}</Text>
    </View>
    <View style={styles.pkgDivider} />
    <View style={styles.pkgFeature}>
      <Icon name="file-tray-full-outline" size={16} color={colors.textSecondary} />
      <Text style={styles.pkgFeatureText}>Đăng tối đa <Text style={styles.pkgFeatureBold}>{pkg.postLimit}</Text> tin</Text>
    </View>
  </View>
);

const PackageScreen = ({ navigation }: any) => {
  const [activePackage, setActivePackage] = useState<UserPackage | null>(null);
  const [packages, setPackages]           = useState<Package[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [active, pkgs] = await Promise.all([
        packageService.getActivePackage(),
        packageService.getPackages(),
      ]);
      setActivePackage(active);
      setPackages(pkgs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBuy = () => {
    Linking.openURL('https://xedap.store/packages');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dùng</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryGreen}
              colors={[colors.primaryGreen]}
            />
          }
        >
          {/* Current package hero */}
          {activePackage ? (
            <View style={styles.heroCard}>
              <View style={styles.heroIconBox}>
                <Icon name="ribbon-outline" size={28} color={colors.primaryGreen} />
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroLabel}>Gói hiện tại</Text>
                <Text style={styles.heroName}>{activePackage.package.name}</Text>
                <View style={styles.heroStatusRow}>
                  <View style={[styles.heroDot, { backgroundColor: STATUS_COLOR[activePackage.status] }]} />
                  <Text style={[styles.heroStatus, { color: STATUS_COLOR[activePackage.status] }]}>
                    {STATUS_LABEL[activePackage.status]}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noPackageCard}>
              <Icon name="cube-outline" size={36} color={colors.gray[300]} />
              <Text style={styles.noPackageTitle}>Chưa có gói nào</Text>
              <Text style={styles.noPackageDesc}>Mua gói để đăng tin bán xe và tiếp cận nhiều khách hàng hơn.</Text>
            </View>
          )}

          {/* Usage stats (if active) */}
          {activePackage && activePackage.status === 'ACTIVE' && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Tình trạng sử dụng</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{activePackage.postedUsed}</Text>
                  <Text style={styles.statLabel}>Đã đăng</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, styles.statValueGreen]}>{activePackage.postRemaining}</Text>
                  <Text style={styles.statLabel}>Còn lại</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{activePackage.package.postLimit}</Text>
                  <Text style={styles.statLabel}>Giới hạn</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        (activePackage.postedUsed / activePackage.package.postLimit) * 100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Available packages */}
          {packages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Các gói có sẵn</Text>
              {packages.map(pkg => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  isActive={activePackage?.packageId === pkg._id || activePackage?.package._id === pkg._id}
                />
              ))}
            </View>
          )}

          <View style={styles.scrollSpacer} />
        </ScrollView>
      )}

      {/* Bottom buy button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy} activeOpacity={0.85}>
          <Icon name="open-outline" size={20} color={colors.white} />
          <Text style={styles.buyBtnText}>Mua gói tại xedap.store</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },

  content: { padding: 16, gap: 12 },

  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: colors.primaryGreen,
  },
  heroIconBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryGreen + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  heroLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  heroName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  heroStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  heroDot: { width: 7, height: 7, borderRadius: 4 },
  heroStatus: { fontSize: 12, fontWeight: '600' },

  noPackageCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 24,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  noPackageTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  noPackageDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  statsCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 12,
  },
  statsTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: colors.gray[100] },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statValueGreen: { color: colors.primaryGreen },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  progressBarBg: {
    height: 6, borderRadius: 3, backgroundColor: colors.gray[100], overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primaryGreen },

  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },

  pkgCard: {
    backgroundColor: colors.white, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.gray[200], gap: 10, overflow: 'hidden',
  },
  pkgCardActive: { borderColor: colors.primaryGreen, borderWidth: 1.5 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGreen, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  pkgTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pkgIconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: colors.gray[50], alignItems: 'center', justifyContent: 'center',
  },
  pkgInfo: { flex: 1 },
  pkgName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  pkgCode: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  pkgPrice: { fontSize: 16, fontWeight: '800', color: colors.primaryGreen },
  pkgDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.gray[100] },
  pkgFeature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pkgFeatureText: { fontSize: 13, color: colors.textSecondary },
  pkgFeatureBold: { fontWeight: '700', color: colors.textPrimary },

  scrollSpacer: { height: 80 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
  },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primaryGreen, borderRadius: 14, paddingVertical: 14,
  },
  buyBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

export default PackageScreen;
