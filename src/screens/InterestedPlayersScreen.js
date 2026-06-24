import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import Toast from 'react-native-toast-message';

export default function InterestedPlayersScreen({ route, navigation }) {
  const { lfpId } = route.params;
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterestedPlayers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/lfp/${lfpId}/interested`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPlayers(data);
      } else {
        Toast.show({ type: 'error', text1: data.error || 'Failed to fetch players' });
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Network Error' });
    } finally {
      setLoading(false);
    }
  }, [lfpId, token]);

  useEffect(() => {
    fetchInterestedPlayers();
  }, [fetchInterestedPlayers]);

  const handleAccept = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/lfp/${lfpId}/accept/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Player Accepted!' });
        fetchInterestedPlayers(); // Refresh list
      } else {
        Toast.show({ type: 'error', text1: data.error || 'Failed to accept player' });
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Network Error' });
    }
  };

  const renderPlayer = ({ item }) => {
    const isAccepted = item.status === 'ACCEPTED';

    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: item.user.avatar || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.user.name}</Text>
          <Text style={styles.gender}>{item.user.gender || 'Unknown Gender'}</Text>
        </View>

        {isAccepted ? (
          <View style={styles.acceptedBadge}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.acceptedText}>Accepted</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.acceptBtn} 
            onPress={() => handleAccept(item.user.id)}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Interested Players</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={players}
        keyExtractor={item => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No players have expressed interest yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  list: { padding: 15 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  gender: { fontSize: 13, color: '#666', marginTop: 2 },
  acceptBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20
  },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  acceptedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#4ade8020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20
  },
  acceptedText: { color: '#16a34a', fontWeight: 'bold', fontSize: 13 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#666', fontSize: 16, textAlign: 'center' }
});
