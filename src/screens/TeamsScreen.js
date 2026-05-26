import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, QrCode, Trash2, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://10.185.142.203:5000/api';
const SPORTS = ['CRICKET', 'TENNIS', 'BASKETBALL'];

export default function TeamsScreen({ navigation }) {
  const { token, user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('CRICKET');
  const [memberEmails, setMemberEmails] = useState(['']);

  const loadTeams = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/teams`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load teams');
      setTeams(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Teams', text2: error.message });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const resetForm = () => {
    setName('');
    setSportType('CRICKET');
    setMemberEmails(['']);
  };

  const createTeam = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, sportType, memberEmails })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create team');
      setOpen(false);
      resetForm();
      loadTeams();
      Toast.show({ type: 'success', text1: 'Team created', text2: 'Your squad is ready to book.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Could not create team', text2: error.message });
    }
  };

  const deleteTeam = async (team) => {
    if (team.captainId !== user?.id) return;
    Alert.alert('Delete team?', `Remove ${team.name} permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${BACKEND_URL}/teams/${team.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          loadTeams();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerDark} translucent={false} />
      
      {/* ── Top Header Background ── */}
      <View style={styles.headerBg} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Teams</Text>
            <Text style={styles.subtitle}>Up to 8 registered players per squad</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('QRScanner')}>
            <QrCode size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={() => setOpen(true)} activeOpacity={0.88}>
          <Plus size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Team</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyTitle}>No squads created yet</Text>
                <Text style={styles.emptyText}>Create your first squad and invite players to book grounds together.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.teamName}>{item.name}</Text>
                    <View style={styles.sportBadge}>
                      <Text style={styles.sportText}>{item.sportType}</Text>
                    </View>
                  </View>
                  {item.captainId === user?.id && (
                    <TouchableOpacity onPress={() => deleteTeam(item)} style={styles.deleteBtn} activeOpacity={0.7}>
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.membersLabel}>
                  <Users size={14} color={Colors.primary} />
                  <Text style={styles.memberCount}>{item.members.length} / 8 Players</Text>
                </View>
                
                <View style={styles.membersList}>
                  {item.members.map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberDot} />
                      <Text style={styles.memberName} numberOfLines={1}>
                        {member.user.name || member.user.email}
                        {member.role === 'CAPTAIN' ? ' (Captain)' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeaderIndicator} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create Team</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Team name" 
                placeholderTextColor="rgba(0,0,0,0.3)"
              />
              
              <Text style={styles.sectionLabel}>Sport Category</Text>
              <View style={styles.sportRow}>
                {SPORTS.map((sport) => {
                  const isActive = sport === sportType;
                  return (
                    <TouchableOpacity 
                      key={sport} 
                      style={[styles.sportChip, isActive && styles.sportChipActive]} 
                      onPress={() => setSportType(sport)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.sportChipText, isActive && styles.sportChipTextActive]}>{sport}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <Text style={styles.sectionLabel}>Invite Teammates</Text>
              <Text style={styles.hint}>Add teammate email addresses. Invited players must already have an account.</Text>
              
              {memberEmails.map((email, index) => (
                <TextInput
                  key={index}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(value) => setMemberEmails(memberEmails.map((item, i) => i === index ? value : item))}
                  placeholder={`Player ${index + 2} email`}
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />
              ))}
              
              {memberEmails.length < 7 && (
                <TouchableOpacity style={styles.addPlayer} onPress={() => setMemberEmails([...memberEmails, ''])} activeOpacity={0.7}>
                  <Plus size={16} color={Colors.primary} />
                  <Text style={styles.addPlayerText}>Add Teammate</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancel} onPress={() => { setOpen(false); resetForm(); }} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={createTeam} disabled={!name.trim()} activeOpacity={0.8}>
                <Text style={styles.saveText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
    backgroundColor: Colors.headerDark,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15,
    marginBottom: 20 
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 4, fontSize: 13 },
  scanButton: { 
    width: 44, 
    height: 44, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  createButton: { 
    backgroundColor: Colors.primary, 
    borderRadius: 16, 
    padding: 16, 
    marginHorizontal: 20,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  createButtonText: { color: '#fff', fontWeight: '750', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.onBackground, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  card: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  teamName: { fontSize: 18, fontWeight: '800', color: Colors.onBackground, letterSpacing: -0.3 },
  sportBadge: { 
    backgroundColor: 'rgba(75, 122, 47, 0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginTop: 6,
    alignSelf: 'flex-start'
  },
  sportText: { color: Colors.primary, fontWeight: '750', fontSize: 11 },
  deleteBtn: { 
    width: 32, 
    height: 32, 
    backgroundColor: '#FEE2E2', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  divider: { height: 1, backgroundColor: Colors.outlineLight, marginVertical: 14 },
  membersLabel: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 10 },
  memberCount: { color: Colors.primary, fontWeight: '750', fontSize: 13 },
  membersList: { gap: 8 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  memberName: { color: Colors.onSurfaceVariant, fontSize: 13, fontWeight: '500' },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { 
    maxHeight: '85%', 
    backgroundColor: Colors.background, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  modalHeaderIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.outlineLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 18, color: Colors.onBackground, letterSpacing: -0.5 },
  sectionLabel: { fontSize: 14, fontWeight: '750', color: Colors.onBackground, marginTop: 8, marginBottom: 10 },
  input: { 
    borderWidth: 1, 
    borderColor: Colors.outlineLight, 
    backgroundColor: '#fff',
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 12,
    color: Colors.onBackground,
    fontSize: 14
  },
  sportRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  sportChip: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.outlineLight
  },
  sportChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sportChipText: { fontSize: 12, fontWeight: '750', color: Colors.onSurfaceVariant },
  sportChipTextActive: { color: '#fff' },
  hint: { color: Colors.onSurfaceVariant, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  addPlayer: { flexDirection: 'row', gap: 6, paddingVertical: 12, alignItems: 'center' },
  addPlayerText: { color: Colors.primary, fontWeight: '750', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancel: { 
    flex: 1, 
    padding: 16, 
    alignItems: 'center', 
    borderRadius: 14, 
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.outlineLight
  },
  cancelText: { color: Colors.onSurfaceVariant, fontWeight: '750' },
  save: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 14, backgroundColor: Colors.primary },
  saveText: { color: '#fff', fontWeight: '750' }
});
