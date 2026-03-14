import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { bicycleService, InspectionReport } from '../../api/bicycleService';

const CONDITION_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  EXCELLENT: { label: 'Xuất sắc',  color: '#065F46', icon: 'checkmark-circle' },
  GOOD:      { label: 'Tốt',       color: '#1D4ED8', icon: 'checkmark-circle-outline' },
  FAIR:      { label: 'Khá',       color: '#92400E', icon: 'remove-circle-outline' },
  POOR:      { label: 'Yếu',       color: '#DC2626', icon: 'close-circle-outline' },
  VERY_POOR: { label: 'Rất yếu',   color: '#7F1D1D', icon: 'close-circle' },
};

const CONDITION_COLOR_STYLES = StyleSheet.create({
  EXCELLENT: { color: '#065F46' },
  GOOD:      { color: '#1D4ED8' },
  FAIR:      { color: '#92400E' },
  POOR:      { color: '#DC2626' },
  VERY_POOR: { color: '#7F1D1D' },
  DEFAULT:   { color: colors.textSecondary },
} as const);

type ConditionKey = 'frame' | 'brake' | 'drivetrain' | 'wheels';

const CONDITION_PARTS: { key: ConditionKey; label: string; icon: string }[] = [
  { key: 'frame',      label: 'Khung xe',    icon: 'bicycle-outline' },
  { key: 'brake',      label: 'Phanh',       icon: 'hand-left-outline' },
  { key: 'drivetrain', label: 'Truyền động', icon: 'settings-outline' },
  { key: 'wheels',     label: 'Bánh xe',     icon: 'ellipse-outline' },
];

