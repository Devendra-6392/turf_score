import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Trophy, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';

const MatchResultScreen = ({ route, navigation }) => {
  const { challengeId } = route.params;
  const { token } = useAuth();
  const [creatorScore, setCreatorScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (creatorScore === '' || opponentScore === '') {
      Alert.alert('Error', 'Please enter both scores');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/challenges/submit-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId,
          creatorScore: parseInt(creatorScore),
          opponentScore: parseInt(opponentScore)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit result');
      }

      Alert.alert('Success!', 'Match result submitted successfully! XP and Ratings updated. 🚀', [
        { text: 'Awesome', onPress: () => navigation.navigate('Main', { screen: 'Challenges' }) }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Trophy size={60} color={Colors.primary} style={styles.icon} />
        <Text style={styles.title}>Who Won?</Text>
        <Text style={styles.subtitle}>Enter the final scores below to update your stats and XP.</Text>

        <View style={styles.scoreContainer}>
          <View style={styles.teamInput}>
            <Text style={styles.label}>Creator Team Score</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={creatorScore}
              onChangeText={setCreatorScore}
              placeholder="0"
              placeholderTextColor={Colors.secondary}
            />
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.teamInput}>
            <Text style={styles.label}>Opponent Team Score</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={opponentScore}
              onChangeText={setOpponentScore}
              placeholder="0"
              placeholderTextColor={Colors.secondary}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          <View style={styles.buttonGradient}>
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Submit Result</Text>
                <View style={styles.primaryButtonArrow}>
                  <Trophy size={18} color="#fff" />
                </View>
              </>
            )}
          </View>
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 122, 47, 0.1)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  teamInput: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    width: 80,
    height: 80,
    borderRadius: 16,
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent,
    marginHorizontal: 16,
    marginTop: 20,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  buttonGradient: {
    paddingVertical: 8,
    paddingLeft: 24,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  primaryButtonArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MatchResultScreen;
