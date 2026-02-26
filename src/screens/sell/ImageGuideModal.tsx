import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type TextPart = { text: string; hl?: boolean };

type SlideContent =
  | { type: 'single'; src: ImageSourcePropType; rotate?: boolean; blur?: boolean }
  | { type: 'grid'; srcs: ImageSourcePropType[] };

interface Slide {
  descParts: TextPart[];
  wrong: SlideContent;
  right: SlideContent;
}

const SLIDES: Slide[] = [
  {
    descParts: [
      { text: 'Đúng sản phẩm', hl: true },
      { text: ', không phải là hình khác ngoài hình sản phẩm mong muốn bán' },
    ],
    wrong: { type: 'single', src: require('../../assets/images/sell/help_1-2.jpg') },
    right: { type: 'single', src: require('../../assets/images/sell/help_1.jpg') },
  },
  {
    descParts: [
      { text: 'Hình ảnh đăng tải phải ' },
      { text: 'đúng chiều, không ngược, lật hình.', hl: true },
    ],
    wrong: {
      type: 'single',
      src: require('../../assets/images/sell/help_1.jpg'),
      rotate: true,
    },
    right: { type: 'single', src: require('../../assets/images/sell/help_1.jpg') },
  },
  {
    descParts: [
      { text: 'Mỗi tin đăng chỉ bao gồm hình ảnh của ' },
      { text: 'một sản phẩm duy nhất.', hl: true },
    ],
    wrong: {
      type: 'grid',
      srcs: [
        require('../../assets/images/sell/help_1.jpg'),
        require('../../assets/images/sell/help_5.jpg'),
        require('../../assets/images/sell/help_6.jpg'),
        require('../../assets/images/sell/help_1-2.jpg'),
      ],
    },
    right: {
      type: 'grid',
      srcs: [
        require('../../assets/images/sell/help_2.jpg'),
        require('../../assets/images/sell/help_2-1.jpg'),
        require('../../assets/images/sell/help_2-2.jpg'),
        require('../../assets/images/sell/help_2-3.jpg'),
      ],
    },
  },
  {
    descParts: [
      { text: 'Chất lượng hình sản phẩm phải ' },
      { text: 'dễ nhìn, không được quá mờ.', hl: true },
    ],
    wrong: {
      type: 'single',
      src: require('../../assets/images/sell/help_1.jpg'),
      blur: true,
    },
    right: { type: 'single', src: require('../../assets/images/sell/help_1.jpg') },
  },
  {
    descParts: [
      { text: 'Phải là ảnh của sản phẩm được bán. ' },
      { text: 'Không lấy ảnh trên mạng,', hl: true },
      { text: ' sai với thông tin xe.' },
    ],
    wrong: { type: 'single', src: require('../../assets/images/sell/help_5.jpg') },
    right: { type: 'single', src: require('../../assets/images/sell/help_1.jpg') },
  },
  {
    descParts: [
      { text: 'Hình ảnh ' },
      { text: 'không chứa logo, chữ in chìm', hl: true },
      { text: ' hoặc thông tin liên lạc với cửa hàng.' },
    ],
    wrong: { type: 'single', src: require('../../assets/images/sell/help_6.jpg') },
    right: { type: 'single', src: require('../../assets/images/sell/help_1.jpg') },
  },
];

const TOTAL = SLIDES.length;
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.floor((SCREEN_W - 40 - 12) / 2);
const IMG_H = Math.floor(CARD_W * 1.1);
const THUMB_H = Math.floor((CARD_W - 12) / 2);

const ImageGuideModal: React.FC<Props> = ({ visible, onClose }) => {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];

  const goNext = () => {
    if (current < TOTAL - 1) {
      setCurrent(prev => prev + 1);
    } else {
      setCurrent(0);
      onClose();
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent(prev => prev - 1);
  };

  const handleClose = () => {
    setCurrent(0);
    onClose();
  };

  // Swipe left = next, swipe right = prev
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 20,
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -60) goNext();
        else if (dx > 60) goPrev();
      },
    }),
  ).current;

  const renderContent = (content: SlideContent) => {
    if (content.type === 'single') {
      return (
        <View style={[styles.imgContainer, { height: IMG_H }]}>
          <Image
            source={content.src}
            style={[
              styles.cardImage,
              content.rotate && styles.cardImageRotated,
            ]}
            blurRadius={content.blur ? 8 : 0}
            resizeMode="cover"
          />
        </View>
      );
    }
    const srcs = content.srcs.slice(0, 4);
    return (
      <View style={styles.thumbGrid}>
        <View style={styles.thumbRow}>
          <Image source={srcs[0]} style={styles.thumbImage} resizeMode="cover" />
          <Image source={srcs[1]} style={styles.thumbImage} resizeMode="cover" />
        </View>
        <View style={styles.thumbRow}>
          <Image source={srcs[2]} style={styles.thumbImage} resizeMode="cover" />
          <Image source={srcs[3]} style={styles.thumbImage} resizeMode="cover" />
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 1. Close button first */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 2. Progress bar below close button */}
        <View style={styles.progressRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.progressSeg, i <= current && styles.progressSegActive]}
            />
          ))}
        </View>

        {/* 3. Swipeable content area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          {...panResponder.panHandlers}
        >
          <Text style={styles.title}>
            Hướng dẫn đăng tải ảnh sản phẩm{'\n'}đúng với quy định
          </Text>

          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{current + 1}/{TOTAL}</Text>
          </View>

          <Text style={styles.desc}>
            {slide.descParts.map((part, i) => (
              <Text key={i} style={part.hl ? styles.descHighlight : undefined}>
                {part.text}
              </Text>
            ))}
          </Text>

          <View style={styles.cardsRow}>
            {/* Wrong card */}
            <View style={[styles.card, { width: CARD_W }]}>
              <View style={[styles.resultBadge, styles.wrongBadge]}>
                <Icon name="close" size={13} color={colors.white} />
              </View>
              {renderContent(slide.wrong)}
              <View style={styles.skeletonLines}>
                <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
                <View style={[styles.skeletonLine, styles.skeletonLineMid]} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
              </View>
            </View>

            {/* Right card */}
            <View style={[styles.card, { width: CARD_W }]}>
              <View style={[styles.resultBadge, styles.rightBadge]}>
                <Icon name="checkmark" size={13} color={colors.white} />
              </View>
              {renderContent(slide.right)}
              <View style={styles.skeletonLines}>
                <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
                <View style={[styles.skeletonLine, styles.skeletonLineMid]} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 4. Fixed bottom button — never cut off */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>
              {current < TOTAL - 1 ? 'Đã hiểu' : 'Hoàn tất'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
  },
  progressSegActive: {
    backgroundColor: colors.primaryGreen,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 29,
    marginBottom: 16,
  },
  counterBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  desc: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  descHighlight: {
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongBadge: {
    backgroundColor: colors.error,
  },
  rightBadge: {
    backgroundColor: colors.success,
  },
  imgContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageRotated: {
    transform: [{ rotate: '90deg' }],
  },
  thumbGrid: {
    gap: 4,
    padding: 4,
    backgroundColor: colors.gray[50],
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 4,
  },
  thumbImage: {
    flex: 1,
    height: THUMB_H,
    borderRadius: 4,
  },
  skeletonLines: {
    padding: 8,
    gap: 5,
  },
  skeletonLine: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
  },
  skeletonLineWide: {
    width: '85%',
  },
  skeletonLineMid: {
    width: '65%',
  },
  skeletonLineShort: {
    width: '50%',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  confirmBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default ImageGuideModal;
