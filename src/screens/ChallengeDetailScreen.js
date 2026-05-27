import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Share, Linking, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Share2, MessageCircle, MapPin, Calendar, Clock, Users,
  Trophy, Star, Copy, ExternalLink, CheckCircle2
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.18.23:5000/api';

const ChallengeDetailScreen = ({ route, navigation }) => {
  const { user, token } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const challengeId = route.params?.challengeId;
  const shareCode = route.params?.shareCode;

  useEffect(() => {
    fetchChallenge();
  }, [challengeId, shareCode]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      let url;
      if (challengeId) {
        url = `${BACKEND_URL}/challenges/${challengeId}`;
      } else if (shareCode) {
        url = `${BACKEND_URL}/challenges/share/${shareCode}`;
      } else {
        throw new Error('No challenge ID or share code provided');
      }

      console.log('Fetching challenge from:', url);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Challenge data:', data);
      setChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      Alert.alert('Error', error.message || 'Challenge not found');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!challenge) return;

    setAccepting(true);
    try {
      console.log('Accepting challenge:', challenge.id);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${BACKEND_URL}/challenges/${challenge.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      console.log('Accept response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP Error: ${response.status}`);
      }

      const updated = await response.json();
      console.log('Updated challenge:', updated);
      setChallenge(updated);

      Alert.alert('Success!', 'Challenge accepted! 🎉', [
        {
          text: 'View My Challenges',
          onPress: () => navigation.navigate('Challenges'),
        },
        {
          text: 'OK',
        },
      ]);
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', error.message || 'Failed to accept challenge');
    } finally {
      setAccepting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!challenge) return;

    try {
      const deepLink = `exponew://challenge/share/${challenge.shareCode}`;
      const message = `🏏 Challenge Accepted! 🔥\n\n"${challenge.title}"\n\n${challenge.message || 'Join the challenge!'}\n\nAccept this challenge:\n${deepLink}\n\n#TurfScore #Sports`;

      // Share via WhatsApp
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback: Use Share API
        await Share.share({
          message,
          title: challenge.title,
        });
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Error', 'Failed to share challenge');
    }
  };

  const handleCopyShareCode = async () => {
    if (!challenge) return;
    try {
      Alert.alert('Success!', `Challenge link: exponew://challenge/share/${challenge.shareCode}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const isCreator = challenge && user && challenge.creatorId === user.id;
  const isAccepted = challenge?.status === 'ACCEPTED';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Challenge Card Header */}
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.15)', 'rgba(75, 0, 130, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          {/* Status Badge */}
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              isAccepted ? styles.statusAccepted : styles.statusOpen
            ]}>
              <Text style={styles.statusText}>
                {isAccepted ? '✓ ACCEPTED' : 'OPEN'}
              </Text>
            </View>
          </View>

          {/* Title & Creator Info */}
          <Text style={styles.title}>{challenge.title}</Text>
          <View style={styles.creatorRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {challenge.creator.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.creatorName}>Challenged by {challenge.creator.name}</Text>
              <Text style={styles.rating}>★ {challenge.creator.rating || 4.5} ({challenge.creator.matchesPlayed || 0} matches)</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Challenge Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Trophy size={24} color={Colors.primary} />
            <Text style={styles.infoLabel}>Sport</Text>
            <Text style={styles.infoValue}>{challenge.sportType}</Text>
          </View>
          <View style={styles.infoCard}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.infoLabel}>Format</Text>
            <Text style={styles.infoValue}>{challenge.type}</Text>
          </View>
          <View style={styles.infoCard}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.infoLabel}>Players</Text>
            <Text style={styles.infoValue}>{challenge.maxPlayers}</Text>
          </View>
        </View>

        {/* Challenge Message */}
        {challenge.message && (
          <View style={styles.messageSection}>
            <View style={styles.messageBanner}>
              <MessageCircle size={20} color={Colors.accent} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.messageTitle}>Challenge Message</Text>
                <Text style={styles.messageText}>{challenge.message}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Description */}
        {challenge.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{challenge.description}</Text>
          </View>
        )}

        {/* Turf & Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When & Where</Text>
          
          {challenge.turf && (
            <View style={styles.infoRow}>
              <MapPin size={18} color={Colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoRowLabel}>Turf</Text>
                <Text style={styles.infoRowValue}>{challenge.turf.name}</Text>
                <Text style={styles.infoRowSubtitle}>{challenge.turf.city}</Text>
              </View>
            </View>
          )}

          {challenge.scheduledDate && (
            <View style={styles.infoRow}>
              <Calendar size={18} color={Colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoRowLabel}>Date</Text>
                <Text style={styles.infoRowValue}>{new Date(challenge.scheduledDate).toDateString()}</Text>
              </View>
            </View>
          )}

          {challenge.scheduledTime && (
            <View style={styles.infoRow}>
              <Clock size={18} color={Colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoRowLabel}>Time</Text>
                <Text style={styles.infoRowValue}>{challenge.scheduledTime}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Teams (if applicable) */}
        {challenge.type === 'TEAM' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teams</Text>
            
            {challenge.challengerTeam && (
              <View style={styles.teamCard}>
                <Text style={styles.teamLabel}>Challenger</Text>
                <Text style={styles.teamName}>{challenge.challengerTeam.name}</Text>
                {challenge.challengerTeam.members && (
                  <Text style={styles.teamCount}>{challenge.challengerTeam.members.length} members</Text>
                )}
              </View>
            )}

            {isAccepted && challenge.opponentTeam ? (
              <View style={styles.teamCard}>
                <Text style={styles.teamLabel}>Opponent</Text>
                <Text style={styles.teamName}>{challenge.opponentTeam.name}</Text>
                {challenge.opponentTeam.members && (
                  <Text style={styles.teamCount}>{challenge.opponentTeam.members.length} members</Text>
                )}
              </View>
            ) : (
              <View style={styles.teamCard}>
                <Text style={styles.teamLabel}>Opponent</Text>
                <Text style={styles.teamNamePlaceholder}>Waiting for opponent...</Text>
              </View>
            )}
          </View>
        )}

        {/* VS Card (if both teams exist) */}
        {challenge.type === 'TEAM' && isAccepted && (
          <View style={styles.vsCard}>
            <View style={styles.vsContent}>
              <View style={styles.vsTeam}>
                <Text style={styles.vsTeamName}>{challenge.challengerTeam.name}</Text>
              </View>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.vsBadge}
              >
                <Text style={styles.vsBadgeText}>VS</Text>
              </LinearGradient>
              <View style={styles.vsTeam}>
                <Text style={styles.vsTeamName}>{challenge.opponentTeam.name}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {isCreator && !isAccepted && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleShareWhatsApp}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Share2 size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Share to WhatsApp</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!isCreator && !isAccepted && (
            <TouchableOpacity
              style={[styles.primaryButton, accepting && styles.buttonDisabled]}
              onPress={handleAcceptChallenge}
              disabled={accepting}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {accepting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Accept Challenge</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isAccepted && (
            <View style={styles.successMessage}>
              <CheckCircle2 size={24} color={Colors.primary} />
              <Text style={styles.successText}>Challenge Accepted! ✨</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Share.share({
              message: `Check out this challenge on TurfScore! exponew://challenge/share/${challenge.shareCode}`,
              title: challenge.title,
            })}
          >
            <Share2 size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Share Challenge</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    borderBottomColor: 'rgba(138, 43, 226, 0.1)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardHeader: {
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.2)',
  },
  statusRow: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusOpen: {
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
  },
  statusAccepted: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rating: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  messageSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  messageBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.secondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  infoRowLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  infoRowValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRowSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  teamCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  teamLabel: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  teamNamePlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  teamCount: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 4,
  },
  vsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  vsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    padding: 16,
  },
  vsTeam: {
    flex: 1,
    alignItems: 'center',
  },
  vsTeamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  vsBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingHorizontal: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ChallengeDetailScreen;
