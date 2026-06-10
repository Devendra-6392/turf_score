import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Plus, MapPin, Calendar, Users, Megaphone } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import Toast from 'react-native-toast-message';

export default function LFPScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user } = useAuth();

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
        Toast.show({ type: 'success', text1: 'Joined successfully!' });
        fetchRequests();
      } else {
        Toast.show({ type: 'error', text1: data.error || 'Failed to join' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Network error' });
    }
  };

  const renderItem = ({ item }) => {
    const isCreator = item.creatorId === user?.id;
    const hasJoined = item.joinedPlayers.some(jp => jp.userId === user?.id);
    const spotsFilled = item.joinedPlayers.length;
    const spotsTotal = item.playersNeeded;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image 
            source={{ uri: item.creator.avatar || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View style={styles.headerText}>
            <Text style={styles.creatorName}>{item.creator.name} is looking for players!</Text>
            <Text style={styles.sportBadge}>{item.sport}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#666" />
            <Text style={styles.infoText}>{new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color="#666" />
            <Text style={styles.infoText}>Need: {spotsTotal - spotsFilled} more player(s)</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description}>"{item.description}"</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(spotsFilled/spotsTotal)*100}%` }]} />
          </View>
          <Text style={styles.progressText}>{spotsFilled}/{spotsTotal} joined</Text>
          
          {!isCreator && !hasJoined && item.status === 'OPEN' && (
            <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.id)}>
              <Text style={styles.joinBtnText}>Join Game</Text>
            </TouchableOpacity>
          )}
          {hasJoined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>You Joined!</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Megaphone size={28} color={Colors.primary} />
          <Text style={styles.title}>Looking for Players</Text>
        </View>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateLFP')}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No one is looking for players right now.</Text>
            <Text style={styles.emptySubtext}>Be the first to create a request!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  createBtn: {
    backgroundColor: Colors.primary, width: 44, height: 44, 
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  listContainer: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  headerText: { flex: 1 },
  creatorName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  sportBadge: {
    backgroundColor: Colors.primary + '20', color: Colors.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    fontSize: 12, fontWeight: 'bold', alignSelf: 'flex-start'
  },
  cardBody: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, gap: 8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#444', fontWeight: '500' },
  description: { fontSize: 14, fontStyle: 'italic', color: '#666', marginBottom: 15, paddingHorizontal: 5 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
  progressContainer: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3, marginRight: 10 },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, color: '#666', fontWeight: '600', width: 70 },
  joinBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  joinBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  joinedBadge: { backgroundColor: '#4ade8020', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  joinedText: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 50 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#444', textAlign: 'center', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center' }
});
