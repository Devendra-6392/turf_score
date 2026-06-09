import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl, ImageBackground,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Plus, MapPin, Users, Clock, Zap, Trophy } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';
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
      activeOpacity={0.85}
      style={styles.challengeCardWrap}
    >
      <View style={styles.challengeCard}>
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
        {challenge.description ? (
          <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>
        ) : <View style={{height: 8}} />}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Trophy size={14} color={Colors.primary} />
            <Text style={styles.statText}>{challenge.sportType}</Text>
          </View>
          {challenge.turf && (
            <View style={styles.stat}>
              <MapPin size={14} color={Colors.primary} />
              <Text style={styles.statText} numberOfLines={1}>{challenge.turf.name}</Text>
            </View>
          )}
          {challenge.maxPlayers && (
            <View style={styles.stat}>
              <Users size={14} color={Colors.primary} />
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
            {new Date(challenge.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </Text>
          <View style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>View Challenge</Text>
            <View style={styles.acceptButtonArrow}>
              <ChevronRight size={12} color="#FFF" />
            </View>
          </View>
        </View>
      </View>
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
            colors={['#1A1A1A', '#000']}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={24} color={Colors.primary} />
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
              colors={['#1A1A1A', '#000']}
              style={styles.createFirstButtonGradient}
            >
              <Text style={styles.createFirstButtonText}>Create Challenge</Text>
              <View style={styles.createFirstButtonArrow}>
                <ChevronRight size={14} color="#FFF" />
              </View>
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
  challengeCardWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  rating: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: Colors.headerDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  statText: {
    fontSize: 11,
    color: Colors.onBackground,
    marginLeft: 6,
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  messageText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineLight,
  },
  timeText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  acceptButton: {
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  acceptButtonArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 12,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  createFirstButtonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChallengesScreen;

