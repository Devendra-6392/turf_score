import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, LogOut, Award, Calendar, Edit3, Save, X, Phone, Mail,
  Clock, CheckCircle, MapPin, ChevronRight, Wallet
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const BACKEND_URL = 'http://10.185.142.203:5000/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Booking Card (Premium) ──────────────────────────────────
const BookingCard = memo(({ booking, onPress }) => {
  const date = new Date(booking.bookingDate);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const statusColors = {
    PAID: { bg: '#10B981', text: '#fff', label: 'Confirmed' },
    CONFIRMED: { bg: '#10B981', text: '#fff', label: 'Confirmed' },
    CANCELLED: { bg: '#EF4444', text: '#fff', label: 'Cancelled' },
    CANCEL_REQUESTED: { bg: '#F59E0B', text: '#fff', label: 'Reviewing' },
    PENDING: { bg: '#F59E0B', text: '#fff', label: 'Pending' },
  };

  const statusStyle = statusColors[booking.status] || statusColors.PAID;

  return (
    <TouchableOpacity onPress={() => onPress(booking)} activeOpacity={0.9} style={styles.bookingCard}>
      <View style={styles.bookingImageContainer}>
        <Image 
          source={{ uri: booking.turf?.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }} 
          style={styles.bookingImage} 
        />
        <View style={[styles.bookingStatusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.bookingStatusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingTurfName} numberOfLines={1}>{booking.turf?.name || 'Turf Arena'}</Text>
        <View style={styles.bookingInfoRow}>
          <Calendar size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.bookingInfoText}>{formattedDate} • {booking.timeSlot}</Text>
        </View>
        <View style={styles.bookingBottomRow}>
          <Text style={styles.bookingAmount}>₹{booking.amount}</Text>
          <View style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Personal Info Section ──────────────────────────────────
const PersonalInfoSection = memo(({ user, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  const handleSave = useCallback(async () => {
    try {
      await onSave({ name: name.trim(), phone: phone.trim() });
      setEditing(false);
      Toast.show({ type: 'success', text1: 'Profile Updated' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message });
    }
  }, [name, phone, onSave]);

  const handleCancel = useCallback(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditing(false);
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        {!editing ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Edit3 size={14} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <X size={16} color={Colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size={14} color="#fff" /> : <Save size={14} color="#fff" />}
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        {/* Name */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: 'rgba(75, 122, 47, 0.1)' }]}>
            <User size={18} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.onSurfaceVariant}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoDivider} />

        {/* Email */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: 'rgba(75, 122, 47, 0.1)' }]}>
            <Mail size={18} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
          {!editing && <CheckCircle size={18} color={Colors.success} />}
        </View>

        <View style={styles.infoDivider} />

        {/* Phone */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: 'rgba(75, 122, 47, 0.1)' }]}>
            <Phone size={18} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.onSurfaceVariant}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.infoValue, !user?.phone && styles.notSet]}>
                {user?.phone || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoDivider} />

        {/* Member Since */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: 'rgba(75, 122, 47, 0.1)' }]}>
            <Clock size={18} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

// ─── Booking History Section ────────────────────────────────
const BookingHistorySection = memo(({ bookings, loading, onPress }) => {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.bookingsContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <Text style={styles.bookingCount}>{bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}</Text>
      </View>

      {bookings.length > 0 ? (
        bookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} onPress={onPress} />
        ))
      ) : (
        <View style={styles.emptyBookings}>
          <Calendar size={48} color={Colors.outline} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>When you book a turf, it will appear here.</Text>
        </View>
      )}
    </View>
  );
});

