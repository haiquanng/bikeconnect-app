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
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { bicycleService } from '../../api/bicycleService';
import { colors } from '../../theme';
import type {
  BicycleListing,
  CreateBicycleRequest,
  CreateListingFormData,
} from '../../types/bicycle';
import { INITIAL_FORM_DATA } from '../../types/bicycle';
import Step1FindBike from './steps/Step1FindBike';
import Step2BasicInfo from './steps/Step2BasicInfo';
import Step3Condition from './steps/Step3Condition';
import Step4Images from './steps/Step4Images';
import Step5Price from './steps/Step5Price';

const STEPS = [
  { number: 1, title: 'Thông tin xe' },
  { number: 2, title: 'Thông tin cơ bản' },
  { number: 3, title: 'Tình trạng xe' },
  { number: 4, title: 'Ảnh xe' },
  { number: 5, title: 'Thiết lập giá' },
];

const MIN_IMAGES = 3;

// Edit mode: Step 1 only needs category + brand (model is optional — not stored on listing)
const isStepValid = (step: number, formData: CreateListingFormData): boolean => {
  switch (step) {
    case 1: return !!(formData.categoryId && formData.brandId);
    case 2: return !!formData.title.trim();
    case 3: return !!formData.condition;
    case 4: return formData.images.length >= MIN_IMAGES;
    case 5: return Number(formData.price) > 0;
    default: return false;
  }
};

const mapListingToFormData = (item: BicycleListing): CreateListingFormData => ({
  categoryId:       item.category?._id ?? '',
  categoryName:     item.category?.name ?? '',
  brandId:          item.brand?._id ?? '',
  brandName:        item.brand?.name ?? '',
  modelId:          '',
  modelName:        '',
  title:            item.title,
  description:      item.description ?? '',
  city:             item.location?.city ?? '',
  provinceId:       item.location?.provinceId ?? null,
  district:         item.location?.district ?? '',
  districtId:       item.location?.districtId ?? null,
  ward:             item.location?.ward ?? '',
  wardCode:         item.location?.wardCode ?? '',
  street:           '',
  origin:           '',
  yearManufactured: item.specifications?.yearManufactured
    ? String(item.specifications.yearManufactured)
    : '',
  frameSize:        (item.specifications?.frameSize as string) ?? '',
  frameMaterial:    (item.specifications?.frameMaterial as string) ?? '',
  isElectric:       false,
  color:            (item.specifications?.color as string) ?? '',
  condition:        item.condition,
  usageMonths:      item.usageMonths ? String(item.usageMonths) : '',
  images:           item.images ?? [],
  price:            String(item.price),
  originalPrice:    item.originalPrice ? String(item.originalPrice) : '',
});

const EditListingScreen = ({ navigation, route }: any) => {
  const { id } = route.params as { id: string };

  const [loadingData, setLoadingData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData]       = useState<CreateListingFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoadingData(true);
          const item = await bicycleService.getBicycleById(id);
          if (!cancelled) {
            setFormData(mapListingToFormData(item));
          }
        } catch {
          if (!cancelled) {
            Alert.alert('Lỗi', 'Không thể tải thông tin tin đăng', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        } finally {
          if (!cancelled) { setLoadingData(false); }
        }
      })();
      return () => { cancelled = true; };
    }, [id, navigation]),
  );

  const updateForm = useCallback((updates: Partial<CreateListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const canContinue = isStepValid(currentStep, formData);
  const isLastStep  = currentStep === STEPS.length;

  const handleNext = () => {
    if (!canContinue) { return; }
    if (isLastStep) { handleSubmit(); }
    else { setCurrentStep(prev => prev + 1); }
  };

  const handleBack = () => {
    if (currentStep === 1) { navigation.goBack(); }
    else { setCurrentStep(prev => prev - 1); }
  };

  const handleCancel = () => {
    Alert.alert('Huỷ chỉnh sửa', 'Thay đổi chưa lưu sẽ bị mất. Bạn có chắc muốn thoát?', [
      { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
      { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // specifications chỉ gửi khi có yearManufactured (required trong schema khi object được gửi)
      let specifications: Record<string, unknown> | undefined;
      if (formData.yearManufactured) {
        specifications = { yearManufactured: Number(formData.yearManufactured) };
        if (formData.frameSize)     { specifications.frameSize     = formData.frameSize; }
        if (formData.frameMaterial) { specifications.frameMaterial = formData.frameMaterial; }
        if (formData.color)         { specifications.color         = formData.color; }
      }
      // location KHÔNG cập nhật ở đây vì schema yêu cầu provinceId/districtId/wardCode (GHN)
      // mà màn edit không thu thập các field đó

      const payload: Partial<CreateBicycleRequest> = {
        title:         formData.title,
        price:         Number(formData.price),
        condition:     formData.condition as CreateBicycleRequest['condition'],
        categoryId:    formData.categoryId,
        description:   formData.description || undefined,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        brandId:       formData.brandId || undefined,
        images:        formData.images.map((img, i) => ({
          url:          img.url,
          mediaType:    img.mediaType,
          isPrimary:    img.isPrimary,
          displayOrder: i,
        })),
        ...(specifications && { specifications }),
        usageMonths: formData.usageMonths ? Number(formData.usageMonths) : undefined,
      };

      await bicycleService.updateBicycle(id, payload);
      Toast.show({ type: 'success', text1: 'Cập nhật tin đăng thành công!' });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Cập nhật thất bại, vui lòng thử lại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1FindBike   formData={formData} onChange={updateForm} />;
      case 2: return <Step2BasicInfo  formData={formData} onChange={updateForm} />;
      case 3: return <Step3Condition  formData={formData} onChange={updateForm} />;
      case 4: return <Step4Images     formData={formData} onChange={updateForm} />;
      case 5: return <Step5Price      formData={formData} onChange={updateForm} />;
      default: return null;
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
            <Text style={styles.headerTitle}>Chỉnh sửa tin đăng</Text>
            <Text style={styles.headerStepLabel}>Bước {currentStep}/{STEPS.length}</Text>
          </View>
          <TouchableOpacity onPress={handleCancel} style={styles.headerBtn} activeOpacity={0.7}>
            <Icon name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(currentStep / STEPS.length) * 100}%` }]} />
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
          <View style={styles.scrollSpacer} />
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.actionBar}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
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
                  {isLastStep ? 'Lưu thay đổi' : 'Tiếp tục'}
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
  safeArea:    { flex: 1, backgroundColor: colors.white },
  container:   { flex: 1 },
  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },

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
  headerCenter:    { flex: 1, alignItems: 'center' },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  headerStepLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  progressContainer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: { height: '100%', backgroundColor: colors.primaryGreen, borderRadius: 2 },
  stepDots:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
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
  stepDotActive:     { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  stepDotCurrent:    { borderColor: colors.primaryGreen, backgroundColor: colors.primaryGreen },
  stepDotText:       { fontSize: 10, fontWeight: '700', color: colors.gray[500] },
  stepDotTextActive: { color: colors.white },

  stepTitleContainer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  stepTitle:          { fontSize: 20, fontWeight: '700', color: colors.textPrimary },

  scrollView:    { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  scrollSpacer:  { height: 24 },

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
  backBtnText:    { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
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
  nextBtnFull:     { flex: 1 },
  nextBtnDisabled: { backgroundColor: colors.gray[300] },
  nextBtnText:     { fontSize: 15, fontWeight: '700', color: colors.white },
});

export default EditListingScreen;
