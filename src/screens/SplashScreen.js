import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ─── Elegant Orb (background ambient glow) ──────────────────────
const AmbientOrb = ({ cx, cy, radius, color, delay, duration }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: duration * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: duration * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.1, duration: duration * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.85, duration: duration * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cx - radius,
        top: cy - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ─── Expanding Ring ──────────────────────────────────────────────
const ExpandingRing = ({ size, color, delay }) => {
  const scale = useRef(new Animated.Value(0.1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 2800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.6, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 2400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ─── Floating Mote ───────────────────────────────────────────────
const Mote = ({ x, y, size, delay }) => {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(ty, { toValue: -height * 0.35, duration: 5000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.7, duration: 800, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#A8E063',
        opacity: op,
        transform: [{ translateY: ty }],
      }}
    />
  );
};

// ─── Main Splash Screen ──────────────────────────────────────────
const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  // Master timeline refs
  const masterFade = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.3)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemRotate = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(24)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(12)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeY = useRef(new Animated.Value(16)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  // Continuous emblem glow
  const emblemGlow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Scene fade in
      Animated.timing(masterFade, { toValue: 1, duration: 700, useNativeDriver: true }),

      // 2. Emblem burst in
      Animated.parallel([
        Animated.spring(emblemScale, { toValue: 1, tension: 9, friction: 4, useNativeDriver: true }),
        Animated.timing(emblemOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(emblemRotate, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ]),

      // 3. Short breathe
      Animated.delay(100),

      // 4. Wordmark slides up
      Animated.parallel([
        Animated.timing(wordmarkOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(wordmarkY, { toValue: 0, tension: 18, friction: 6, useNativeDriver: true }),
      ]),

      // 5. Divider draws
      Animated.timing(dividerWidth, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),

      // 6. Subtitle
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(subtitleY, { toValue: 0, tension: 18, friction: 7, useNativeDriver: true }),
      ]),

      // 7. Badge + loader
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(badgeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(badgeY, { toValue: 0, tension: 16, friction: 7, useNativeDriver: true }),
        Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous emblem glow breathe
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emblemGlow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(emblemGlow, { toValue: 0.5, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 2000);
  }, []);

  // Navigation
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigation.replace(user ? 'Main' : 'Onboarding');
    }, 4800);
    return () => clearTimeout(t);
  }, [loading, user, navigation]);

  const spin = emblemRotate.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  // Motes
  const motes = Array.from({ length: 18 }).map((_, i) => (
    <Mote
      key={i}
      x={Math.random() * width}
      y={height * 0.4 + Math.random() * height * 0.5}
      size={Math.random() * 4 + 1.5}
      delay={Math.random() * 4000}
    />
  ));

  return (
    <View style={s.root}>
      {/* ── Background ── */}
      <LinearGradient
        colors={['#040C02', '#071405', '#040C02']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* ── Ambient orbs ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: masterFade }]}>
        <AmbientOrb cx={width * 0.15} cy={height * 0.2} radius={180} color="rgba(80,140,40,0.07)" delay={0} duration={5000} />
        <AmbientOrb cx={width * 0.85} cy={height * 0.75} radius={200} color="rgba(60,110,30,0.06)" delay={600} duration={6000} />
        <AmbientOrb cx={width * 0.5} cy={height * 0.5} radius={260} color="rgba(100,180,50,0.04)" delay={1200} duration={7000} />
      </Animated.View>

      {/* ── Motes ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: masterFade }]}>
        {motes}
      </Animated.View>

      {/* ── Main content ── */}
      <Animated.View style={[s.content, { opacity: masterFade }]}>

        {/* Expanding rings behind emblem */}
        <View style={s.ringsWrap}>
          <ExpandingRing size={320} color="rgba(100,180,50,0.18)" delay={1200} />
          <ExpandingRing size={260} color="rgba(80,140,40,0.22)" delay={2000} />
          <ExpandingRing size={200} color="rgba(120,200,60,0.15)" delay={2800} />
        </View>

        {/* Outer glow halo */}
        <Animated.View style={[s.halo, { opacity: emblemGlow }]} />

        {/* Emblem */}
        <Animated.View style={{ transform: [{ scale: emblemScale }, { rotate: spin }], opacity: emblemOpacity }}>
          <LinearGradient
            colors={['#1E3A10', '#2C5618', '#1E3A10']}
            style={s.emblemBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Inner shine top */}
            <View style={s.emblemShine} />

            {/* Hexagon-feel border */}
            <View style={s.emblemBorder} />

            {/* Icon: stylized pitch/field lines */}
            <View style={s.fieldWrap}>
              {/* Outer boundary */}
              <View style={s.fieldOuter}>
                {/* Centre circle */}
                <View style={s.fieldCircle} />
                {/* Halfway line */}
                <View style={s.fieldMidLine} />
                {/* Penalty arcs (left & right) */}
                <View style={[s.fieldArc, s.fieldArcL]} />
                <View style={[s.fieldArc, s.fieldArcR]} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Wordmark */}
        <Animated.View style={{ opacity: wordmarkOpacity, transform: [{ translateY: wordmarkY }], alignItems: 'center', marginTop: 38 }}>
          <View style={s.wordmarkRow}>
            <Text style={s.wordmarkMain}>TURF</Text>
            <Text style={s.wordmarkAccent}> SCORE</Text>
          </View>
        </Animated.View>

        {/* Divider */}
        <Animated.View style={[s.dividerWrap, { transform: [{ scaleX: dividerWidth }] }]}>
          <LinearGradient
            colors={['transparent', 'rgba(130,200,60,0.7)', 'rgba(168,224,99,1)', 'rgba(130,200,60,0.7)', 'transparent']}
            style={s.divider}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View style={s.dividerGem} />
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[s.subtitle, { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
          PREMIUM SPORTS BOOKING
        </Animated.Text>

        {/* Badge pill */}
        <Animated.View style={[s.badge, { opacity: badgeOpacity, transform: [{ translateY: badgeY }] }]}>
          <View style={s.badgeDot} />
          <Text style={s.badgeText}>Book · Play · Compete</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Bottom loader ── */}
      <Animated.View style={[s.bottom, { opacity: loaderOpacity }]}>
        <ArcLoader />
        <Text style={s.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

// ─── Arc Loader ──────────────────────────────────────────────────
const ArcLoader = () => {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
      ).start();
    }, 3800);
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={arc.wrap}>
      <Animated.View style={[arc.track, { transform: [{ rotate: spin }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(130,200,60,0.0)', 'rgba(168,224,99,0.9)']}
          style={arc.fill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {/* Static dim track */}
      <View style={arc.dimTrack} />
    </View>
  );
};

const arc = StyleSheet.create({
  wrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dimTrack: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  track: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#A8E063',
    borderRightColor: 'rgba(168,224,99,0.4)',
  },
  fill: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

// ─── Styles ───────────────────────────────────────────────────────
const EMBLEM = 140;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040C02',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  // Rings
  ringsWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: height * 0.5 - 160 - 60,
    alignSelf: 'center',
  },
  // Halo
  halo: {
    position: 'absolute',
    width: EMBLEM + 80,
    height: EMBLEM + 80,
    borderRadius: (EMBLEM + 80) / 2,
    backgroundColor: 'rgba(80,160,40,0.12)',
    shadowColor: '#7EC83A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 0,
  },
  // Emblem
  emblemBg: {
    width: EMBLEM,
    height: EMBLEM,
    borderRadius: EMBLEM * 0.22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#4A9020',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 30,
  },
  emblemShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: EMBLEM * 0.45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomLeftRadius: EMBLEM,
    borderBottomRightRadius: EMBLEM,
  },
  emblemBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: EMBLEM * 0.22,
    borderWidth: 1.5,
    borderColor: 'rgba(168,224,99,0.25)',
  },
  // Field icon inside emblem
  fieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldOuter: {
    width: 86,
    height: 62,
    borderWidth: 2,
    borderColor: 'rgba(168,224,99,0.75)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fieldCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(168,224,99,0.7)',
  },
  fieldMidLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(168,224,99,0.5)',
  },
  fieldArc: {
    position: 'absolute',
    width: 22,
    height: 36,
    borderWidth: 2,
    borderColor: 'rgba(168,224,99,0.5)',
  },
  fieldArcL: {
    left: -12,
    borderRadius: 0,
    borderTopRightRadius: 36,
    borderBottomRightRadius: 36,
    borderLeftWidth: 0,
  },
  fieldArcR: {
    right: -12,
    borderRadius: 0,
    borderTopLeftRadius: 36,
    borderBottomLeftRadius: 36,
    borderRightWidth: 0,
  },
  // Wordmark
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkMain: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 10,
    textShadowColor: 'rgba(120,200,60,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  wordmarkAccent: {
    fontSize: 40,
    fontWeight: '200',
    color: '#A8E063',
    letterSpacing: 10,
    textShadowColor: 'rgba(120,200,60,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  // Divider
  dividerWrap: {
    width: width * 0.55,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  divider: {
    width: '100%',
    height: 1,
  },
  dividerGem: {
    width: 7,
    height: 7,
    backgroundColor: '#A8E063',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#A8E063',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Subtitle
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(168,224,99,0.65)',
    letterSpacing: 6,
  },
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(168,224,99,0.18)',
    backgroundColor: 'rgba(168,224,99,0.06)',
    gap: 8,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#A8E063',
    shadowColor: '#A8E063',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(168,224,99,0.7)',
    letterSpacing: 2.5,
  },
  // Bottom
  bottom: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 2.5,
    fontWeight: '400',
  },
});

export default SplashScreen;