import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients } from '../theme';
import { Button } from '../components/atoms';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Chọn xe yêu thích',
    description: 'Tự do chọn xe mà bạn thích,\nhoặc đăng bán một cách dễ dàng',
    image: require('../assets/images/onboarding2.png'),
    isWelcome: false,
    subtitle: '',
  },
  {
    id: '2',
    title: 'Mua dễ dàng',
    description: 'Thao tác dễ dàng, nhận hàng\nliền tay',
    image: require('../assets/images/onboarding3.png'),
    isWelcome: false,
    subtitle: '',
  },
  {
    id: '3',
    title: 'Nhận hàng',
    description: 'Tận hưởng thời gian của bạn\nvới sản phẩm mà bạn tin\nmua',
    image: require('../assets/images/onboarding4.png'),
    isWelcome: false,
    subtitle: '',
  },
  {
    id: '4',
    title: 'BikeConnect',
    subtitle: '',
    description: '',
    image: require('../assets/images/logo.png'),
    topImage: require('../assets/images/onboarding5_top.png'),
    isWelcome: true,
  },
];

interface SlideProps {
  item: (typeof slides)[0] & { topImage?: any };
}

const Slide = ({ item }: SlideProps) => {
  return (
    <View style={styles.slide}>
      {/* Image Section */}
      <View
        style={[
          styles.imageContainer,
          item.isWelcome && styles.welcomeContainer,
        ]}
      >
        {item.isWelcome ? (
          <>
            <Image
              source={item.topImage}
              style={styles.welcomeTopImage}
              resizeMode="contain"
            />
            <Image
              source={item.image}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
          </>
        ) : (
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Text Section (only for non-welcome slides) */}
      {!item.isWelcome && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
    </View>
  );
};

interface FooterProps {
  currentSlideIndex: number;
  data: any[];
  skip: () => void;
  goToNextSlide: () => void;
  navigation: any;
}

const Footer = ({
  currentSlideIndex,
  data,
  skip,
  goToNextSlide,
  navigation,
}: FooterProps) => {
  return (
    <View style={styles.footer}>
      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {currentSlideIndex === data.length - 1 ? (
          <View style={styles.startButtonContainer}>
            <Button
              title="Bắt đầu"
              onPress={() => navigation.replace('Login')}
              fullWidth={false}
              style={styles.startButton}
              size="lg"
              textStyle={styles.startButtonText}
            />
          </View>
        ) : (
          <View style={styles.navigationButtons}>
            <Button
              title="Bỏ qua"
              onPress={skip}
              variant="white"
              size="md"
              style={styles.skipButton}
            />
            <View style={styles.spacer} />
            <Button
              title="Tiếp tục"
              onPress={goToNextSlide}
              variant="primary"
              size="md"
              style={styles.nextButton}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex !== slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const skip = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient
      colors={gradients.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={item => item.id}
      />
      <Footer
        currentSlideIndex={currentSlideIndex}
        data={slides}
        skip={skip}
        goToNextSlide={goToNextSlide}
        navigation={navigation}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
  image: {
    width: '80%',
    height: '60%',
  },
  welcomeContainer: {
    justifyContent: 'center',
    marginTop: 50,
  },
  welcomeTopImage: {
    width: '90%',
    height: '35%',
    marginBottom: 20,
  },
  welcomeLogo: {
    width: '100%',
    height: '60%',
    marginBottom: 20,
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
    width: 28,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  spacer: {
    width: 15,
  },
  startButtonContainer: {
    alignItems: 'center',
  },
  startButton: {
    width: '80%',
    borderRadius: 50,
    backgroundColor: colors.primaryGreen,
  },
  startButtonText: {
    fontWeight: 'bold',
  },
  skipButton: {
    flex: 1,
    borderRadius: 25,
  },
  nextButton: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: colors.primaryGreen,
  },
});

export default OnboardingScreen;