const formatDate = (s?: string) => {
  if (!s) { return '—'; }
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const InspectionReportScreen = ({ navigation, route }: any) => {
  const bicycleId: string = route.params?.bicycleId;
  const bicycleTitle: string = route.params?.bicycleTitle ?? 'Xe đạp';
  const rejectionReason: string | undefined = route.params?.rejectionReason;
  const hasChangedSinceRejection: boolean = route.params?.hasChangedSinceRejection ?? false;

  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await bicycleService.getInspectionReport(bicycleId);
        setReport(data);
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? 'Không thể tải báo cáo kiểm định';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [bicycleId]);

  const handleResubmit = () => {
    if (hasChangedSinceRejection) {
      // Đã có thay đổi → gọi resubmit trực tiếp, không cần qua EditListing
      Alert.alert(
        'Gửi lại kiểm định',
        'Tin đăng đã được cập nhật. Xác nhận gửi lại để kiểm định?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Gửi lại',
            onPress: async () => {
              setResubmitting(true);
              try {
                await bicycleService.resubmitBicycle(bicycleId);
                Toast.show({ type: 'success', text1: 'Đã gửi lại!', text2: 'Tin đăng đang chờ kiểm định lại' });
                navigation.navigate('Listings');
              } catch (e: any) {
                const msg = e?.response?.data?.message ?? 'Gửi lại thất bại, vui lòng thử lại';
                Toast.show({ type: 'error', text1: msg });
              } finally {
                setResubmitting(false);
              }
            },
          },
        ],
      );
    } else {
      // Chưa có thay đổi → vào EditListing chỉnh sửa, resubmit sẽ tự gọi sau khi save
      Alert.alert(
        'Cập nhật và gửi lại',
        'Bạn cần chỉnh sửa thông tin xe. Sau khi lưu, tin đăng sẽ được gửi lại tự động.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Chỉnh sửa', onPress: () => navigation.navigate('EditListing', { id: bicycleId, fromRejected: true }) },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Báo cáo kiểm định</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Icon name="document-text-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : report ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Status hero */}
            <View style={[styles.heroCard, report.isPassed ? styles.heroCardPassed : styles.heroCardFailed]}>
              <Icon
                name={report.isPassed ? 'checkmark-circle' : 'close-circle'}
                size={40}
                color={report.isPassed ? '#065F46' : '#DC2626'}
              />
              <View style={styles.heroContent}>
                <Text style={[styles.heroStatus, report.isPassed ? styles.heroStatusPassed : styles.heroStatusFailed]}>
                  {report.isPassed ? 'Đạt kiểm định' : 'Không đạt kiểm định'}
                </Text>
                <Text style={styles.heroSubtitle} numberOfLines={2}>{bicycleTitle}</Text>
              </View>
              {report.overallRating > 0 && (
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{report.overallRating}/5</Text>
                </View>
              )}
            </View>

            {/* Rejection reason */}
            {rejectionReason ? (
              <View style={styles.rejectionCard}>
                <View style={styles.rejectionHeader}>
                  <Icon name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.rejectionTitle}>Lý do từ chối</Text>
                </View>
                <Text style={styles.rejectionText}>{rejectionReason}</Text>
                {hasChangedSinceRejection && (
                  <View style={styles.updatedBadge}>
                    <Icon name="checkmark-circle-outline" size={14} color="#065F46" />
                    <Text style={styles.updatedBadgeText}>Đã cập nhật — sẵn sàng gửi lại</Text>
                  </View>
                )}
              </View>
            ) : null}

            {/* Conditions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Đánh giá từng bộ phận</Text>
              {CONDITION_PARTS.map(({ key, label, icon }) => {
                const val = report.conditions[key];
                const cfg = CONDITION_LABEL[val] ?? { label: val, color: colors.textSecondary, icon: 'help-circle-outline' };
                return (
                  <View key={key} style={styles.conditionRow}>
                    <View style={styles.conditionLeft}>
                      <Icon name={icon as any} size={18} color={colors.textSecondary} />
                      <Text style={styles.conditionLabel}>{label}</Text>
                    </View>
                    <View style={styles.conditionRight}>
                      <Icon name={cfg.icon as any} size={16} color={cfg.color} />
                      <Text style={[styles.conditionValue, CONDITION_COLOR_STYLES[val] ?? CONDITION_COLOR_STYLES.DEFAULT]}>{cfg.label}</Text>
                    </View>
                  </View>
                );
              })}
              {report.conditions.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Ghi chú bộ phận</Text>
                  <Text style={styles.notesText}>{report.conditions.notes}</Text>
                </View>
              ) : null}
            </View>

            {/* Overall notes */}
            {report.notes ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Nhận xét chung</Text>
                <Text style={styles.notesText}>{report.notes}</Text>
              </View>
            ) : null}

            {/* Images */}
            {report.images && report.images.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Hình ảnh kiểm định</Text>
                <View style={styles.imagesGrid}>
                  {report.images.map((uri, i) => (
                    <TouchableOpacity key={i} onPress={() => setPreviewImage(uri)} activeOpacity={0.85}>
                      <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Meta info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin kiểm định</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Trạng thái</Text>
                <Text style={styles.metaValue}>{report.status}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ngày tạo</Text>
                <Text style={styles.metaValue}>{formatDate(report.createdAt)}</Text>
              </View>
              {report.submittedAt && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Ngày gửi</Text>
                  <Text style={styles.metaValue}>{formatDate(report.submittedAt)}</Text>
                </View>
              )}
              {report.completedAt && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Ngày hoàn thành</Text>
                  <Text style={styles.metaValue}>{formatDate(report.completedAt)}</Text>
                </View>
              )}
            </View>

            <View style={styles.scrollSpacer} />
          </ScrollView>

          {/* Bottom action */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.resubmitBtn, hasChangedSinceRejection && styles.resubmitBtnReady]}
              onPress={handleResubmit}
              disabled={resubmitting}
              activeOpacity={0.85}
            >
              {resubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name={hasChangedSinceRejection ? 'send-outline' : 'refresh-outline'} size={20} color={colors.white} />
              )}
              <Text style={styles.resubmitBtnText}>
                {resubmitting ? 'Đang gửi...' : hasChangedSinceRejection ? 'Gửi lại kiểm định' : 'Cập nhật và gửi lại'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image preview overlay */}
          {previewImage && (
            <TouchableOpacity style={styles.previewOverlay} onPress={() => setPreviewImage(null)} activeOpacity={1}>
              <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
              <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewImage(null)}>
                <Icon name="close" size={22} color={colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },
  errorText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },

  content: { padding: 16, gap: 12 },

  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 16, borderWidth: 1,
  },
  heroCardPassed: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' },
  heroCardFailed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  heroContent: { flex: 1 },
  heroStatus: { fontSize: 16, fontWeight: '700' },
  heroStatusPassed: { color: '#065F46' },
  heroStatusFailed: { color: '#DC2626' },
  heroSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },

  conditionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[100],
  },
  conditionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conditionLabel: { fontSize: 14, color: colors.textPrimary },
  conditionRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  conditionValue: { fontSize: 14, fontWeight: '600' },

  notesBox: {
    marginTop: 8, backgroundColor: colors.gray[50], borderRadius: 8, padding: 12,
    borderLeftWidth: 3, borderLeftColor: colors.primaryGreen,
  },
  notesLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },

  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnail: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.gray[100] },

  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[100],
  },
  metaLabel: { fontSize: 13, color: colors.textSecondary },
  metaValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
  },
  resubmitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primaryGreen, borderRadius: 14, paddingVertical: 14,
  },
  resubmitBtnReady: { backgroundColor: '#1D4ED8' },
  resubmitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  scrollSpacer: { height: 100 },

  rejectionCard: {
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#FECACA', gap: 8,
  },
  rejectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rejectionTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  rejectionText: { fontSize: 13, color: '#7F1D1D', lineHeight: 20 },
  updatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  updatedBadgeText: { fontSize: 12, fontWeight: '600', color: '#065F46' },

  previewOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '80%' },
  previewClose: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
});

export default InspectionReportScreen;
