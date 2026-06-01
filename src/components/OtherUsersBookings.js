import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image, FlatList, Dimensions
} from 'react-native';
import { MessageCircle, Check, X, Clock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Component to display and suggest challenges to other users
 * who have booked slots in the same turf at the same time
 */
const OtherUsersBookings = ({
  otherBookings,
  loading,
  onSendChallenge,
  currentUserName,
  turfName,
  bookingDate,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [sendingChallenges, setSendingChallenges] = useState({});

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!otherBookings || otherBookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color={Colors.onSurfaceVariant} />
        <Text style={styles.emptyTitle}>No Other Users Booking</Text>
        <Text style={styles.emptyText}>
          Create and share your challenge. Other users will be notified!
        </Text>
      </View>
    );
  }

  const handleSendChallenge = async (otherUser) => {
    setSendingChallenges(prev => ({ ...prev, [otherUser.userId]: true }));

    try {
      await onSendChallenge(otherUser);
      Toast.show({
        type: 'success',
        text1: 'Challenge Sent! 🎯',
        text2: `Challenge request sent to ${otherUser.user?.name || 'User'}`,
        duration: 3000,
      });
      setSelectedUserId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to send challenge. Please try again.');
    } finally {
      setSendingChallenges(prev => ({ ...prev, [otherUser.userId]: false }));
    }
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        selectedUserId === item.userId && styles.userCardSelected,
      ]}
      onPress={() => setSelectedUserId(selectedUserId === item.userId ? null : item.userId)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* User Avatar & Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user?.name || 'User'}</Text>
            <Text style={styles.userTime}>
              ⏱️ {item.timeSlot || item.scheduledTime || 'Time TBD'}
            </Text>
            {item.user?.rating && (
              <Text style={styles.userRating}>
                ⭐ {item.user.rating.toFixed(1)} • {item.user.matchesPlayed || 0} matches
              </Text>
            )}
          </View>
        </View>

        {/* Challenge Button */}
        {selectedUserId === item.userId && (
          <TouchableOpacity
            style={styles.challengeBtn}
            onPress={() => handleSendChallenge(item)}
            disabled={sendingChallenges[item.userId]}
            activeOpacity={0.7}
          >
            {sendingChallenges[item.userId] ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.challengeBtnText}>Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded Details */}
      {selectedUserId === item.userId && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Time:</Text>
            <Text style={styles.detailValue}>{item.timeSlot || 'TBD'}</Text>
          </View>
          {item.sport && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sport:</Text>
              <Text style={styles.detailValue}>{item.sport}</Text>
            </View>
          )}
          {item.teamSize && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Team Size:</Text>
              <Text style={styles.detailValue}>{item.teamSize} players</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.sectionTitle}>🎯 Challenge Someone!</Text>
        <Text style={styles.sectionSubtitle}>
          {otherBookings.length} other {otherBookings.length === 1 ? 'user has' : 'users have'} booked at {turfName}
        </Text>
      </View>

      <FlatList
        data={otherBookings}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.userId || item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Pro Tip</Text>
        <Text style={styles.tipText}>
          Select a user and send them a quick challenge. They'll get notified immediately!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },

  // Header
  headerBox: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  // User Card
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  userCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 2,
  },
  userTime: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  userRating: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Challenge Button
  challengeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Expanded Details
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.onBackground,
    fontWeight: '700',
  },

  // Separator
  separator: {
    height: 8,
  },

  // Tip Box
  tipBox: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
});

export default OtherUsersBookings;
