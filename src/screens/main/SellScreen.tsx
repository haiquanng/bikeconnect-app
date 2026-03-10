import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

const FEATURES = [
  { icon: 'camera-outline', label: 'Đăng tối đa\n12 ảnh' },
  { icon: 'shield-checkmark-outline', label: 'Bảo vệ\nngười bán' },
  { icon: 'flash-outline', label: 'Duyệt tin\nnhanh chóng' },
];

const LISTING_STEPS = [
  'Chọn danh mục, thương hiệu & mẫu xe',
  'Điền thông tin cơ bản',
  'Mô tả tình trạng xe',
  'Tải ảnh chụp thực tế',
  'Thiết lập giá bán',
];

interface Props {
  navigation: any;
}

const SellScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <LinearGradient colors={['#F0FDF4', '#ECFDF5']} style={styles.hero}>
          <LinearGradient
            colors={['#19BF2A', '#88FEC0']}
            style={styles.heroIconBg}
          >
            <Icon name="bicycle" size={52} color={colors.white} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Đăng tin bán xe đạp</Text>
          <Text style={styles.heroSubtitle}>
            Tiếp cận hàng nghìn người mua tiềm năng, bán xe dễ dàng và an toàn.
          </Text>
        </LinearGradient>

        {/* Feature highlights */}
        <View style={styles.featuresRow}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Icon name={feature.icon as any} size={22} color={colors.primaryGreen} />
              </View>
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* Process steps preview */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsCardTitle}>Quy trình đăng tin</Text>
          {LISTING_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('CreateListing')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#19BF2A', '#88FEC0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtnGradient}
          >
            <Icon name="add-circle-outline" size={22} color={colors.white} />
            <Text style={styles.ctaBtnText}>Bắt đầu đăng tin</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  heroIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepsCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  stepsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  stepText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default SellScreen;
