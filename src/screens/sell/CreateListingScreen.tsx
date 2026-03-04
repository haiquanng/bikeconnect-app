import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { bicycleService } from '../../api/bicycleService';
import { colors } from '../../theme';
import type { CreateBicycleRequest, CreateListingFormData } from '../../types/bicycle';
import { INITIAL_FORM_DATA } from '../../types/bicycle';
import Step1FindBike from './steps/Step1FindBike';
import Step2BasicInfo from './steps/Step2BasicInfo';
import Step3Condition from './steps/Step3Condition';
import Step4Images from './steps/Step4Images';
import Step5Price from './steps/Step5Price';

const STEPS = [
  { number: 1, title: 'Tìm xe của bạn' },
  { number: 2, title: 'Thông tin cơ bản' },
  { number: 3, title: 'Tình trạng xe' },
  { number: 4, title: 'Ảnh xe' },
  { number: 5, title: 'Thiết lập giá' },
];

const MIN_IMAGES = 3;

const isStepValid = (step: number, formData: CreateListingFormData): boolean => {
  switch (step) {
    case 1:
      return !!(formData.categoryId && formData.brandId && formData.modelId);
    case 2:
      return !!formData.title.trim();
    case 3:
      return !!formData.condition;
    case 4:
      return formData.images.length >= MIN_IMAGES;
    case 5:
      return Number(formData.price) > 0;
    default:
      return false;
  }
};

interface Props {
  navigation: any;
}

const CreateListingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateListingFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = useCallback((updates: Partial<CreateListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const canContinue = isStepValid(currentStep, formData);
  const isLastStep = currentStep === STEPS.length;

  const handleNext = () => {
    if (!canContinue) return;
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    Alert.alert('Hủy đăng tin', 'Dữ liệu sẽ không được lưu. Bạn có chắc muốn thoát?', [
      { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
      {
        text: 'Thoát',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const specs: Record<string, unknown> = {};
      if (formData.yearManufactured) specs.yearManufactured = Number(formData.yearManufactured);
      if (formData.frameSize) specs.frameSize = formData.frameSize;
      if (formData.frameMaterial) specs.frameMaterial = formData.frameMaterial;
      if (formData.color) specs.color = formData.color;

      const location: Record<string, unknown> = {};
      if (formData.city)       location.city       = formData.city;
      if (formData.provinceId) location.provinceId = formData.provinceId;
      if (formData.district)   location.district   = formData.district;
      if (formData.districtId) location.districtId = formData.districtId;
      if (formData.ward)       location.ward       = formData.ward;
      if (formData.wardCode)   location.wardCode   = formData.wardCode;
      if (formData.street)     location.address    = formData.street;

      const payload: CreateBicycleRequest = {
        title: formData.title,
        price: Number(formData.price),
        condition: formData.condition as CreateBicycleRequest['condition'],
        categoryId: formData.categoryId,
        description: formData.description || undefined,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        brandId: formData.brandId || undefined,
        images: formData.images.map((img, i) => ({
          url: img.url,
          mediaType: img.mediaType,
          isPrimary: img.isPrimary,
          displayOrder: i,
        })),
        ...(Object.keys(specs).length > 0 && { specifications: specs }),
        ...(Object.keys(location).length > 0 && { location }),
        usageMonths: formData.usageMonths ? Number(formData.usageMonths) : undefined,
      };

      await bicycleService.createBicycle(payload);
      Toast.show({ type: 'success', text1: 'Đăng tin thành công!' });
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'Main' }, { name: 'Listings' }],
        }),
      );
    } catch {
      Toast.show({ type: 'error', text1: 'Đăng tin thất bại, vui lòng thử lại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1FindBike formData={formData} onChange={updateForm} />;
      case 2:
        return <Step2BasicInfo formData={formData} onChange={updateForm} />;
      case 3:
        return <Step3Condition formData={formData} onChange={updateForm} />;
      case 4:
        return <Step4Images formData={formData} onChange={updateForm} />;
      case 5:
        return <Step5Price formData={formData} onChange={updateForm} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Đăng tin xe đạp</Text>
            <Text style={styles.headerStepLabel}>
              Bước {currentStep}/{STEPS.length}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCancel} style={styles.headerBtn} activeOpacity={0.7}>
            <Icon name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / STEPS.length) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.stepDots}>
            {STEPS.map(step => (
              <View
                key={step.number}
                style={[
                  styles.stepDot,
                  step.number <= currentStep && styles.stepDotActive,
                  step.number === currentStep && styles.stepDotCurrent,
                ]}
              >
                {step.number < currentStep ? (
                  <Icon name="checkmark" size={10} color={colors.white} />
                ) : (
                  <Text style={[
                    styles.stepDotText,
                    step.number <= currentStep && styles.stepDotTextActive,
                  ]}>
                    {step.number}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Step title */}
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>{STEPS[currentStep - 1].title}</Text>
        </View>

        {/* Step content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
          {/* Bottom padding for action bar */}
          <View style={styles.scrollSpacer} />
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.actionBar}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={18} color={colors.textPrimary} />
              <Text style={styles.backBtnText}>Quay lại</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextBtn,
              currentStep === 1 && styles.nextBtnFull,
              (!canContinue || isSubmitting) && styles.nextBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={!canContinue || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {isLastStep ? 'Đăng tin' : 'Tiếp tục'}
                </Text>
                {!isLastStep && (
                  <Icon name="arrow-forward" size={18} color={colors.white} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerStepLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  stepDotActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  stepDotCurrent: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreen,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray[500],
  },
  stepDotTextActive: {
    color: colors.white,
  },
  stepTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollSpacer: {
    height: 24,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
  },
  nextBtnFull: {
    flex: 1,
  },
  nextBtnDisabled: {
    backgroundColor: colors.gray[300],
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

export default CreateListingScreen;
