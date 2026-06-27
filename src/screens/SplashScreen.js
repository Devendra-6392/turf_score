import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Brand Colors
const BRAND = {
  neonGreen: '#A8FF00',
  limeGreen: '#7CFF00',
  green: '#00B51E',
  dark: '#0D1117',
  white: '#FFFFFF',
};

// ─── Main Splash Screen ──────────────────────────────────────
const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  // ── Phase 1: Speed (horizontal speed lines streak in) ──
  const speedLine1X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine2X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine3X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine4X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine5X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine6X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLine7X = useRef(new Animated.Value(-width * 1.5)).current;
  const speedLinesOpacity = useRef(new Animated.Value(0)).current;

  // ── Phase 2: Shape Forming (S shape scales + rotates in) ──
  const sShapeScale = useRef(new Animated.Value(0)).current;
  const sShapeOpacity = useRef(new Animated.Value(0)).current;
  const sShapeRotate = useRef(new Animated.Value(0)).current;

  // ── Phase 3: Player Appears (full logo image fades in) ──
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  // ── Phase 4: Logo Complete (text + tagline reveal) ──
  const brandTextOpacity = useRef(new Animated.Value(0)).current;
  const brandTextY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;

  // ── Background ──
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const bgScale = useRef(new Animated.Value(1.1)).current;

  // ── Glow effect ──
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;

  // ── Loader ──
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderRotate = useRef(new Animated.Value(0)).current;

  // ── Continuous logo pulse ──
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Speed line stagger delays
    const speedLineDuration = 500;
    const stagger = 60;

    Animated.sequence([
      // ═══ PHASE 0: Background reveals ═══
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bgScale, { toValue: 1, duration: 2500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      // ═══ PHASE 1: SPEED — Horizontal speed lines streak across ═══
      Animated.timing(speedLinesOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.stagger(stagger, [
        Animated.timing(speedLine1X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine2X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine3X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine4X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine5X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine6X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(speedLine7X, { toValue: width * 2, duration: speedLineDuration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      // ═══ PHASE 2: SHAPE FORMING — S shape bursts in ═══
      Animated.parallel([
        Animated.spring(sShapeScale, { toValue: 1, tension: 10, friction: 4, useNativeDriver: true }),
        Animated.timing(sShapeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(sShapeRotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
        // Glow behind S
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.spring(glowScale, { toValue: 1.2, tension: 8, friction: 5, useNativeDriver: true }),
        ]),
      ]),

      Animated.delay(200),

      // ═══ PHASE 3: PLAYER APPEARS — Full logo replaces S shape ═══
      Animated.parallel([
        // Fade out simple S, fade in full logo
        Animated.timing(sShapeOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 12, friction: 5, useNativeDriver: true }),
      ]),

      Animated.delay(300),

      // ═══ PHASE 4: LOGO COMPLETE — Brand text + tagline ═══
      Animated.parallel([
        Animated.timing(brandTextOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(brandTextY, { toValue: 0, tension: 16, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(taglineY, { toValue: 0, tension: 16, friction: 7, useNativeDriver: true }),
        Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous logo pulse (breathe effect)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoPulse, { toValue: 1.04, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(logoPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 3000);

    // Continuous glow pulse
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.8, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 2500);

    // Loader rotation
    setTimeout(() => {
      Animated.loop(
        Animated.timing(loaderRotate, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      ).start();
    }, 3500);
  }, []);

  // Navigation
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigation.replace(user ? 'Main' : 'Onboarding');
    }, 5000);
    return () => clearTimeout(t);
  }, [loading, user, navigation]);

  const sRotation = sShapeRotate.interpolate({ inputRange: [0, 1], outputRange: ['-45deg', '0deg'] });
  const loaderSpin = loaderRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Speed line data (y positions and widths relative to center)
  const speedLineData = [
    { y: -36, w: 100, h: 3.5, ref: speedLine1X },
    { y: -24, w: 130, h: 3, ref: speedLine2X },
    { y: -12, w: 90, h: 4, ref: speedLine3X },
    { y: 0, w: 150, h: 4.5, ref: speedLine4X },
    { y: 12, w: 110, h: 3, ref: speedLine5X },
    { y: 24, w: 80, h: 3.5, ref: speedLine6X },
    { y: 36, w: 120, h: 2.5, ref: speedLine7X },
  ];

  return (
    <View style={s.root}>
      {/* ── Splash background image (stadium) ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity, transform: [{ scale: bgScale }] }]}>
        <Image
          source={require('../../assets/splash-bg.png')}
          style={s.bgImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── Dark overlay to ensure text is readable ── */}
      <View style={s.darkOverlay} />

      {/* ── PHASE 1: Speed Lines ── */}
      <Animated.View style={[s.speedLinesContainer, { opacity: speedLinesOpacity }]}>
        {speedLineData.map((line, i) => (
          <Animated.View
            key={i}
            style={[
              s.speedLine,
              {
                top: height * 0.38 + line.y,
                width: line.w,
                height: line.h,
                transform: [{ translateX: line.ref }],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* ── Main Content ── */}
      <View style={s.content}>
        {/* ── Glow behind logo ── */}
        <Animated.View style={[s.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

        {/* ── PHASE 2: S Shape Forming (green S text) ── */}
        <Animated.View
          style={[
            s.sShapeWrap,
            {
              opacity: sShapeOpacity,
              transform: [{ scale: sShapeScale }, { rotate: sRotation }],
            },
          ]}
        >
          <Text style={s.sShape}>S</Text>
        </Animated.View>

        {/* ── PHASE 3: Full Logo (player + S from your exact image) ── */}
        <Animated.View
          style={[
            s.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, logoPulse) }],
            },
          ]}
        >
          <Image
            source={require('../../assets/splash-icon.jpg')}
            style={s.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── PHASE 4: Brand Text ── */}
        <Animated.View style={[s.brandRow, { opacity: brandTextOpacity, transform: [{ translateY: brandTextY }] }]}>
          <Text style={s.brandWhite}>SKIP</Text>
          <Text style={s.brandGreen}>E</Text>
          <Text style={s.brandWhite}>RS</Text>
        </Animated.View>

        {/* ── Tagline ── */}
        <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
          <Text style={s.tagline}>PLAY MORE. BOOK EASY.</Text>
        </Animated.View>
      </View>

      {/* ── Bottom Loader ── */}
      <Animated.View style={[s.bottom, { opacity: loaderOpacity }]}>
        <View style={s.loaderWrap}>
          <Animated.View style={[s.loaderTrack, { transform: [{ rotate: loaderSpin }] }]} />
          <View style={s.loaderDimTrack} />
        </View>
        <Text style={s.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.dark,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,17,23,0.3)',
  },
  // Speed lines
  speedLinesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  speedLine: {
    position: 'absolute',
    left: 0,
    borderRadius: 2,
    backgroundColor: BRAND.neonGreen,
    shadowColor: BRAND.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  // Glow
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168,255,0,0.12)',
    shadowColor: BRAND.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 80,
    elevation: 0,
  },
  // Phase 2: S Shape
  sShapeWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sShape: {
    fontSize: 140,
    fontWeight: '900',
    color: BRAND.neonGreen,
    fontStyle: 'italic',
    textShadowColor: 'rgba(168,255,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  // Phase 3: Full Logo
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: width * 0.55,
    height: width * 0.55,
  },
  // Phase 4: Brand text
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  brandWhite: {
    fontSize: 36,
    fontWeight: '900',
    color: BRAND.white,
    letterSpacing: 6,
    fontStyle: 'italic',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  brandGreen: {
    fontSize: 36,
    fontWeight: '900',
    color: BRAND.neonGreen,
    letterSpacing: 6,
    fontStyle: 'italic',
    textShadowColor: 'rgba(168,255,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  // Tagline
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4,
    marginTop: 10,
  },
  // Bottom
  bottom: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loaderWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loaderDimTrack: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  loaderTrack: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: BRAND.neonGreen,
    borderRightColor: 'rgba(168,255,0,0.3)',
  },
  version: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.12)',
    letterSpacing: 2.5,
    fontWeight: '400',
  },
});

export default SplashScreen;