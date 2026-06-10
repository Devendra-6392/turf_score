import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Alert, Animated, Dimensions, Platform, DatePickerAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Trophy, MapPin, Calendar,
  Award, Flame, Target, Sparkles, User, Users, Zap
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useUserBookings, useBookingForTurfDate, useOtherBookingsInTurf } from '../hooks/useChallengeFlow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { API_URL as BACKEND_URL } from '../config/api';

// ─── Sport Config ─────────────────────────────────────────────────────────────
const SPORT_CONFIG = {
  CRICKET: { icon: Award, label: 'Cricket', color: '#E0A96D', bg: '#FFF4E6' },
  FOOTBALL: { icon: Flame, label: 'Football', color: '#FF7E67', bg: '#FFF0EE' },
  TENNIS: { icon: Target, label: 'Tennis', color: '#4E9F3D', bg: '#F0FAF0' },
  BADMINTON: { icon: Sparkles, label: 'Badminton', color: '#9B59B6', bg: '#F8F0FC' },
  BASKETBALL: { icon: Trophy, label: 'Basketball', color: '#F0A500', bg: '#FFFBEA' },
};

// ─── No Step Indicator (Single Page Layout) ───────────────────────────────────

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }}>
    {children}
  </Text>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CreateChallengeScreen = ({ route, navigation }) => {
  const { user, token } = useAuth();
  const { prefillTurfId, prefillSlotId, prefillDate, prefillTime } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Form State
  const [sportType, setSportType] = useState('CRICKET');
  const [challengeType, setChallengeType] = useState('INDIVIDUAL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [turfId, setTurfId] = useState(prefillTurfId || null);
  const [turfs, setTurfs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(prefillDate ? new Date(prefillDate) : new Date());
  const [selectedTime, setSelectedTime] = useState(prefillTime || '');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [turfSlots, setTurfSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(prefillSlotId || null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { bookings: userBookings } = useUserBookings(token);
  const matchingBooking = useBookingForTurfDate(turfId, selectedDate, userBookings);
  const { otherBookings, loading: loadingOtherBookings } = useOtherBookingsInTurf(turfId, selectedDate, user?.id, token);

  // ── Auto-prefill from booking ─────────────────────────────────────────────
  useEffect(() => {
    if (matchingBooking && !selectedSlot) {
      setSelectedSlot(matchingBooking.slotId);
      setSelectedTime(matchingBooking.timeSlot || matchingBooking.scheduledTime || '');
    }
  }, [matchingBooking, selectedSlot]);

  // ── Fetch turfs ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/turfs`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setTurfs(d.slice(0, 10)); }
      } catch (e) { console.error('Turfs:', e); }
    };
    fetchTurfs();
  }, [token]);

  // ── Fetch teams ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (challengeType !== 'TEAM') return;
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/teams/my-teams`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setTeams(d); if (d.length) setSelectedTeam(d[0].id); }
      } catch (e) { console.error('Teams:', e); }
    };
    fetchTeams();
  }, [challengeType, token]);

  // ── Fetch slots ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!turfId || !selectedDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate;
        const res = await fetch(`${BACKEND_URL}/turfs/${turfId}/slots?date=${dateStr}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const d = await res.json();
          setTurfSlots(d.filter(s => s.status === 'AVAILABLE' || s.id === prefillSlotId));
        }
      } catch (e) { console.error('Slots:', e); }
      finally { setLoadingSlots(false); }
    };
    fetchSlots();
  }, [turfId, selectedDate, token, prefillSlotId]);

  // ── Date picker ───────────────────────────────────────────────────────────
  const openDatePicker = async () => {
    try {
      if (Platform.OS === 'android') {
        const { action, year, month, day } = await DatePickerAndroid.open({ date: selectedDate instanceof Date ? selectedDate : new Date() });
        if (action !== DatePickerAndroid.dismissedAction) setSelectedDate(new Date(year, month, day));
      } else {
        Alert.alert('Enter Date', 'Format: YYYY-MM-DD', [{ text: 'Cancel', style: 'cancel' }]);
      }
    } catch (e) { console.warn(e); }
  };

  // ── No animation needed for single page ───────────────────────────────────

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitChallenge = async () => {
    if (!title || !sportType) { Alert.alert('Missing Info', 'Please add a challenge title.'); return; }
    setLoading(true);
    try {
      const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : (selectedDate || new Date().toISOString().split('T')[0]);
      let finalSlotId = null;
      if (selectedSlot) {
        if (!prefillSlotId) {
          const lockRes = await fetch(`${BACKEND_URL}/challenges/lock-slot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ slotId: selectedSlot }),
          });
          if (!lockRes.ok) throw new Error('Slot was just taken. Pick another.');
        }
        finalSlotId = selectedSlot;
      }
      const payload = {
        title, sportType, type: challengeType,
        challengerTeamId: challengeType === 'TEAM' ? selectedTeam : null,
        turfId: turfId || null, slotId: finalSlotId,
        scheduledDate: dateStr, scheduledTime: selectedTime,
        maxPlayers: parseInt(maxPlayers) || 10, message, isPublic: true,
      };
      const res = await fetch(`${BACKEND_URL}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create challenge');
      Alert.alert('Challenge Posted! 🏆', 'Your challenge is live.', [
        { text: 'View', onPress: () => navigation.navigate('ChallengeDetail', { challengeId: data.id }) },
        { text: 'Feed', onPress: () => navigation.navigate('Main', { screen: 'Challenges' }) },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORM CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

      {/* Hero */}
      <LinearGradient colors={Colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBand}>
        <View>
          <Text style={s.heroEyebrow}>NEW CHALLENGE</Text>
          <Text style={s.heroHeadline}>Who dares{'\n'}challenge you?</Text>
        </View>
        <View style={s.heroBadge}>
          <Zap size={28} color="#fff" />
        </View>
      </LinearGradient>

      {/* Sport Selector */}
      <View style={s.card}>
        <SectionLabel>Pick your sport</SectionLabel>
        <View style={s.sportGrid}>
          {Object.entries(SPORT_CONFIG).map(([sport, cfg]) => {
            const Icon = cfg.icon;
            const active = sportType === sport;
            return (
              <TouchableOpacity
                key={sport}
                activeOpacity={0.8}
                style={[s.sportTile, active && { borderColor: cfg.color, backgroundColor: cfg.bg }]}
                onPress={() => setSportType(sport)}
              >
                <View style={[s.sportIconRing, { backgroundColor: active ? cfg.color : Colors.surface }]}>
                  <Icon size={18} color={active ? '#fff' : cfg.color} />
                </View>
                <Text style={[s.sportLabel, active && { color: cfg.color, fontWeight: '800' }]}>{cfg.label}</Text>
                {active && <View style={[s.sportDot, { backgroundColor: cfg.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Format */}
      <View style={s.card}>
        <SectionLabel>Match format</SectionLabel>
        <View style={s.formatRow}>
          {[
            { key: 'INDIVIDUAL', label: '1v1 Match', sub: 'Solo face-off', Icon: User },
            { key: 'TEAM', label: 'Squad Match', sub: 'Team vs Team', Icon: Users },
          ].map(({ key, label, sub, Icon }) => {
            const active = challengeType === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                style={[s.formatCard, active && s.formatCardActive]}
                onPress={() => setChallengeType(key)}
              >
                <View style={[s.formatIconBox, active && { backgroundColor: Colors.primary }]}>
                  <Icon size={20} color={active ? '#fff' : Colors.onSurfaceVariant} />
                </View>
                <Text style={[s.formatLabel, active && { color: Colors.primary }]}>{label}</Text>
                <Text style={s.formatSub}>{sub}</Text>
                {active && (
                  <View style={s.formatCheck}>
                    <CheckCircle2 size={14} color={Colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Squad Selector */}
        {challengeType === 'TEAM' && (
          <View style={{ marginTop: 16 }}>
            <Text style={s.inputLabel}>Select Your Squad</Text>
            {teams.length === 0 ? (
              <Text style={s.emptyHint}>You don't have any squads yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {teams.map(team => {
                  const isSelected = selectedTeam === team.id;
                  return (
                    <TouchableOpacity
                      key={team.id}
                      style={[s.venueChip, isSelected && s.venueChipActive]}
                      onPress={() => setSelectedTeam(team.id)}
                      activeOpacity={0.8}
                    >
                      <Users size={14} color={isSelected ? '#fff' : Colors.primary} />
                      <Text style={[s.venueChipText, isSelected && { color: '#fff' }]}>{team.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Title + Max Players */}
      <View style={s.card}>
        <SectionLabel>Challenge details</SectionLabel>
        <View style={s.inputGroup}>
          <Text style={s.inputLabel}>Title</Text>
          <TextInput
            style={s.textInput}
            placeholder="e.g., Ultimate Cricket Showdown"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View style={s.inputGroup}>
          <Text style={s.inputLabel}>Max Players</Text>
          <TextInput
            style={[s.textInput, { width: 100 }]}
            placeholder="11"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={maxPlayers}
            onChangeText={setMaxPlayers}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Venue */}
      <View style={s.card}>
        <SectionLabel>Choose venue</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {turfs.map((turf) => {
            const active = turfId === turf.id;
            return (
              <TouchableOpacity
                key={turf.id}
                style={[s.venueChip, active && s.venueChipActive]}
                onPress={() => setTurfId(turf.id)}
                activeOpacity={0.8}
              >
                <MapPin size={14} color={active ? '#fff' : Colors.primary} />
                <Text style={[s.venueChipText, active && { color: '#fff' }]}>{turf.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {matchingBooking && (
          <View style={s.bookingBanner}>
            <CheckCircle2 size={15} color={Colors.primary} />
            <Text style={s.bookingBannerText}>Pre-filled from your booking</Text>
          </View>
        )}
      </View>

      {/* Date */}
      <View style={s.card}>
        <SectionLabel>Date & time slot</SectionLabel>
        <TouchableOpacity style={s.datePicker} onPress={openDatePicker} activeOpacity={0.8}>
          <Calendar size={18} color={Colors.primary} />
          <Text style={s.datePickerText}>
            {selectedDate instanceof Date ? selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : selectedDate}
          </Text>
          <ChevronRight size={16} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Slot grid */}
        {loadingSlots ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
        ) : turfSlots.length > 0 ? (
          <View style={s.slotGrid}>
            {turfSlots.map(slot => {
              const active = selectedSlot === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[s.slotChip, active && s.slotChipActive]}
                  onPress={() => { setSelectedSlot(slot.id); setSelectedTime(slot.startTime); }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.slotChipText, active && s.slotChipTextActive]}>{slot.startTime}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={s.emptyHint}>{turfId ? 'No slots available for this date.' : 'Select a venue first.'}</Text>
        )}
      </View>

      {/* Trash Talk */}
      <View style={s.card}>
        <SectionLabel>Trash talk <Text style={{ color: Colors.onSurfaceVariant, textTransform: 'none', fontWeight: '600' }}>(optional)</Text></SectionLabel>
        <TextInput
          style={[s.textInput, s.textArea]}
          placeholder={`"Who dares challenge us?"`}
          placeholderTextColor={Colors.onSurfaceVariant}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />
      </View>

    </ScrollView>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Challenge</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {renderForm()}
      </View>

      {/* Footer nav */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.nextBtn}
          onPress={submitChallenge}
          disabled={loading}
          activeOpacity={0.85}
        >
          <View style={s.nextBtnGrad}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={s.nextBtnText}>Publish Challenge</Text>
                <View style={s.nextBtnArrow}>
                  <ChevronRight size={18} color="#fff" />
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.onBackground },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },

  // Hero band
  heroBand: { borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  heroEyebrow: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 6 },
  heroHeadline: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 30 },
  heroBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  // Card
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.outlineLight },

  // Sport grid
  sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sportTile: { width: (SCREEN_WIDTH - 32 - 32 - 40) / 3, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.outlineLight, padding: 12, alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden' },
  sportIconRing: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sportLabel: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant },
  sportDot: { position: 'absolute', bottom: 6, right: 6, width: 6, height: 6, borderRadius: 3 },

  // Format
  formatRow: { flexDirection: 'row', gap: 12 },
  formatCard: { flex: 1, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.outlineLight, padding: 14, gap: 6, position: 'relative', overflow: 'hidden' },
  formatCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(75,122,47,0.06)' },
  formatIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  formatLabel: { fontSize: 13, fontWeight: '700', color: Colors.onBackground, marginTop: 4 },
  formatSub: { fontSize: 11, color: Colors.onSurfaceVariant },
  formatCheck: { position: 'absolute', top: 10, right: 10 },

  // Input
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6 },
  textInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: Colors.onBackground, borderWidth: 1, borderColor: Colors.outlineLight },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },

  // Venue chips
  venueChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.outlineLight, backgroundColor: Colors.background },
  venueChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  venueChipText: { fontSize: 13, fontWeight: '600', color: Colors.onBackground },

  // Booking banner
  bookingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: 'rgba(75,122,47,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  bookingBannerText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  // Date picker
  datePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: Colors.outlineLight },
  datePickerText: { flex: 1, fontSize: 14, color: Colors.onBackground, fontWeight: '500' },

  // Slot grid
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.outlineLight, backgroundColor: Colors.background },
  slotChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotChipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  slotChipTextActive: { color: '#fff' },

  emptyHint: { fontSize: 13, color: Colors.onSurfaceVariant, fontStyle: 'italic', marginTop: 12 },

  // Summary preview
  summary: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(75,122,47,0.15)' },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: Colors.onBackground, marginBottom: 10 },
  summaryMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  summaryPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(75,122,47,0.12)' },
  summaryPillText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  // Footer
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.outlineLight, backgroundColor: Colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.surface },
  backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.onBackground },
  nextBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 6, paddingVertical: 6, backgroundColor: '#1A1A1A' },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  nextBtnArrow: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

export default CreateChallengeScreen;
