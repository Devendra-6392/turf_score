import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ─── Floating Particle Component ────────────────────────────────
const FloatingParticle = ({ delay, startX, startY, size, color, duration }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: duration * 0.6,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(translateY, {
            toValue: -height * 0.4,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() > 0.5 ? 30 : -30,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: Math.random() > 0.5 ? -20 : 20,
              duration: duration * 0.5,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.2,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.3,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
};

// ─── Pulsating Ring Component ───────────────────────────────────
const PulsatingRing = ({ delay, maxSize, color }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 3000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 3000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: maxSize,
          height: maxSize,
          borderRadius: maxSize / 2,
          borderColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

// ─── Main Splash Screen ─────────────────────────────────────────
const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  // Main animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(40)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const spotlightOpacity = useRef(new Animated.Value(0)).current;
  const versionOpacity = useRef(new Animated.Value(0)).current;

  // Letter animations for "TURF SCORE"
  const letters = 'TURF SCORE'.split('');
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;
  const letterYAnims = useRef(letters.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    // Stage 1: Background fade-in + Spotlight
    Animated.sequence([
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(spotlightOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // Stage 2: Logo entrance with dramatic spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 8,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // Stage 3: Logo glow pulse
      Animated.timing(logoGlow, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Stage 4: Title letter-by-letter reveal
      Animated.stagger(
        50,
        letters.map((_, i) =>
          Animated.parallel([
            Animated.timing(letterAnims[i], {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(letterYAnims[i], {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
          ])
        )
      ),

      // Stage 5: Decorative line expand
      Animated.spring(lineWidth, {
        toValue: 1,
        tension: 15,
        friction: 5,
        useNativeDriver: true,
      }),

      // Stage 6: Tagline slide up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(taglineTranslateY, {
          toValue: 0,
          tension: 15,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),

      // Stage 7: Bottom elements
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(versionOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous logo breathing glow
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    setTimeout(() => glowLoop.start(), 3500);
  }, []);

  // Navigation logic
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [loading, user, navigation]);

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Generate particles
  const particles = [];
  const particleColors = [
    'rgba(75, 122, 47, 0.6)',
    'rgba(139, 195, 74, 0.5)',
    'rgba(107, 142, 35, 0.4)',
    'rgba(255, 215, 0, 0.3)',
    'rgba(255, 255, 255, 0.2)',
  ];
  for (let i = 0; i < 20; i++) {
    particles.push(
      <FloatingParticle
        key={i}
        delay={Math.random() * 3000}
        startX={Math.random() * width}
        startY={height * 0.5 + Math.random() * height * 0.5}
        size={Math.random() * 6 + 2}
        color={particleColors[Math.floor(Math.random() * particleColors.length)]}
        duration={3000 + Math.random() * 4000}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Deep dark gradient background */}
      <LinearGradient
        colors={['#050A02', '#0D1A06', '#0A1205', '#060D03']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Spotlight glow effect */}
      <Animated.View style={[styles.spotlightContainer, { opacity: spotlightOpacity }]}>
        <View style={styles.spotlightTop} />
        <View style={styles.spotlightBottom} />
      </Animated.View>

      {/* Floating particles */}
      <Animated.View style={[styles.particleContainer, { opacity: bgOpacity }]}>
        {particles}
      </Animated.View>

      {/* Pulsating rings behind logo */}
      <View style={styles.ringsContainer}>
        <PulsatingRing delay={500} maxSize={300} color="rgba(75, 122, 47, 0.15)" />
        <PulsatingRing delay={1500} maxSize={250} color="rgba(139, 195, 74, 0.1)" />
        <PulsatingRing delay={2500} maxSize={350} color="rgba(75, 122, 47, 0.08)" />
      </View>

      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoOuterGlow,
            {
              opacity: logoGlow,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoGlowRing} />
        </Animated.View>

        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: logoSpin },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#5C9A36', '#4B7A2F', '#3A5F24']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoInner}>
              <Text style={styles.logoT}>T</Text>
              <Text style={styles.logoS}>S</Text>
            </View>
            {/* Corner accents */}
            <View style={[styles.cornerAccent, styles.cornerTL]} />
            <View style={[styles.cornerAccent, styles.cornerBR]} />
          </LinearGradient>
        </Animated.View>

        {/* App Name - Letter by letter */}
        <View style={styles.titleContainer}>
          {letters.map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.titleLetter,
                letter === ' ' && styles.titleSpace,
                {
                  opacity: letterAnims[index],
                  transform: [{ translateY: letterYAnims[index] }],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        {/* Decorative line */}
        <Animated.View
          style={[
            styles.decorativeLine,
            {
              transform: [{ scaleX: lineWidth }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', '#4B7A2F', '#8BC34A', '#4B7A2F', 'transparent']}
            style={styles.lineGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          {/* Center diamond */}
          <View style={styles.lineDiamond} />
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
        >
          <Text style={styles.tagline}>PREMIUM SPORTS BOOKING</Text>
        </Animated.View>
      </View>

      {/* Bottom section */}
      <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
        {/* Animated loading dots */}
        <LoadingDots />
        <Animated.Text style={[styles.versionText, { opacity: versionOpacity }]}>
          v1.0.0
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

// ─── Loading Dots Component ─────────────────────────────────────
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    setTimeout(animateDots, 3500);
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1, backgroundColor: '#4B7A2F' }]} />
      <Animated.View style={[styles.dot, { opacity: dot2, backgroundColor: '#6B8E23' }]} />
      <Animated.View style={[styles.dot, { opacity: dot3, backgroundColor: '#8BC34A' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A02',
  },
  spotlightContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTop: {
    position: 'absolute',
    top: -height * 0.2,
    width: width * 1.5,
    height: height * 0.7,
    borderRadius: width,
    backgroundColor: 'rgba(75, 122, 47, 0.06)',
  },
  spotlightBottom: {
    position: 'absolute',
    bottom: -height * 0.3,
    width: width * 2,
    height: height * 0.6,
    borderRadius: width,
    backgroundColor: 'rgba(75, 122, 47, 0.04)',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  ringsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: -60,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  // Logo
  logoOuterGlow: {
    position: 'absolute',
    top: height * 0.5 - 130 - 60,
    alignSelf: 'center',
  },
  logoGlowRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(75, 122, 47, 0.15)',
    shadowColor: '#4B7A2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#4B7A2F',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  logoGradient: {
    width: 130,
    height: 130,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoT: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -2,
  },
  logoS: {
    fontSize: 38,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: -4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cornerAccent: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  // Title
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  titleLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: 'rgba(75, 122, 47, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleSpace: {
    width: 12,
  },
  // Decorative line
  decorativeLine: {
    width: width * 0.5,
    height: 2,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineGradient: {
    width: '100%',
    height: 1.5,
    position: 'absolute',
  },
  lineDiamond: {
    width: 8,
    height: 8,
    backgroundColor: '#8BC34A',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#8BC34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  // Tagline
  tagline: {
    fontSize: 13,
    color: 'rgba(139, 195, 74, 0.8)',
    letterSpacing: 5,
    fontWeight: '500',
  },
  // Bottom
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 2,
    fontWeight: '400',
  },
});

export default SplashScreen;