// ─── Main Profile Screen ────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { user, signOut, refreshUser, updateUser, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasFetchedBookings, setHasFetchedBookings] = useState(false);

  useEffect(() => {
    if (token) refreshUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings' && !hasFetchedBookings && user?.id) {
      fetchUserBookings();
    }
  }, [activeTab, hasFetchedBookings, user?.id]);

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch(`${BACKEND_URL}/bookings/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setHasFetchedBookings(true);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      if (activeTab === 'bookings') setHasFetchedBookings(false);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, activeTab]);

  const handleSaveProfile = useCallback(async (updates) => {
    setSaving(true);
    try {
      await updateUser(updates);
    } finally {
      setSaving(false);
    }
  }, [updateUser]);

  const handleBookingPress = useCallback((booking) => {
    navigation.navigate('BookingDetail', { booking });
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.replace('Login');
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Failed to log out' });
            }
          }
        }
      ]
    );
  }, [signOut, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerDark} />
      
      {/* ── Top Header Background ── */}
      <View style={styles.headerBg} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={[Colors.primary]}
            />
          }
        >
          {/* ── User Membership Card ── */}
          <View style={styles.userCardContainer}>
            <LinearGradient
              colors={['#1A1A1A', '#2C2C2C']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.userCard}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatarWrap}>
                  <Image source={require('../assets/avatar.png')} style={styles.avatar} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Player'}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                </View>
                <View style={styles.proBadge}>
                  <Award size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{user?.matchesPlayed || 0}</Text>
                  <Text style={styles.statLabel}>Matches</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{user?.rating?.toFixed(1) || '5.0'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{user?.xp || 0}</Text>
                  <Text style={styles.statLabel}>XP Points</Text>
                </View>
              </View>

              <View style={styles.cardWalletLine} />

              <View style={styles.cardWalletRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Wallet size={16} color="#FFD700" />
                  <Text style={styles.cardWalletLabel}>Wallet Balance</Text>
                </View>
                <Text style={styles.cardWalletValue}>₹{user?.wallet?.balance !== undefined ? user.wallet.balance.toFixed(2) : '0.00'}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── Segmented Control ── */}
          <View style={styles.segmentWrap}>
            <View style={styles.segmentControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'info' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('info')}
                activeOpacity={0.8}
              >
                <User size={16} color={activeTab === 'info' ? '#fff' : Colors.onSurfaceVariant} />
                <Text style={[styles.segmentText, activeTab === 'info' && styles.segmentTextActive]}>Profile Info</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === 'bookings' && styles.segmentBtnActive]}
                onPress={() => setActiveTab('bookings')}
                activeOpacity={0.8}
              >
                <Calendar size={16} color={activeTab === 'bookings' ? '#fff' : Colors.onSurfaceVariant} />
                <Text style={[styles.segmentText, activeTab === 'bookings' && styles.segmentTextActive]}>Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Main Content ── */}
          <View style={styles.contentWrap}>
            {activeTab === 'info' ? (
              <PersonalInfoSection user={user} onSave={handleSaveProfile} saving={saving} />
            ) : (
              <BookingHistorySection bookings={bookings} loading={loadingBookings} onPress={handleBookingPress} />
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 250,
    backgroundColor: Colors.headerDark,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // ── Membership Card ──
  userCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 24,
  },
  userCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    width: 64, height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginRight: 16,
  },
  avatar: { width: '100%', height: '100%' },
  cardInfo: { flex: 1 },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  proBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1, height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  cardWalletLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 14,
  },
  cardWalletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  cardWalletLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  cardWalletValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '800',
  },

  // ── Segments ──
  segmentWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 6,
    borderRadius: 20,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.headerDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: '#fff',
  },

  // ── Content ──
  contentWrap: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  
  // ── Personal Info ──
  infoSection: {},
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  editBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    width: 36, height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  infoInput: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  notSet: {
    color: Colors.outline,
    fontStyle: 'italic',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.outlineLight,
    marginHorizontal: 16,
  },

  // ── Bookings ──
  bookingsContainer: {},
  bookingCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    padding: 12,
  },
  bookingImageContainer: {
    width: 100, height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  bookingImage: {
    width: '100%', height: '100%',
  },
  bookingStatusBadge: {
    position: 'absolute',
    top: 8, left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bookingTurfName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 6,
  },
  bookingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingInfoText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  bookingBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bookingAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  loadingWrap: {
    paddingVertical: 40,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    marginTop: 20,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.error,
  },
});

export default memo(ProfileScreen);
