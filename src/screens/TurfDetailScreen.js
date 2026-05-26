import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Platform, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, MapPin, Clock, Users, Wifi, ShieldCheck, Coffee, Zap, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://10.185.142.203:5000/api';

// ─── Amenity Icon Mapper ────────────────────────────────────
const AMENITY_DATA = {
  'Wifi': { icon: '📶', label: 'Free Wifi' },
  'Shower': { icon: '🚿', label: 'Shower' },
  'Cafeteria': { icon: '☕', label: 'Cafeteria' },
  'Parking': { icon: '🅿️', label: 'Parking' },
  'Floodlights': { icon: '💡', label: 'LED Floodlights' },
  'Beverages': { icon: '🥤', label: 'Beverages' },
  'Locker Room': { icon: '🔒', label: 'Locker Room' },
  'Equipment Rental': { icon: '🏋️', label: 'Equipment' },
  'First Aid': { icon: '🩹', label: 'First Aid' },
  'Synthetic Grass': { icon: '🌿', label: 'Synthetic Grass' },
};

// ─── Amenity Chip ───────────────────────────────────────────
const AmenityChip = memo(({ name }) => {
  const data = AMENITY_DATA[name] || { icon: '✨', label: name };
  return (
    <View style={styles.amenityChip}>
      <Text style={styles.amenityIcon}>{data.icon}</Text>
      <Text style={styles.amenityLabel}>{data.label}</Text>
    </View>
  );
});

const TurfDetailScreen = ({ route, navigation }) => {
  const { turf } = route.params || {};
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, token } = useAuth();

  // ── Header opacity ──
  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // ── Image parallax ──
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [50, 0, -60],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolateRight: 'clamp',
  });

  const handleBookSlot = useCallback(() => {
    navigation.navigate('BookSlot', { turf });
  }, [navigation, turf]);

  // Build amenities array
  const amenities = turf?.amenities && Array.isArray(turf.amenities) && turf.amenities.length > 0
    ? turf.amenities
    : ['Synthetic Grass', 'Floodlights', 'Parking', 'Wifi', 'Beverages', 'First Aid'];

  // Multiple images
  const images = turf?.images && Array.isArray(turf.images) && turf.images.length > 0
    ? turf.images
    : [turf?.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Sticky Header ── */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <View style={styles.stickyBg} />
        <View style={styles.stickyContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackBtn}>
            <ArrowLeft size={22} color={Colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.stickyTitle} numberOfLines={1}>{turf?.name || 'Turf Details'}</Text>
          <View style={{ width: 44 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ─── Hero Image with Parallax ─── */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: images[0] }}
            style={[styles.heroImage, { transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(26,26,26,0.9)']}
            locations={[0, 0.3, 1]}
            style={styles.heroGradient}
          />
          {/* Top Controls */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.heroBackBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Turf Details</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Bottom Hero Info */}
          <View style={styles.heroBottomInfo}>
            <View style={styles.heroRatingRow}>
              <View style={styles.heroBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.heroBadgeText}>{turf?.rating || 4.5}</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: 'rgba(75,122,47,0.85)' }]}>
                <MapPin size={12} color="#fff" />
                <Text style={styles.heroBadgeText}>{turf?.city || 'Nearby'}</Text>
              </View>
            </View>
            <Text style={styles.heroTurfName}>{turf?.name || 'Loading...'}</Text>
            <View style={styles.heroLocationRow}>
              <MapPin size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroLocationText}>{turf?.location || 'Unknown Location'}</Text>
            </View>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Users size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroStatText}>1k+ Booked</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <Text style={styles.heroPrice}>₹{turf?.pricePerHour || 3500}<Text style={styles.heroPriceUnit}>/hr</Text></Text>
            </View>
          </View>
        </View>

        {/* ─── Content Card ─── */}
        <View style={styles.contentCard}>
          {/* About Section */}
          <Text style={styles.sectionTitle}>About This Turf</Text>
          <Text style={styles.descriptionText}>
            {turf?.description || 'Experience play on our world-class FIFA-pro synthetic grass. Perfect for high-intensity matches with advanced lighting and premium facilities.'}
          </Text>

          {/* Amenities Grid */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {amenities.map((item, i) => (
              <AmenityChip key={i} name={item} />
            ))}
          </View>

          {/* Gallery Preview */}
          {images.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {images.map((img, i) => (
                  <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
                ))}
              </ScrollView>
            </>
          )}

          {/* Safety Guidelines */}
          {turf?.safetyGuidelines && (
            <>
              <Text style={styles.sectionTitle}>Safety Guidelines</Text>
              <View style={styles.safetyBox}>
                <ShieldCheck size={18} color={Colors.primary} />
                <Text style={styles.safetyText}>{turf.safetyGuidelines}</Text>
              </View>
            </>
          )}

          {/* Bottom spacer for fixed footer */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* ─── Fixed Bottom Bar ─── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Starting from</Text>
          <Text style={styles.footerPrice}>₹{turf?.pricePerHour || 3500}<Text style={styles.footerPriceUnit}>/hr</Text></Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookSlot} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book Now</Text>
          <View style={styles.bookBtnArrow}>
            <ChevronRight size={20} color={Colors.primary} />
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

  // ── Sticky Header ──
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 56 : 100,
    zIndex: 10,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  stickyBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyBackBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  // ── Hero Image ──
  heroContainer: {
    height: 420,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '120%',
    position: 'absolute',
    top: -40,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopRow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 55,
    left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  heroBackBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroBottomInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroRatingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroTurfName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  heroLocationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroStatText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroStatDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  heroPriceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },

  // ── Content Card ──
  contentCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 14,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 24,
  },

  // ── Amenities Grid ──
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    minWidth: (SCREEN_WIDTH - 44 - 10) / 2 - 1,
  },
  amenityIcon: {
    fontSize: 20,
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
    flex: 1,
  },

  // ── Gallery ──
  gallery: {
    marginBottom: 24,
    marginHorizontal: -22,
    paddingLeft: 22,
  },
  galleryImage: {
    width: 200,
    height: 130,
    borderRadius: 16,
    marginRight: 12,
  },

  // ── Safety Box ──
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'android' ? 20 : 34,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  footerLeft: {},
  footerLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.onBackground,
  },
  footerPriceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.headerDark,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bookBtnArrow: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#8BC34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TurfDetailScreen;
