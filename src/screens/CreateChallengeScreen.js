import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Alert, Animated, Dimensions, Platform, DatePickerAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft, CheckCircle2, Trophy, MapPin, Calendar, MessageSquare, Award, Flame, Target, Sparkles, User, Users, Check } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useUserBookings, useBookingForTurfDate, useOtherBookingsInTurf } from '../hooks/useChallengeFlow';
import OtherUsersBookings from '../components/OtherUsersBookings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.18.23:5000/api';

const CreateChallengeScreen = ({ route, navigation }) => {
  const { user, token } = useAuth();
  const { prefillTurfId, prefillSlotId, prefillDate, prefillTime } = route?.params || {};
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Form State
  const [sportType, setSportType] = useState('CRICKET');
  const [challengeType, setChallengeType] = useState('INDIVIDUAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  // Enhanced: Load user's bookings and find matching bookings in turf
  const { bookings: userBookings } = useUserBookings(token);
  const matchingBooking = useBookingForTurfDate(turfId, selectedDate, userBookings);
  const { otherBookings, loading: loadingOtherBookings } = useOtherBookingsInTurf(
    turfId,
    selectedDate,
    user?.id,
    token
  );

  const sports = ['CRICKET', 'FOOTBALL', 'TENNIS', 'BADMINTON', 'BASKETBALL'];
  const types = ['INDIVIDUAL', 'TEAM'];

  // Auto-prefill if matching booking found
  useEffect(() => {
    if (matchingBooking && !selectedSlot) {
      setSelectedSlot(matchingBooking.slotId);
      setSelectedTime(matchingBooking.timeSlot || matchingBooking.scheduledTime || '');
      if (matchingBooking.turf?.name) {
        // Turf name can be displayed in UI but turfId is already set
      }
    }
  }, [matchingBooking, selectedSlot]);

  // Fetch turfs
  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/turfs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTurfs(data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching turfs:', error);
      }
    };
    fetchTurfs();
  }, [token]);

  // Fetch teams if user is logged in
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/teams/my-teams`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
          if (data.length > 0) {
            setSelectedTeam(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    if (challengeType === 'TEAM') {
      fetchTeams();
    }
  }, [challengeType, token]);

  // Fetch slots when turf or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!turfId || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate;
        const response = await fetch(`${BACKEND_URL}/turfs/${turfId}/slots?date=${dateStr}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // If prefill is provided, we might have already booked the slot, so we can't filter out by AVAILABLE.
          // In that case, we should manually inject the slot if it's missing or allow BOOKED slots if it matches prefillSlotId.
          setTurfSlots(data.filter(s => s.status === 'AVAILABLE' || s.id === prefillSlotId));
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [turfId, selectedDate, token, prefillSlotId]);

  const handleDateChange = (text) => {
    setSelectedDate(text);
  };

  const openDatePicker = async () => {
    try {
      if (Platform.OS === 'android') {
        const { action, year, month, day } = await DatePickerAndroid.open({
          date: selectedDate instanceof Date ? selectedDate : new Date(),
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          const date = new Date(year, month, day);
          setSelectedDate(date);
        }
      } else {
        // For iOS, show simple date input field - user types date
        Alert.alert('Enter Date', 'Format: YYYY-MM-DD (e.g., 2026-06-15)', [
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } catch ({ code, message }) {
      console.warn('DatePicker Error:', message);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      submitChallenge();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const submitChallenge = async () => {
    if (!title || !sportType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Format date properly
      let dateStr;
      if (selectedDate instanceof Date) {
        dateStr = selectedDate.toISOString().split('T')[0];
      } else {
        dateStr = selectedDate || new Date().toISOString().split('T')[0];
      }

      // Lock the slot if selected (skip lock if it's prefilled, because it's already booked)
      let finalSlotId = null;
      if (selectedSlot) {
        if (!prefillSlotId) {
          const lockRes = await fetch(`${BACKEND_URL}/challenges/lock-slot`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ slotId: selectedSlot }),
          });
          if (!lockRes.ok) {
            throw new Error('Failed to lock the selected slot. It might have been booked already.');
          }
        }
        finalSlotId = selectedSlot;
      }

      const payload = {
        title,
        description,
        sportType,
        type: challengeType,
        challengerTeamId: challengeType === 'TEAM' ? selectedTeam : null,
        turfId: turfId || null,
        slotId: finalSlotId,
        scheduledDate: dateStr,
        scheduledTime: selectedTime,
        maxPlayers: parseInt(maxPlayers) || 10,
        message,
        isPublic: true,
      };

      console.log('Creating challenge with payload:', payload);
      console.log('Backend URL:', BACKEND_URL);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${BACKEND_URL}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create challenge');
      }

      Alert.alert('Success!', 'Challenge created successfully!', [
        {
          text: 'View Challenge',
          onPress: () => {
            navigation.navigate('ChallengeDetail', { challengeId: data.id });
          },
        },
        {
          text: 'Go to Feed',
          onPress: () => {
            navigation.navigate('Main', { screen: 'Challenges' });
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', error.message || 'Failed to create challenge. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Sport & Type Selection
  const Step1 = () => {
    const sportConfig = {
      CRICKET: { icon: Award, label: 'Cricket', desc: 'Bat & ball turf battle', color: '#E0A96D' },
      FOOTBALL: { icon: Flame, label: 'Football', desc: 'Fast-paced grid match', color: '#FF7E67' },
      TENNIS: { icon: Target, label: 'Tennis', desc: 'Intense court rallies', color: '#4E9F3D' },
      BADMINTON: { icon: Sparkles, label: 'Badminton', desc: 'Speedy indoor shuttle', color: '#D4B499' },
      BASKETBALL: { icon: Trophy, label: 'Basketball', desc: 'High hoop action', color: '#F0A500' }
    };

    return (
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.stepContainer}
      >
        {/* Sleek Hero Banner Card */}
        <LinearGradient
          colors={Colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Turf Matchmaker</Text>
              <Text style={styles.heroSubtitle}>Host a challenge, invite squads, and claim your victory.</Text>
            </View>
            <Trophy size={48} color="rgba(255,255,255,0.25)" style={styles.heroIcon} />
          </View>
        </LinearGradient>

        <Text style={styles.label}>Select Sport *</Text>
        <View style={styles.sportsContainer}>
          {sports.map((sport) => {
            const config = sportConfig[sport] || { icon: Trophy, label: sport, desc: '', color: Colors.primary };
            const SportIcon = config.icon;
            const isSelected = sportType === sport;
            return (
              <TouchableOpacity
                key={sport}
                activeOpacity={0.85}
                style={[
                  styles.sportCard,
                  isSelected && styles.sportCardActive
                ]}
                onPress={() => setSportType(sport)}
              >
                <View style={[styles.sportIconCircle, { backgroundColor: isSelected ? 'rgba(75, 122, 47, 0.12)' : Colors.surfaceContainer }]}>
                  <SportIcon size={22} color={isSelected ? Colors.primary : Colors.onSurfaceVariant} />
                </View>
                <View style={styles.sportInfo}>
                  <Text style={[styles.sportName, isSelected && styles.sportNameActive]}>{config.label}</Text>
                  <Text style={styles.sportDesc}>{config.desc}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={12} color="#fff" style={{ fontWeight: 'bold' }} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>Select Format *</Text>
        <View style={styles.formatContainer}>
          {types.map((type) => {
            const isSelected = challengeType === type;
            const FormatIcon = type === 'INDIVIDUAL' ? User : Users;
            const titleText = type === 'INDIVIDUAL' ? '1v1 Match' : 'Squad Match';
            const descText = type === 'INDIVIDUAL'
              ? 'Face another player.'
              : 'Squad vs Squad battle.';

            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.85}
                style={[
                  styles.formatCard,
                  isSelected && styles.formatCardActive
                ]}
                onPress={() => setChallengeType(type)}
              >
                <View style={styles.formatRow}>
                  <View style={[styles.formatIconCircle, { backgroundColor: isSelected ? 'rgba(75, 122, 47, 0.12)' : Colors.surfaceContainer }]}>
                    <FormatIcon size={20} color={isSelected ? Colors.primary : Colors.onSurfaceVariant} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.formatTitle, isSelected && styles.formatTitleActive]}>
                      {titleText}
                    </Text>
                    <Text style={styles.formatDesc}>{descText}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.formatCheck}>
                    <CheckCircle2 size={16} color={Colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Step 2: Title & Description
  const Step2 = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 2: Challenge Details</Text>
        <Text style={styles.stepSubtitle}>Give your challenge a catchy name!</Text>
      </View>

      <Text style={styles.label}>Challenge Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Ultimate Cricket Showdown"
        placeholderTextColor={Colors.onSurfaceVariant}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add details about the challenge..."
        placeholderTextColor={Colors.onSurfaceVariant}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Max Players</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 11"
        placeholderTextColor={Colors.onSurfaceVariant}
        value={maxPlayers}
        onChangeText={setMaxPlayers}
        keyboardType="number-pad"
      />
    </ScrollView>
  );

  // Step 3: Turf & Date/Time
  const Step3 = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 3: Select Turf & Schedule</Text>
        <Text style={styles.stepSubtitle}>Where and when will the challenge happen?</Text>
      </View>

      <Text style={styles.label}>Turf (Optional)</Text>
      {turfs.length > 0 ? (
        <View>
          {turfs.map((turf) => (
            <TouchableOpacity
              key={turf.id}
              style={[
                styles.turfCard,
                turfId === turf.id && styles.turfCardActive
              ]}
              onPress={() => setTurfId(turf.id)}
            >
              <View style={styles.turfCardContent}>
                <MapPin size={20} color={turfId === turf.id ? Colors.primary : Colors.onSurfaceVariant} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.turfName}>{turf.name}</Text>
                  <Text style={styles.turfLocation}>{turf.city || 'Location'}</Text>
                </View>
              </View>
              {turfId === turf.id && <CheckCircle2 size={20} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No turfs available</Text>
      )}

      <Text style={[styles.label, { marginTop: 24 }]}>Date</Text>
      <TouchableOpacity
        style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}
        onPress={openDatePicker}
      >
        <Calendar size={18} color={Colors.primary} />
        <Text style={[styles.inputText, { marginLeft: 8, flex: 1 }]}>
          {selectedDate instanceof Date ? selectedDate.toDateString() : selectedDate || 'Tap to select date'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 16 }]}>Select Slot</Text>
      {loadingSlots ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : turfSlots.length > 0 ? (
        <View style={styles.optionsGrid}>
          {turfSlots.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.optionCard,
                selectedSlot === slot.id && styles.optionCardActive,
                { paddingVertical: 10 }
              ]}
              onPress={() => {
                setSelectedSlot(slot.id);
                setSelectedTime(slot.startTime);
              }}
            >
              <Text style={[
                styles.optionText,
                selectedSlot === slot.id && styles.optionTextActive,
                { marginTop: 0, fontSize: 14 }
              ]}>
                {slot.startTime} - {slot.endTime}
              </Text>
              <Text style={{ fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 4 }}>
                ₹{slot.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{turfId ? 'No slots available for this date' : 'Select a turf first'}</Text>
      )}

      {/* Show other users' bookings & quick challenge options */}
      {turfId && selectedDate && (
        <OtherUsersBookings
          otherBookings={otherBookings}
          loading={loadingOtherBookings}
          onSendChallenge={(otherUser) => {
            // This will be implemented when user sends quick challenge
            console.log('Sending challenge to:', otherUser);
            // Could pre-fill and navigate to challenge confirmation
          }}
          currentUserName={user?.name || 'You'}
          turfName={turfs.find(t => t.id === turfId)?.name || 'this turf'}
          bookingDate={selectedDate instanceof Date ? selectedDate.toDateString() : selectedDate}
        />
      )}

      {/* Show if user already booked this slot */}
      {matchingBooking && (
        <View style={styles.alreadyBookedBanner}>
          <CheckCircle2 size={20} color={Colors.success} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alreadyBookedTitle}>You're already booked here!</Text>
            <Text style={styles.alreadyBookedText}>
              We've pre-filled your details. Just add challenge details!
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // Step 4: Trash Talk Message
  const Step4 = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 4: Add Trash Talk</Text>
        <Text style={styles.stepSubtitle}>Make it exciting with a bold message!</Text>
      </View>

      <Text style={styles.label}>Challenge Message (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g., 'We're unbeatable! Who dares to challenge us?'"
        placeholderTextColor={Colors.onSurfaceVariant}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>Message Preview:</Text>
        <View style={styles.previewContent}>
          <Text style={styles.previewText}>{message || 'Your message will appear here...'}</Text>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Challenge Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sport:</Text>
          <Text style={styles.summaryValue}>{sportType}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type:</Text>
          <Text style={styles.summaryValue}>{challengeType}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Title:</Text>
          <Text style={styles.summaryValue}>{title || 'Not set'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>
            {selectedDate instanceof Date ? selectedDate.toDateString() : (selectedDate || 'Not set')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 4</Text>
      </View>

      {/* Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, !step || step === 1 ? styles.buttonDisabled : {}]}
          onPress={handleBack}
          disabled={step === 1}
        >
          <ChevronLeft size={20} color={step === 1 ? Colors.onSurfaceVariant : Colors.onBackground} />
          <Text style={[styles.buttonText, step === 1 && styles.buttonDisabledText]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <>
              <Text style={styles.bookBtnText}>
                {step === 4 ? 'Publish' : 'Next'}
              </Text>
              <View style={styles.bookBtnArrow}>
                <ChevronRight size={20} color={Colors.primary} />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  stepContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 15,
  },
  heroIcon: {
    opacity: 0.75,
  },
  sportsContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  sportCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.outlineLight,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  sportCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(75, 122, 47, 0.04)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sportIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  sportNameActive: {
    color: Colors.primary,
  },
  sportDesc: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: Colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  formatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.outlineLight,
    borderRadius: 14,
    padding: 12,
    position: 'relative',
  },
  formatCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(75, 122, 47, 0.04)',
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  formatTitleActive: {
    color: Colors.primary,
  },
  formatDesc: {
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 12,
  },
  formatCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.onBackground,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onBackground,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    color: Colors.onBackground,
    fontSize: 14,
    marginLeft: 8,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  turfCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  turfCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
  },
  turfCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  turfName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  turfLocation: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  previewBox: {
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  previewContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 10,
  },
  previewText: {
    fontSize: 13,
    color: Colors.onBackground,
    fontStyle: 'italic',
  },
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    color: Colors.onBackground,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 122, 47, 0.1)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  buttonDisabledText: {
    color: Colors.onSurfaceVariant,
  },
  bookBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.headerDark,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bookBtnArrow: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyBookedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  alreadyBookedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 2,
  },
  alreadyBookedText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
});

export default CreateChallengeScreen;

