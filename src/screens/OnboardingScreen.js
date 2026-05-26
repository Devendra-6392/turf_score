import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  Image, 
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Precision Playing Surfaces',
    description: 'Access the most elite synthetic and natural grass pitches vetted by pro scouts.',
  },
  {
    id: '2',
    title: 'Elite Club Membership',
    description: 'Unlock priority booking, premium locker rooms, and exclusive tournament entry.',
  },
  {
    id: '3',
    title: 'Kinetically Optimized',
    description: 'The fastest way to secure your spot and start playing. Performance at your fingertips.',
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Wavy header topography pattern */}
      <View style={styles.topHeaderContainer}>
        <Image 
          source={require('../assets/green_topography.png')} 
          style={styles.headerPattern} 
          resizeMode="cover"
        />
      </View>

      {/* Slide Text Content */}
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
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        style={styles.flatList}
      />

      {/* Footer containing pagination & continue button */}
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

        <TouchableOpacity 
          onPress={handleNext}
          style={styles.continueRow}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <View style={styles.continueCircle}>
            <ChevronRight size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeaderContainer: {
    width: '100%',
    height: height * 0.55,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    width: '100%',
    height: '100%',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingTop: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.onBackground,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    backgroundColor: Colors.background,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.outline,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  continueText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  continueCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default OnboardingScreen;
