import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ArrowLeft, MapPin, Calendar, Users, Target } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import Toast from 'react-native-toast-message';

const SPORTS = ['CRICKET', 'FOOTBALL', 'TENNIS', 'BADMINTON', 'BASKETBALL', 'VOLLEYBALL'];

export default function CreateLFPScreen({ navigation }) {
  const [sport, setSport] = useState('CRICKET');
  const [playersNeeded, setPlayersNeeded] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleCreate = async () => {
    if (!playersNeeded || !date || !location) {
      Toast.show({ type: 'error', text1: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    try {
      // Basic date parsing assumption for demo. Ideally use a DatePicker component.
      // We will just create a date object for tomorrow at 6 PM if they type anything for now.
      // In a real app, use @react-native-community/datetimepicker
      let parsedDate = new Date();
      parsedDate.setDate(parsedDate.getDate() + 1);
      parsedDate.setHours(18, 0, 0, 0);

      const res = await fetch(`${API_URL}/lfp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sport,
          playersNeeded: parseInt(playersNeeded),
          date: parsedDate.toISOString(), // placeholder
          location,
          description
        })
      });

      const data = await res.json();
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Request created successfully!' });
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: data.error || 'Failed to create request' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Select Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportScroll}>
            {SPORTS.map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.sportChip, sport === s && styles.sportChipActive]}
                onPress={() => setSport(s)}
              >
                <Text style={[styles.sportChipText, sport === s && styles.sportChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Players Needed</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                keyboardType="numeric"
                value={playersNeeded}
                onChangeText={setPlayersNeeded}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Gomti Nagar Turf"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time & Date</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Today 6 PM"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Details (Optional)</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              placeholder="e.g. Bring your own kit, intermediate level..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Post Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  sportScroll: { flexDirection: 'row', marginBottom: 25 },
  sportChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f8f9fa', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  sportChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sportChipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  sportChipTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1a1a1a' },
  textArea: { height: 100, alignItems: 'flex-start', paddingTop: 15 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  submitBtn: { backgroundColor: Colors.primary, height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
