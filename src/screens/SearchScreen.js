import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Image, ActivityIndicator, Dimensions, Animated, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, X, MapPin, Star, SlidersHorizontal,
  Trophy, Target, Zap, Activity, CircleDot, ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'All', name: 'All', icon: '🌟' },
  { id: 'Football', name: 'Football', icon: '⚽' },
  { id: 'Cricket', name: 'Cricket', icon: '🏏' },
  { id: 'Tennis', name: 'Tennis', icon: '🎾' },
  { id: 'Basketball', name: 'Basketball', icon: '🏀' },
  { id: 'Volleyball', name: 'Volleyball', icon: '🏐' },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Recommended' },
  { id: 'price_low', label: 'Lowest Price' },
  { id: 'rating', label: 'Top Rated' },
];

// ─── Search Result Card ─────────────────────────────────────
const SearchResultCard = memo(({ turf, onPress }) => (
  <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.95}>
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: turf.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80' }}
        style={styles.resultImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.imageOverlay}
      />
      <View style={styles.topBadges}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{turf.category || 'Football'}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>{turf.rating || '4.5'}</Text>
        </View>
      </View>
      <View style={styles.imageInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{turf.name}</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationText} numberOfLines={1}>{turf.location || turf.city || 'Nearby'}</Text>
        </View>
      </View>
    </View>

    <View style={styles.bottomSection}>
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Starting from</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>₹{turf.pricePerHour}</Text>
          <Text style={styles.priceUnit}>/hr</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookBtn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.bookBtnText}>Book Slot</Text>
        <ChevronRight size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
));

// ─── Main Search Screen ─────────────────────────────────────
const SearchScreen = ({ navigation, route }) => {
  const passedTurfs = route?.params?.turfs;
  const [allTurfs, setAllTurfs] = useState(passedTurfs || []);
  const [loading, setLoading] = useState(!passedTurfs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!passedTurfs || passedTurfs.length === 0) {
      fetchTurfs();
    }
  }, []);

  const fetchTurfs = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/turfs`);
      const data = await res.json();
      setAllTurfs(data);
    } catch (e) {
      console.log('Error fetching turfs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredResults = React.useMemo(() => {
    let results = [...allTurfs];

    if (selectedCategory !== 'All') {
      results = results.filter(t =>
        (t.category || 'Football').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.city || '').toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price_low': results.sort((a, b) => a.pricePerHour - b.pricePerHour); break;
      case 'rating': results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    return results;
  }, [allTurfs, selectedCategory, searchQuery, sortBy]);

  const handleTurfPress = useCallback((turf) => {
    navigation.navigate('TurfDetail', { turf });
  }, [navigation]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const renderTurf = useCallback(({ item }) => (
    <SearchResultCard turf={item} onPress={() => handleTurfPress(item)} />
  ), [handleTurfPress]);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerTranslateY }] }]}>
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color={Colors.onBackground} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find a Turf</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color={Colors.onSurfaceVariant} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search by name, location, city..."
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                  <X size={16} color={Colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} color={showFilters ? '#fff' : Colors.onBackground} />
            </TouchableOpacity>
          </View>

          {/* Filters Panel */}
          {showFilters && (
            <View style={styles.filtersPanel}>
              <Text style={styles.filterTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sortChip, sortBy === opt.id && styles.sortChipActive]}
                    onPress={() => setSortBy(opt.id)}
                  >
                    <Text style={[styles.sortChipText, sortBy === opt.id && styles.sortChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          <View style={styles.categoriesWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const isActive = selectedCategory === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(item.id)}
                  >
                    <Text style={styles.categoryEmoji}>{item.icon}</Text>
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── Results List ── */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <Animated.FlatList
          data={filteredResults}
          renderItem={renderTurf}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsCountText}>
                {filteredResults.length} {filteredResults.length === 1 ? 'Turf' : 'Turfs'} Found
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏟️</Text>
              <Text style={styles.emptyTitle}>No Turfs Found</Text>
              <Text style={styles.emptySubtitle}>We couldn't find any turfs matching your search. Try different keywords or filters.</Text>
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.clearSearchBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineLight,
    zIndex: 10,
  },
  safeHeader: {
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.onBackground,
    height: '100%',
  },
  clearBtn: {
    padding: 10,
    marginRight: 6,
  },
  filterBtn: {
    width: 52, height: 52,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  filterBtnActive: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  filtersPanel: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  sortChipTextActive: {
    color: Colors.primary,
  },
  categoriesWrapper: {
    marginTop: 16,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  resultsHeaderRow: {
    paddingVertical: 16,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBadges: {
    position: 'absolute',
    top: 12, left: 12, right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    color: Colors.onBackground,
    fontSize: 13,
    fontWeight: '800',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 12, left: 16, right: 16,
  },
  resultName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginLeft: 2,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.headerDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearSearchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  clearSearchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default memo(SearchScreen);
