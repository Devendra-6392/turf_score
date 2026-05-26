import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, 
  StatusBar, ActivityIndicator, Dimensions, FlatList, ImageBackground,
  Platform, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, MapPin, Star, QrCode, ChevronRight, Wallet
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://10.185.142.203:5000/api';
const BANNER_WIDTH = SCREEN_WIDTH - 40;
const AUTO_SCROLL_INTERVAL = 5000;

// ─── Sport Categories ───────────────────────────────────────
const SPORT_CATEGORIES = [
  { id: 'Football', name: 'Football', icon: '⚽' },
  { id: 'Cricket', name: 'Cricket', icon: '🏏' },
  { id: 'Tennis', name: 'Tennis', icon: '🎾' },
  { id: 'Basketball', name: 'Basketball', icon: '🏀' },
  { id: 'Badminton', name: 'Badminton', icon: '🏸' },
  { id: 'Volleyball', name: 'Volleyball', icon: '🏐' },
];

// ─── Banner Slide ───────────────────────────────────────────
const BannerSlide = memo(({ item, width }) => (
  <View style={[bannerStyles.slide, { width }]}>
    <Image source={{ uri: item.imageUrl }} style={bannerStyles.image} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={bannerStyles.gradient}
    />
    <View style={bannerStyles.textWrap}>
      <Text style={bannerStyles.title} numberOfLines={2}>{item.title}</Text>
    </View>
  </View>
));

const bannerStyles = StyleSheet.create({
  slide: {
    height: 170,
    borderRadius: 22,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '60%',
  },
  textWrap: {
    position: 'absolute',
    bottom: 18, left: 18, right: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
  },
});

