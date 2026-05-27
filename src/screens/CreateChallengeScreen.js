import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Alert, Animated, Dimensions, Platform, DatePickerAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft, CheckCircle2, Trophy, MapPin, Calendar, MessageSquare } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.18.23:5000/api';

const CreateChallengeScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Form State
  const [sportType, setSportType] = useState('CRICKET');
  const [challengeType, setChallengeType] = useState('INDIVIDUAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [turfId, setTurfId] = useState(null);
  const [turfs, setTurfs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [maxPlayers, setMaxPlayers] = useState('10');

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const sports = ['CRICKET', 'FOOTBALL', 'TENNIS', 'BADMINTON', 'BASKETBALL'];
  const types = ['INDIVIDUAL', 'TEAM'];

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

      const payload = {
        title,
        description,
        sportType,
        type: challengeType,
        challengerTeamId: challengeType === 'TEAM' ? selectedTeam : null,
        turfId: turfId || null,
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
            navigation.navigate('Challenges');
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
  const Step1 = () => (
    <ScrollView ref={scrollRef} scrollEnabled={false} contentContainerStyle={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 1: Choose Sport & Challenge Type</Text>
        <Text style={styles.stepSubtitle}>What sport and format do you want to challenge?</Text>
      </View>

      <Text style={styles.label}>Sport Type *</Text>
      <View style={styles.optionsGrid}>
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.optionCard,
              sportType === sport && styles.optionCardActive
            ]}
            onPress={() => setSportType(sport)}
          >
            <Trophy size={24} color={sportType === sport ? Colors.primary : Colors.secondary} />
            <Text style={[
              styles.optionText,
              sportType === sport && styles.optionTextActive
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 24 }]}>Challenge Type *</Text>
      <View style={styles.optionsGrid}>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionCard,
              challengeType === type && styles.optionCardActive
            ]}
            onPress={() => setChallengeType(type)}
          >
            <Trophy size={24} color={challengeType === type ? Colors.primary : Colors.secondary} />
            <Text style={[
              styles.optionText,
              challengeType === type && styles.optionTextActive
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

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
        placeholderTextColor={Colors.secondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add details about the challenge..."
        placeholderTextColor={Colors.secondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Max Players</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 11"
        placeholderTextColor={Colors.secondary}
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
                <MapPin size={20} color={turfId === turf.id ? Colors.primary : Colors.secondary} />
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

      <Text style={[styles.label, { marginTop: 16 }]}>Time</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        placeholderTextColor={Colors.secondary}
        value={selectedTime}
        onChangeText={setSelectedTime}
      />
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
        placeholderTextColor={Colors.secondary}
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
          <ChevronLeft size={20} color={step === 1 ? Colors.secondary : Colors.text} />
          <Text style={[styles.buttonText, step === 1 && styles.buttonDisabledText]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonPrimaryText}>
                {step === 4 ? 'Publish Challenge' : 'Next'}
              </Text>
              {step < 4 && <ChevronRight size={20} color="#fff" />}
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
    backgroundColor: Colors.inputBackground,
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
    color: Colors.secondary,
    fontWeight: '600',
  },
  stepContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
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
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    color: Colors.text,
    fontSize: 14,
    marginLeft: 8,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  turfCard: {
    backgroundColor: Colors.inputBackground,
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
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  turfCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  turfName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  turfLocation: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  previewBox: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  previewContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 10,
  },
  previewText: {
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
  },
  summaryBox: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 43, 226, 0.1)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.inputBackground,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonDisabledText: {
    color: Colors.secondary,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CreateChallengeScreen;
