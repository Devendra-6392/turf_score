import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Dimensions, FlatList, ImageBackground,
  Platform, Animated, Modal, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search, MapPin, Star, QrCode, ChevronRight, Wallet, Bell,
  Trophy, CheckCircle2, Calendar, AlertCircle, ArrowLeft, X, Compass
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';
const BANNER_WIDTH = SCREEN_WIDTH - 40;
const AUTO_SCROLL_INTERVAL = 5000;
const HEADER_MAX_HEIGHT = 145;
const HEADER_MIN_HEIGHT = 76;

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

// ─── Nearby Card (Reduced Height) ────────────────────────────
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
          <MapPin size={11} color={Colors.onSurfaceVariant} />
          <Text style={styles.nearbyLocationText} numberOfLines={1}>
            {turf.location || turf.city || 'Unknown'}
          </Text>
        </View>
        <View style={styles.nearbyRatingRow}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.nearbyRating}>{turf.rating || 4.5}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookNowBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.bookNowText}>Book</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
));

// ─── Main HomeScreen ────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { user, refreshUser, token } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('Detecting...');

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Animation for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const sliderRef = useRef(null);
  const timerRef = useRef(null);
  const userName = user?.name || user?.email?.split('@')[0] || 'Player';

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - 30, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshUser();
      if (token) {
        fetchNotifications();
      }
    });
    return unsubscribe;
  }, [navigation, refreshUser, token]);

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

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoadingNotifications(true);
    try {
      const res = await fetch(`${BACKEND_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.log('Error fetching notifications', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTurfs();
    fetchBanners();
    fetchNotifications();
  }, [fetchTurfs, fetchBanners, fetchNotifications]);

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



  const openNotifications = () => {
    setShowNotifications(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (item) => {
    if (!item.isRead) {
      try {
        await fetch(`${BACKEND_URL}/notifications/${item.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      } catch (err) { }
    }

    if (item.type === 'CHALLENGE_CREATED' && item.data?.shareCode) {
      setShowNotifications(false);
      setTimeout(() => {
        navigation.navigate('ChallengeDetailByShare', { shareCode: item.data.shareCode });
      }, 300);
    } else if (item.type === 'CHALLENGE_ACCEPTED' && item.data?.challengeId) {
      setShowNotifications(false);
      setTimeout(() => {
        navigation.navigate('ChallengeDetail', { challengeId: item.data.challengeId });
      }, 300);
    }
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'CHALLENGE_CREATED':
      case 'CHALLENGE_ACCEPTED': return <Trophy size={20} color={Colors.primary} />;
      case 'BOOKING_CONFIRMATION':
      case 'PAYMENT_SUCCESS': return <CheckCircle2 size={20} color="#4CAF50" />;
      case 'REMINDER': return <Calendar size={20} color="#FF9800" />;
      case 'CANCELLATION':
      case 'RAIN_ALERT': return <AlertCircle size={20} color="#F44336" />;
      default: return <Bell size={20} color={Colors.secondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" translucent={false} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>

        {/* ── ScrollView with Animated Event ── */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {/* ─── Categories ─── */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {SPORT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => handleCategoryPress(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ─── Banner Slider ─── */}
          {banners.length > 0 && (
            <View style={styles.bannerContainer}>
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
                <View style={styles.pagination}>
                  {banners.map((_, i) => (
                    <View key={i} style={[styles.paginationDot, activeSlide === i && styles.paginationDotActive]} />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ─── Recommended Section ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              <TouchableOpacity onPress={handleSearchPress}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {loadingTurfs ? (
              <ActivityIndicator color={Colors.onSurfaceVariant} size="large" style={styles.loader} />
            ) : recommendedTurfs.length > 0 ? (
              <FlatList
                horizontal
                data={recommendedTurfs}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedList}
                renderItem={({ item }) => (
                  <RecommendedCard turf={item} onPress={() => handleTurfPress(item)} />
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MapPin size={28} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.emptyText}>No turfs found</Text>
                <Text style={styles.emptySubtext}>
                  {selectedCategory ? `We couldn't find any ${selectedCategory.toLowerCase()} arenas. Try another sport!` : 'We are expanding! Check back later for new venues.'}
                </Text>
              </View>
            )}
          </View>

          {/* ─── Nearby Section ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby</Text>
              <TouchableOpacity onPress={handleSearchPress}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {!loadingTurfs && nearbyTurfs.length > 0 ? (
              nearbyTurfs.map((turf) => (
                <NearbyCard key={turf.id} turf={turf} onPress={() => handleTurfPress(turf)} />
              ))
            ) : !loadingTurfs ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Compass size={28} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.emptyText}>Out of bounds</Text>
                <Text style={styles.emptySubtext}>There are no turfs located in your immediate vicinity right now.</Text>
              </View>
            ) : null}
          </View>
        </Animated.ScrollView>

        {/* ── Animated Fixed Collapsible Header ── */}
        <Animated.View style={[
          styles.headerContainerFixed,
          {
            height: headerHeight,
            borderBottomLeftRadius: headerBorderRadius,
            borderBottomRightRadius: headerBorderRadius,
          }
        ]}>
          <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
            <View style={styles.userRow}>
              {/* Profile Avatar + Compact Welcome */}
              <View style={styles.profileSection}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{userName.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.profileTextWrap}>
                  <Text style={styles.greetingText}>Hey, {userName} 👋</Text>
                  <View style={styles.locationContainer}>
                    <MapPin size={11} color={Colors.primary} />
                    <Text style={styles.locationLabel} numberOfLines={1}>{currentLocation}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.headerActions}>
                {/* Wallet Balance */}
                <TouchableOpacity style={styles.walletCompact} activeOpacity={0.8}>
                  <Wallet size={12} color={Colors.primary} />
                  <Text style={styles.walletCompactText}>₹{user?.wallet?.balance !== undefined ? Math.floor(user.wallet.balance) : '0'}</Text>
                </TouchableOpacity>

                {/* QR Scanner */}
                <TouchableOpacity style={styles.actionIconBtn} onPress={() => navigation.navigate('QRScanner')} activeOpacity={0.85}>
                  <QrCode size={16} color="#FFF" />
                </TouchableOpacity>

                {/* Notification Bell */}
                <TouchableOpacity style={styles.actionIconBtn} onPress={openNotifications} activeOpacity={0.85}>
                  <Bell size={16} color="#FFF" />
                  {notifications.some(n => !n.isRead) && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Compact Glassmorphic Search Bar */}
            <TouchableOpacity style={styles.searchBarCompact} onPress={handleSearchPress} activeOpacity={0.9}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <Text style={styles.searchPlaceholderCompact}>Search turfs, sports, arenas...</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Compact Header */}
          <Animated.View style={[styles.compactHeader, { opacity: compactHeaderOpacity }]}>
            <TouchableOpacity style={styles.compactSearchBar} onPress={handleSearchPress} activeOpacity={0.9}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <Text style={styles.searchPlaceholderCompact}>Search turfs, sports...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.compactIconButton} onPress={openNotifications}>
              <Bell size={18} color="#FFF" />
              {notifications.some(n => !n.isRead) && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>

      {/* ─── Notifications Modal ─── */}
      <Modal visible={showNotifications} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={24} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            {loadingNotifications ? (
              <ActivityIndicator color={Colors.onSurfaceVariant} style={styles.modalLoader} />
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={Colors.onSurfaceVariant} />
                <Text style={styles.emptySubtext}>No notifications yet</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <View style={styles.notificationIcon}>
                      {renderNotifIcon(item.type)}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, !item.isRead && styles.notificationUnreadText]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notificationBody}>{item.body}</Text>
                      <Text style={styles.notificationTime}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadIndicator} />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  safeArea: {
    flex: 1,
  },

  // ── Animated Header ──
  headerContainer: {
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  headerContainerFixed: {
    backgroundColor: '#0A0A0A',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  // ── Compact Header ──
  compactHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  compactSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  compactIconButton: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },

  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  profileTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  locationLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 122, 47, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(75, 122, 47, 0.25)',
  },
  walletCompactText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#0A0A0A',
  },
  searchBarCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchPlaceholderCompact: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    flex: 1,
  },

  // ── ScrollView ──
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + (Platform.OS === 'android' ? StatusBar.currentHeight : 0) - 60,
    paddingBottom: 40,
  },

  // ── Categories ──
  categoriesContainer: {
    marginBottom: -4,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E8E8EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },

  // ── Banner ──
  bannerContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D6',
  },
  paginationDotActive: {
    width: 28,
    backgroundColor: Colors.onSurfaceVariant,
    borderRadius: 4,
  },

  // ── Sections ──
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },

  // ── Recommended Cards ──
  recommendedList: {
    paddingHorizontal: 16,
    gap: 14,
    // margin: 2,
    marginBottom: 12,
  },
  recCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  recImageContainer: {
    height: 130,
    position: 'relative',
  },
  recImage: {
    width: '100%',
    height: '100%',
  },
  recImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  recOverlayInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recRatingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recInfo: {
    padding: 14,
  },
  recName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  recLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recLocationText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },

  // ── Nearby Cards (Reduced Height) ──
  nearbyCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  nearbyImage: {
    width: '100%',
    height: 130, // Reduced from 180
  },
  nearbyBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, // Reduced padding
    paddingVertical: 12, // Reduced padding
  },
  nearbyInfoLeft: {
    flex: 1,
    marginRight: 12,
  },
  nearbyName: {
    fontSize: 16, // Reduced from 18
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 3, // Reduced spacing
    letterSpacing: -0.2,
  },
  nearbyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4, // Reduced spacing
  },
  nearbyLocationText: {
    fontSize: 12, // Reduced from 13
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },
  nearbyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nearbyRating: {
    fontSize: 13, // Reduced from 15
    fontWeight: '800',
    color: '#1A1A2E',
  },
  bookNowBtn: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 18, // Reduced from 24
    paddingVertical: 10, // Reduced from 13
    borderRadius: 14, // Reduced from 16
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 13, // Reduced from 14
    fontWeight: '700',
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    backgroundColor: '#FAFAFC',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E8E8EC',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(75, 122, 47, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // ── Loader ──
  loader: {
    marginVertical: 48,
  },

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 24,
  },
  modalHandle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  modalLoader: {
    marginTop: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EC',
  },
  notificationUnread: {
    backgroundColor: '#F5F0FF',
    borderColor: '#E0D5FF',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  notificationUnreadText: {
    fontWeight: '800',
    color: '#6D28D9',
  },
  notificationBody: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.onSurfaceVariant,
    marginLeft: 10,
  },
});

export default memo(HomeScreen);