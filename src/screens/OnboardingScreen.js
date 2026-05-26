import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  Image, 
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import { ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Precision Playing Surfaces',
    description: 'Access the most elite synthetic and natural grass pitches vetted by pro scouts.',
    image: require('../assets/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Elite Club Membership',
    description: 'Unlock priority booking, premium locker rooms, and exclusive tournament entry.',
    image: require('../assets/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Kinetically Optimized',
    description: 'The fastest way to secure your spot and start playing. Performance at your fingertips.',
    image: require('../assets/onboarding1.png'), // Reusing or using another
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setCurrentIndex(Math.round(x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                i === currentIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>

        <PremiumButton 
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"} 
          onPress={handleNext}
          style={styles.button}
        />
        
        <TouchableOpacity 
          onPress={() => navigation.replace('Login')}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip introduction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.9,
    height: height * 0.45,
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 40,
    backgroundColor: Colors.surfaceContainerLow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 40,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  button: {
    width: '100%',
  },
  skipBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default OnboardingScreen;
