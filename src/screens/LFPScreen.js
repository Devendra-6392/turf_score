import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Plus, MapPin, Calendar, Users, Megaphone, Zap, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import Toast from 'react-native-toast-message';
import { wp, hp, scale, fontScale, moderateScale } from '../utils/responsive';

export default function LFPScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fetchRequests = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/lfp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (e) {
      console.log('Error fetching LFP', e);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRequests();
    });
    return unsubscribe;
  }, [navigation, fetchRequests]);

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`${API_URL}/lfp/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Toast.show({ type: 'success', text1: "You're in!", text2: 'The host will see your interest.' });
        fetchRequests();
      } else {
        Toast.show({ type: 'error', text1: data.error || 'Failed to join' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Network error' });
    }
  };

  const renderItem = ({ item, index }) => {
    const isCreator = item.creatorId === user?.id;
    const hasJoined = item.joinedPlayers.some(jp => jp.userId === user?.id);
    const spotsFilled = item.joinedPlayers.length;
    const spotsTotal = item.playersNeeded;
    const spotsLeft = spotsTotal - spotsFilled;

    return (
      <Animated.View style={[styles.card, { opacity: 1 }]}>
        <View style={styles.cardHeader}>
          <Image 
            source={{ uri: item.creator.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View style={styles.headerText}>
            <Text style={styles.creatorName}>{item.creator.name} needs backup!</Text>
            <View style={{ flexDirection: 'row', gap: scale(8) }}>
              <Text style={styles.sportBadge}>{item.sport}</Text>
              {item.preferredGender && item.preferredGender !== 'ANY' && (
                <Text style={[styles.sportBadge, { backgroundColor: '#fcd34d20', color: '#d97706' }]}>
                  {item.preferredGender === 'MALE' ? 'Boys Only' : 'Girls Only'}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={scale(16)} color={Colors.primary} />
            <Text style={styles.infoText}>{new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={scale(16)} color={Colors.primary} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={scale(16)} color={Colors.primary} />
            <Text style={styles.infoText}>
              {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left — jump in!` : 'Squad is full!'}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description}>"{item.description}"</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.progressOuter}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${(spotsFilled/spotsTotal)*100}%` }]} />
            </View>
            <Text style={styles.progressText}>{spotsFilled}/{spotsTotal} joined</Text>
          </View>
          
          {!isCreator && !hasJoined && item.status === 'OPEN' && (
            <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.id)} activeOpacity={0.85}>
              <Text style={styles.joinBtnText}>Count Me In!</Text>
              <View style={styles.joinBtnArrow}>
                <ChevronRight size={scale(14)} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}
          {hasJoined && (
            <View style={styles.joinedBadge}>
              <Zap size={scale(14)} color="#16a34a" />
              <Text style={styles.joinedText}>You're In!</Text>
            </View>
          )}
          {isCreator && (
            <TouchableOpacity style={styles.creatorBtn} onPress={() => navigation.navigate('InterestedPlayers', { lfpId: item.id })} activeOpacity={0.85}>
              <Text style={styles.creatorBtnText}>See Who's In</Text>
              <View style={styles.joinBtnArrow}>
                <ChevronRight size={scale(14)} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIconWrap}>
            <Megaphone size={scale(22)} color="#FFF" />
          </View>
          <View>
            <Text style={styles.title}>Round Up Your Squad</Text>
            <Text style={styles.subtitle}>Find players, fill spots, play more</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateLFP')}
            activeOpacity={0.85}
          >
            <Plus size={scale(24)} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRequests} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Users size={scale(40)} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>No one's looking for players... yet!</Text>
            <Text style={styles.emptySubtext}>Be the MVP — create the first request and rally your squad</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreateLFP')} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Post a Request</Text>
              <ChevronRight size={scale(16)} color="#FFF" />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: scale(20), paddingVertical: scale(16),
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.outlineLight,
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: scale(12), flex: 1 },
  titleIconWrap: {
    width: scale(44), height: scale(44), borderRadius: scale(14),
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: fontScale(20), fontWeight: '800', color: Colors.onBackground },
  subtitle: { fontSize: fontScale(12), color: Colors.onSurfaceVariant, fontWeight: '500', marginTop: 2 },
  createBtn: {
    backgroundColor: Colors.headerDark, width: scale(48), height: scale(48),
    borderRadius: scale(16), alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  listContainer: { padding: scale(16), paddingBottom: scale(100) },
  card: {
    backgroundColor: Colors.surface, borderRadius: scale(20), padding: scale(18), marginBottom: scale(16),
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: Colors.outlineLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(14) },
  avatar: { width: scale(48), height: scale(48), borderRadius: scale(24), marginRight: scale(14), borderWidth: 2, borderColor: Colors.outlineLight },
  headerText: { flex: 1 },
  creatorName: { fontSize: fontScale(15), fontWeight: '700', color: Colors.onBackground, marginBottom: scale(6) },
  sportBadge: {
    backgroundColor: Colors.primary + '15', color: Colors.primary,
    paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(12),
    fontSize: fontScale(11), fontWeight: '800', alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  cardBody: { backgroundColor: Colors.surfaceContainerLow, borderRadius: scale(14), padding: scale(14), gap: scale(10), marginBottom: scale(14) },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  infoText: { fontSize: fontScale(13), color: Colors.onBackground, fontWeight: '500' },
  description: { fontSize: fontScale(13), fontStyle: 'italic', color: Colors.onSurfaceVariant, marginBottom: scale(14), paddingHorizontal: scale(4) },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.outlineLight, paddingTop: scale(14) },
  progressOuter: { flex: 1, marginRight: scale(12) },
  progressContainer: { height: scale(6), backgroundColor: Colors.surfaceContainerHighest, borderRadius: scale(3) },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: scale(3) },
  progressText: { fontSize: fontScale(11), color: Colors.onSurfaceVariant, fontWeight: '600', marginTop: scale(4) },
  joinBtn: { 
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    paddingLeft: scale(16), paddingRight: scale(4), paddingVertical: scale(4), borderRadius: scale(20), gap: scale(6),
  },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: fontScale(13) },
  joinBtnArrow: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', gap: scale(6), backgroundColor: '#4ade8020', paddingHorizontal: scale(14), paddingVertical: scale(10), borderRadius: scale(20) },
  joinedText: { color: '#16a34a', fontWeight: '800', fontSize: fontScale(13) },
  creatorBtn: { 
    backgroundColor: Colors.headerDark, flexDirection: 'row', alignItems: 'center',
    paddingLeft: scale(16), paddingRight: scale(4), paddingVertical: scale(4), borderRadius: scale(20), gap: scale(6),
  },
  creatorBtnText: { color: '#fff', fontWeight: '800', fontSize: fontScale(13) },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: scale(40), marginTop: scale(40) },
  emptyIconWrap: {
    width: scale(80), height: scale(80), borderRadius: scale(40),
    backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: scale(20),
  },
  emptyText: { fontSize: fontScale(18), fontWeight: '800', color: Colors.onBackground, textAlign: 'center', marginBottom: scale(8) },
  emptySubtext: { fontSize: fontScale(14), color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: fontScale(22), marginBottom: scale(24) },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: scale(8),
    backgroundColor: Colors.headerDark, paddingHorizontal: scale(24), paddingVertical: scale(14), borderRadius: scale(16),
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: fontScale(15) },
});
