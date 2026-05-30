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
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, QrCode, Trash2, Users, Mail, User as UserIcon, Shield } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://10.185.142.203:5000/api';
const SPORTS = ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'TENNIS'];

const SPORT_POSITIONS = {
  CRICKET: ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'],
  FOOTBALL: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  BASKETBALL: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  VOLLEYBALL: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Libero'],
  TENNIS: ['Player']
};

export default function TeamsScreen({ navigation }) {
  const { token, user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('CRICKET');
  const [members, setMembers] = useState([{ email: '', name: '', position: '' }]);
  const [focusedInput, setFocusedInput] = useState(null);

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
    setEditingTeam(null);
    setName('');
    setSportType('CRICKET');
    setMembers([{ email: '', name: '', position: '' }]);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setName(team.name);
    setSportType(team.sportType);
    const existingMembers = team.members.filter(m => m.role !== 'CAPTAIN').map(m => ({
      email: m.email || m.user?.email || '',
      name: m.name || m.user?.name || '',
      position: m.position || ''
    }));
    setMembers(existingMembers.length ? existingMembers : [{ email: '', name: '', position: '' }]);
    setOpen(true);
  };

  const saveTeam = async () => {
    try {
      const url = editingTeam ? `${BACKEND_URL}/teams/${editingTeam.id}` : `${BACKEND_URL}/teams`;
      const method = editingTeam ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, sportType, members })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save team');
      setOpen(false);
      resetForm();
      loadTeams();
      Toast.show({ type: 'success', text1: editingTeam ? 'Team updated' : 'Team created', text2: 'Your squad is ready.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} translucent={false} />

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

        <TouchableOpacity style={styles.createButton} onPress={() => { resetForm(); setOpen(true); }} activeOpacity={0.88}>
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
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => openEdit(item)} style={[styles.deleteBtn, { backgroundColor: '#E0F2FE' }]} activeOpacity={0.7}>
                        <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: 'bold' }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTeam(item)} style={styles.deleteBtn} activeOpacity={0.7}>
                        <Trash2 size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
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
                        {member.name || member.user?.name || member.email || member.user?.email || 'Unknown Player'}
                        {member.role === 'CAPTAIN' ? ' (Captain)' : ''}
                        {member.position ? ` • ${member.position}` : ''}
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalBackdrop}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeaderIndicator} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>{editingTeam ? 'Edit Team' : 'Create Team'}</Text>
              
              <View style={styles.teamDetailsCard}>
                <Text style={styles.sectionLabel}>Team Name</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'teamName' && styles.inputFocused]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter team name"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  onFocus={() => setFocusedInput('teamName')}
                  onBlur={() => setFocusedInput(null)}
                />

                <Text style={styles.sectionLabel}>Sport Category</Text>
                <View style={styles.sportRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {SPORTS.map((sport) => {
                      const isActive = sport === sportType;
                      return (
                        <TouchableOpacity
                          key={sport}
                          style={[styles.sportChip, isActive && styles.sportChipActive, { marginRight: 8 }]}
                          onPress={() => setSportType(sport)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.sportChipText, isActive && styles.sportChipTextActive]}>{sport}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              <Text style={styles.sectionLabelMain}>Invite Teammates</Text>
              <Text style={styles.hint}>Add teammate details. They will be linked if they register with this email.</Text>

              {members.map((member, index) => (
                <View key={index} style={styles.memberInputCard}>
                  <View style={styles.memberCardHeader}>
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberBadgeText}>Player {index + 1}</Text>
                    </View>
                    {members.length > 1 && (
                      <TouchableOpacity onPress={() => setMembers(members.filter((_, i) => i !== index))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Trash2 size={16} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.inputWrapper, focusedInput === `email-${index}` && styles.inputWrapperFocused]}>
                    <Mail size={16} color={focusedInput === `email-${index}` ? Colors.primary : "rgba(0,0,0,0.4)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputWithIcon}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={member.email}
                      onChangeText={(val) => {
                        const newM = [...members];
                        newM[index].email = val;
                        setMembers(newM);
                      }}
                      placeholder="Email Address"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      onFocus={() => setFocusedInput(`email-${index}`)}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={[styles.inputWrapper, focusedInput === `name-${index}` && styles.inputWrapperFocused]}>
                    <UserIcon size={16} color={focusedInput === `name-${index}` ? Colors.primary : "rgba(0,0,0,0.4)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputWithIcon}
                      value={member.name}
                      onChangeText={(val) => {
                        const newM = [...members];
                        newM[index].name = val;
                        setMembers(newM);
                      }}
                      placeholder="Name (Optional)"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      onFocus={() => setFocusedInput(`name-${index}`)}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  {SPORT_POSITIONS[sportType] && (
                    <View style={styles.positionWrapper}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 }}>
                        <Shield size={14} color={Colors.onSurfaceVariant} />
                        <Text style={styles.positionLabel}>Select Position</Text>
                      </View>
                      <View style={styles.positionRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {SPORT_POSITIONS[sportType].map(pos => {
                            const isActive = member.position === pos;
                            return (
                              <TouchableOpacity
                                key={pos}
                                style={[styles.sportChip, isActive && styles.sportChipActive, { marginRight: 8, paddingVertical: 8, paddingHorizontal: 14 }]}
                                onPress={() => {
                                  const newM = [...members];
                                  newM[index].position = pos;
                                  setMembers(newM);
                                }}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.sportChipText, isActive && styles.sportChipTextActive, { fontSize: 12 }]}>{pos}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {members.length < 7 && (
                <TouchableOpacity style={styles.addPlayerBtn} onPress={() => setMembers([...members, { email: '', name: '', position: '' }])} activeOpacity={0.8}>
                  <Plus size={18} color={Colors.primary} />
                  <Text style={styles.addPlayerText}>Add Teammate</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setOpen(false); resetForm(); }} activeOpacity={0.8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]} onPress={saveTeam} disabled={!name.trim()} activeOpacity={0.8}>
                <Text style={styles.saveText}>{editingTeam ? 'Update Team' : 'Create Team'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: Colors.primary,
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
    maxHeight: '92%',
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
  sectionLabelMain: { fontSize: 16, fontWeight: '800', color: Colors.onBackground, marginTop: 12, marginBottom: 8 },
  teamDetailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  sectionLabel: { fontSize: 13, fontWeight: '750', color: Colors.onSurfaceVariant, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.outlineLight,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    color: Colors.onBackground,
    fontSize: 15,
    fontWeight: '500'
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAFA'
  },
  sportRow: { flexDirection: 'row' },
  sportChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.outlineLight
  },
  sportChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sportChipText: { fontSize: 13, fontWeight: '750', color: Colors.onSurfaceVariant },
  sportChipTextActive: { color: '#fff' },
  hint: { color: Colors.onSurfaceVariant, fontSize: 13, lineHeight: 18, marginBottom: 14 },

  memberInputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  memberCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  memberBadge: {
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  memberBadgeText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineLight,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAFA'
  },
  inputIcon: {
    marginRight: 8
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.onBackground,
    fontSize: 15,
    fontWeight: '500'
  },
  positionWrapper: {
    marginTop: 4
  },
  positionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant
  },
  positionRow: { flexDirection: 'row' },

  addPlayerBtn: { 
    flexDirection: 'row', 
    gap: 8, 
    paddingVertical: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: 'rgba(139, 195, 74, 0.05)',
    marginBottom: 10
  },
  addPlayerText: { color: Colors.primary, fontWeight: '800', fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderColor: Colors.outlineLight },
  cancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.outlineLight
  },
  cancelText: { color: Colors.onSurfaceVariant, fontWeight: '800', fontSize: 15 },
  saveBtn: { 
    flex: 1, 
    padding: 16, 
    alignItems: 'center', 
    borderRadius: 14, 
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  saveBtnDisabled: {
    backgroundColor: Colors.outline,
    shadowOpacity: 0,
    elevation: 0
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
