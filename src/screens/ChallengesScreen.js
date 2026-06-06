import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl, ImageBackground,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Users, Clock, Zap, Trophy } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.18.23:5000/api';
const CARD_WIDTH = SCREEN_WIDTH - 32;

const ChallengesScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const sports = ['ALL', 'CRICKET', 'FOOTBALL', 'TENNIS', 'BADMINTON', 'BASKETBALL'];
  const challengeTypes = ['ALL', 'INDIVIDUAL', 'TEAM'];

  const fetchChallenges = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSport !== 'ALL') params.append('sport', selectedSport);
      if (selectedType !== 'ALL') params.append('type', selectedType);

      console.log('Fetching challenges from:', `${BACKEND_URL}/challenges?${params.toString()}`);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${BACKEND_URL}/challenges?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('Fetch response status:', response.status);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      console.log('Challenges data:', data);
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      Alert.alert('Error', `Failed to load challenges: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSport, selectedType, token]);

  useEffect(() => {
    fetchChallenges();
  }, [selectedSport, selectedType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChallenges();
  };

  const ChallengeCard = ({ challenge }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(75, 122, 47, 0.1)', 'rgba(107, 142, 35, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.challengeCard}
      >
        {/* Header with Creator */}
        <View style={styles.cardHeader}>
          <View style={styles.creatorInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{challenge.creator.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.creatorName}>{challenge.creator.name}</Text>
              <Text style={styles.rating}>★ {challenge.creator.rating || 4.5}</Text>
            </View>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{challenge.type}</Text>
          </View>
        </View>

        {/* Challenge Title */}
        <Text style={styles.title}>{challenge.title}</Text>
        {challenge.description && (
          <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.statText}>{challenge.sportType}</Text>
          </View>
          {challenge.turf && (
            <View style={styles.stat}>
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.statText} numberOfLines={1}>{challenge.turf.name}</Text>
            </View>
          )}
          {challenge.maxPlayers && (
            <View style={styles.stat}>
              <Users size={16} color={Colors.primary} />
              <Text style={styles.statText}>{challenge.maxPlayers} players</Text>
            </View>
          )}
        </View>

        {/* Message */}
        {challenge.message && (
          <View style={styles.messageBox}>
            <Zap size={14} color={Colors.accent} />
            <Text style={styles.messageText} numberOfLines={2}>{challenge.message}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>
            {new Date(challenge.createdAt).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
          >
            <Text style={styles.acceptButtonText}>View Challenge →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const FilterChip = ({ label, isSelected, onPress, type }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.filterChipActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Challenges</Text>
          <Text style={styles.headerSubtitle}>Find & Accept epic challenges</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateChallenge')}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Sport</Text>
        <FlatList
          horizontal
          data={sports}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <FilterChip
              label={item}
              isSelected={selectedSport === item}
              onPress={() => setSelectedSport(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />

        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Type</Text>
        <FlatList
          horizontal
          data={challengeTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <FilterChip
              label={item}
              isSelected={selectedType === item}
              onPress={() => setSelectedType(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Challenges List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : challenges.length === 0 ? (
        <View style={styles.centerContainer}>
          <Trophy size={64} color={Colors.primary} opacity={0.3} />
          <Text style={styles.emptyText}>No challenges yet</Text>
          <Text style={styles.emptySubtext}>Be the first to create one!</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreateChallenge')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              style={styles.createFirstButtonGradient}
            >
              <Text style={styles.createFirstButtonText}>Create Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChallengeCard challenge={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.onBackground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onBackground,
    marginBottom: 8,
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  challengeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 122, 47, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  rating: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 122, 47, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(107, 142, 35, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    color: Colors.accent,
    marginLeft: 6,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 122, 47, 0.1)',
  },
  timeText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.onBackground,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
  },
  createFirstButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  createFirstButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ChallengesScreen;

