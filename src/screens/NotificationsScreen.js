import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ArrowLeft, Share2, Calendar, Trophy, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://10.185.142.203:5000/api';

const NotificationsScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${BACKEND_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  const handleNotificationPress = (item) => {
    if (!item.isRead) markAsRead(item.id);

    // Depending on type, do an action
    if (item.type === 'CHALLENGE_CREATED' && item.data?.shareCode) {
      // Direct them to the challenge detail page or offer to share
      Alert.alert(
        'Challenge Created',
        'Your challenge is live! Want to share it on WhatsApp?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Challenge', onPress: () => navigation.navigate('ChallengeDetail', { challengeId: item.data.challengeId }) },
          {
            text: 'Share Link',
            onPress: () => Share.share({
              message: `I challenge you! Join my match here: exponew://challenge/share/${item.data.shareCode}`,
              title: item.title,
            })
          }
        ]
      );
    }
    // Handle other types if necessary
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'CHALLENGE_CREATED':
      case 'CHALLENGE_ACCEPTED':
        return <Trophy size={20} color={Colors.primary} />;
      case 'BOOKING_CONFIRMATION':
      case 'PAYMENT_SUCCESS':
        return <CheckCircle2 size={20} color="#4CAF50" />;
      case 'REMINDER':
        return <Calendar size={20} color="#FF9800" />;
      case 'CANCELLATION':
      case 'RAIN_ALERT':
        return <AlertCircle size={20} color="#F44336" />;
      default:
        return <Bell size={20} color={Colors.secondary} />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        {renderIcon(item.type)}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Bell size={48} color={Colors.secondary} style={{ marginBottom: 16, opacity: 0.5 }} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
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
  markAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.secondary,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: 'rgba(138, 43, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.2)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  body: {
    fontSize: 13,
    color: Colors.secondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: Colors.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  }
});

export default NotificationsScreen;
