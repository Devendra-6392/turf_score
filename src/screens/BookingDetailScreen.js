import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Dimensions, StatusBar, Linking, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import {
  ArrowLeft, MapPin, Calendar, Clock, CreditCard,
  CheckCircle2, AlertCircle, XCircle, ChevronRight, User
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import Toast from 'react-native-toast-message';

const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BookingDetailScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);

  const date = new Date(booking.bookingDate || booking.scheduledDate || booking.createdAt || Date.now());
  const formattedDate = date.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return { color: '#10B981', bg: '#10B98115', icon: <CheckCircle2 size={28} color="#10B981" />, label: 'Booking Confirmed' };
      case 'CANCEL_REQUESTED':
        return { color: '#F59E0B', bg: '#F59E0B15', icon: <AlertCircle size={28} color="#F59E0B" />, label: 'Reviewing Cancellation' };
      case 'CANCELLED':
        return { color: '#EF4444', bg: '#EF444415', icon: <XCircle size={28} color="#EF4444" />, label: 'Booking Cancelled' };
      default:
        return { color: Colors.primary, bg: Colors.primary + '15', icon: <Clock size={28} color={Colors.primary} />, label: status };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  const handleRequestCancellation = () => {
    Alert.alert(
      'Request Cancellation',
      'Are you sure you want to cancel this booking? If approved, the refund will be credited to your account.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${BACKEND_URL}/bookings/${booking.id}/request-cancellation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'User requested cancellation via App' })
              });

              if (response.ok) {
                Toast.show({ type: 'success', text1: 'Request Submitted', text2: 'We will review your request shortly.' });
                navigation.goBack();
              } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to cancel');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerDark} />

      {/* ── Dark Header Background ── */}
      <View style={styles.headerBg} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking ID: #{booking.id.substring(0, 8).toUpperCase()}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Status Banner ── */}
          <View style={styles.statusBanner}>
            <View style={[styles.statusIconWrap, { backgroundColor: statusConfig.bg }]}>
              {statusConfig.icon}
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              <Text style={styles.statusDesc}>
                {booking.status === 'CONFIRMED' || booking.status === 'PAID'
                  ? 'Your turf is ready. Show this at the venue.'
                  : booking.status === 'CANCEL_REQUESTED'
                    ? 'We are processing your refund.'
                    : 'This booking has been cancelled.'}
              </Text>
            </View>
          </View>

          {/* ── Turf Information Card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Turf Details</Text>
            </View>
            <View style={styles.turfRow}>
              <Image
                source={{ uri: booking.turf?.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }}
                style={styles.turfImage}
              />
              <View style={styles.turfInfo}>
                <Text style={styles.turfName}>{booking.turf?.name || 'Turf Arena'}</Text>
                <Text style={styles.turfLocation}>{booking.turf?.location || 'Location not available'}</Text>
                <TouchableOpacity
                  style={styles.directionBtn}
                  onPress={() => {
                    const lat = booking.turf?.latitude;
                    const lng = booking.turf?.longitude;
                    const label = encodeURIComponent(booking.turf?.name || 'Turf Location');
                    let url = '';
                    if (lat && lng) {
                      url = Platform.select({
                        ios: `maps:${lat},${lng}?q=${label}`,
                        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`
                      });
                    } else {
                      const query = encodeURIComponent(booking.turf?.location || booking.turf?.name);
                      url = Platform.select({
                        ios: `maps:0,0?q=${query}`,
                        android: `geo:0,0?q=${query}`
                      });
                    }
                    Linking.openURL(url).catch(() => console.log('Error opening maps'));
                  }}
                >
                  <Text style={styles.directionText}>Get Directions</Text>
                  <ChevronRight size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Schedule Card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Date & Time</Text>
            </View>
            <View style={styles.scheduleGrid}>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>{formattedDate}</Text>
              </View>
              <View style={styles.scheduleDivider} />
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleLabel}>Time Slot</Text>
                <Text style={styles.scheduleValue}>{booking.timeSlot || 'Time not specified'}</Text>
              </View>
            </View>
          </View>

          {/* ── Payment Summary Card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CreditCard size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Payment Summary</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>{booking?.paymentDetail?.paymentMethod?.toUpperCase() || 'ONLINE'}</Text>
            </View>
            {booking?.paymentDetail?.razorpayPaymentId && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Transaction ID</Text>
                <Text style={styles.paymentValue}>{booking.paymentDetail.razorpayPaymentId}</Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Booking Amount</Text>
              <Text style={styles.paymentValue}>₹{booking.amount || '0'}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Convenience Fee</Text>
              <Text style={styles.paymentValue}>₹0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{booking.amount || '0'}</Text>
            </View>
          </View>

          {/* ── Cancellation Notice ── */}
          {booking.status === 'CANCEL_REQUESTED' && (
            <View style={styles.alertBox}>
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.alertText}>
                Your cancellation request is currently under review. Refunds usually take 24-48 hours.
              </Text>
            </View>
          )}

          {/* ── Actions ── */}
          {(booking.status === 'CONFIRMED' || booking.status === 'PAID') && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleRequestCancellation}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.error} />
              ) : (
                <>
                  <XCircle size={18} color={Colors.error} />
                  <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                </>
              )}
            </TouchableOpacity>
          )}

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
    height: 180,
    backgroundColor: Colors.headerDark,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Status Banner ──
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  statusIconWrap: {
    width: 56, height: 56,
    borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  statusTextWrap: { flex: 1 },
  statusLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusDesc: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  // ── Cards ──
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },

  // ── Turf Row ──
  turfRow: {
    flexDirection: 'row',
  },
  turfImage: {
    width: 80, height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  turfInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  turfName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  turfLocation: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ── Schedule Grid ──
  scheduleGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
  },
  scheduleItem: { flex: 1 },
  scheduleLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  scheduleDivider: {
    width: 1,
    backgroundColor: Colors.outlineLight,
    marginHorizontal: 16,
  },

  // ── Payment ──
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineLight,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },

  // ── Alerts & Buttons ──
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B10',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B30',
    gap: 12,
    marginBottom: 20,
    alignItems: 'center'
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
    lineHeight: 18,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444410',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF444430',
    gap: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
});

export default BookingDetailScreen;