// ─── Recommended Card ───────────────────────────────────────
const RecommendedCard = memo(({ turf, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.recCard}>
    <View style={styles.recImageContainer}>
      <Image 
        source={{ uri: turf.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }} 
        style={styles.recImage} 
      />
      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.65)']} 
        style={styles.recImageOverlay}
      />
      <View style={styles.recOverlayInfo}>
        <View style={styles.recDistanceBadge}>
          <MapPin size={10} color="#fff" />
          <Text style={styles.recDistanceText}>{turf.city || 'Nearby'}</Text>
        </View>
        <View style={styles.recRatingBadge}>
          <Star size={10} color="#FFD700" fill="#FFD700" />
          <Text style={styles.recRatingText}>{turf.rating || 4.5}</Text>
        </View>
      </View>
    </View>
    <View style={styles.recInfo}>
      <Text style={styles.recName} numberOfLines={1}>{turf.name}</Text>
      <View style={styles.recLocationRow}>
        <MapPin size={11} color={Colors.onSurfaceVariant} />
        <Text style={styles.recLocationText} numberOfLines={1}>
          {turf.location || turf.city || 'Unknown'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

// ─── Nearby Card ────────────────────────────────────────────
const NearbyCard = memo(({ turf, onPress }) => (
  <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.nearbyCard}>
    <Image 
      source={{ uri: turf.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80' }} 
      style={styles.nearbyImage}
    />
    <View style={styles.nearbyBottom}>
      <View style={styles.nearbyInfoLeft}>
        <Text style={styles.nearbyName} numberOfLines={1}>{turf.name}</Text>
        <View style={styles.nearbyLocationRow}>
          <MapPin size={12} color={Colors.onSurfaceVariant} />
          <Text style={styles.nearbyLocationText} numberOfLines={1}>
            {turf.location || turf.city || 'Unknown'}
          </Text>
        </View>
        <View style={styles.nearbyRatingRow}>
          <Star size={13} color="#FFD700" fill="#FFD700" />
          <Text style={styles.nearbyRating}>{turf.rating || 4.5}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookNowBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.bookNowText}>Book now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
));

// ─── Main HomeScreen ────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('Detecting...');

  const sliderRef = useRef(null);
  const timerRef = useRef(null);
  const userName = user?.name || user?.email?.split('@')[0] || 'Player';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshUser();
    });
    return unsubscribe;
  }, [navigation, refreshUser]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentLocation('Bangalore');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (geocode.length > 0) {
          let city = geocode[0].city || geocode[0].district || geocode[0].subregion;
          if (city) setCurrentLocation(city);
        }
      } catch (error) {
        console.log('Location error:', error);
        setCurrentLocation('Bangalore');
      }
    })();
  }, []);

  // ── Fetch turfs ──
  const fetchTurfs = useCallback(async () => {
    if (hasFetched) return;
    try {
      const response = await fetch(`${BACKEND_URL}/turfs`);
      const data = await response.json();
      setTurfs(data);
      setHasFetched(true);
    } catch (e) {
      console.log('Error fetching turfs', e);
    } finally {
      setLoadingTurfs(false);
    }
  }, [hasFetched]);

  // ── Fetch banners ──
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/banners`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch (e) {
      console.log('Error fetching banners', e);
    }
  }, []);

  useEffect(() => { fetchTurfs(); fetchBanners(); }, [fetchTurfs, fetchBanners]);

  // ── Banner auto-scroll ──
  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveSlide(prev => {
        const next = (prev + 1) % banners.length;
        sliderRef.current?.scrollToOffset({ offset: next * BANNER_WIDTH, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const onSliderScroll = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveSlide(index);
  }, []);

  // ── Category filter ──
  const filteredTurfs = selectedCategory
    ? turfs.filter(t => (t.category || 'Football').toLowerCase() === selectedCategory.toLowerCase())
    : turfs;

  const recommendedTurfs = filteredTurfs.slice(0, 6);
  const nearbyTurfs = filteredTurfs;

  const handleTurfPress = useCallback((turf) => {
    navigation.navigate('TurfDetail', { turf });
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search', { turfs });
  }, [navigation, turfs]);

  const handleCategoryPress = (catId) => {
    setSelectedCategory(prev => prev === catId ? null : catId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerDark} translucent={false} />
      
      {/* ── Top Header Background ── */}
      <View style={styles.headerBgShape} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerSafe}>
            <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <View style={styles.locationPill}>
                    <MapPin size={13} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.locationText} numberOfLines={1}>{currentLocation}</Text>
                  </View>
                </View>
                <View style={styles.headerRightActions}>
                  <View style={styles.walletPill}>
                    <Wallet size={13} color="#FFF" />
                    <Text style={styles.walletBalanceText}>₹{user?.wallet?.balance !== undefined ? Math.floor(user.wallet.balance) : '0'}</Text>
                  </View>
                  <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('QRScanner')} activeOpacity={0.8}>
                    <View style={styles.avatarPlaceholder}>
                      <QrCode size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress} activeOpacity={0.9}>
                <Search size={18} color="rgba(255,255,255,0.5)" />
                <Text style={styles.searchPlaceholder}>Search your next play</Text>
              </TouchableOpacity>
            </View>

        {/* ─── Category Chips ─── */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryStrip}
          >
            {SPORT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => handleCategoryPress(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Banner Slider ─── */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <FlatList
              ref={sliderRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <BannerSlide item={item} width={BANNER_WIDTH} />}
              onMomentumScrollEnd={onSliderScroll}
              snapToInterval={BANNER_WIDTH}
              decelerationRate="fast"
              getItemLayout={(_, index) => ({ length: BANNER_WIDTH, offset: BANNER_WIDTH * index, index })}
            />
            {banners.length > 1 && (
              <View style={styles.dotsContainer}>
                {banners.map((_, i) => (
                  <View key={i} style={[styles.dot, activeSlide === i && styles.activeDot]} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ─── Recommended Ground ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Ground</Text>
          <TouchableOpacity onPress={handleSearchPress}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>

        {loadingTurfs ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginVertical: 48 }} />
        ) : recommendedTurfs.length > 0 ? (
          <FlatList
            horizontal
            data={recommendedTurfs}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recList}
            renderItem={({ item }) => (
              <RecommendedCard turf={item} onPress={() => handleTurfPress(item)} />
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏟️</Text>
            <Text style={styles.emptyTitle}>No turfs found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory ? `No ${selectedCategory.toLowerCase()} turfs yet.` : 'No turfs available.'}
            </Text>
          </View>
        )}

        {/* ─── Near By ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Near by</Text>
          <TouchableOpacity onPress={handleSearchPress}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>

        {!loadingTurfs && nearbyTurfs.length > 0 ? (
          nearbyTurfs.map((turf) => (
            <NearbyCard key={turf.id} turf={turf} onPress={() => handleTurfPress(turf)} />
          ))
        ) : !loadingTurfs ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyTitle}>No nearby turfs</Text>
          </View>
        ) : null}

      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 14) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },

  // ── Header ──
  headerBgShape: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 220,
    backgroundColor: Colors.headerDark,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerSafe: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  avatarBtn: {
    width: 48, height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  walletBalanceText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  // ── Search ──
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchPlaceholder: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    flex: 1,
  },

  // ── Categories ──
  categorySection: { marginTop: 20 },
  categoryStrip: { paddingHorizontal: 20, gap: 10 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  categoryEmoji: { fontSize: 18 },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  categoryTextActive: { color: '#fff' },

  // ── Banner ──
  bannerSection: {
    marginTop: 22,
    marginHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.outline,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  // ── Section Headers ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },

  // ── Recommended Cards ──
  recList: { paddingHorizontal: 20, gap: 14 },
  recCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  recImageContainer: { height: 130, position: 'relative' },
  recImage: { width: '100%', height: '100%' },
  recImageOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 60,
  },
  recOverlayInfo: {
    position: 'absolute',
    bottom: 8, left: 8, right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recDistanceText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  recRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recRatingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  recInfo: { padding: 12 },
  recName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  recLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recLocationText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },

  // ── Nearby Cards ──
  nearbyCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  nearbyImage: { width: '100%', height: 170 },
  nearbyBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  nearbyInfoLeft: { flex: 1, marginRight: 12 },
  nearbyName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  nearbyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  nearbyLocationText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  nearbyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyRating: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  bookNowBtn: {
    backgroundColor: Colors.headerDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Empty ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default memo(HomeScreen);