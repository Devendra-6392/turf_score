import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Platform, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://10.185.142.203:5000/api';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Calendar Component ─────────────────────────────────────
const Calendar = memo(({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayPress = (day) => {
    const date = new Date(year, month, day);
    if (date < today) return;
    onSelectDate(date);
  };

  // Build calendar grid
  const cells = [];
  // Previous month trailing days
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrevMonth - firstDay + i + 1, type: 'prev' });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, type: 'current' });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: 'next' });
  }

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year;
  };

  const isPast = (day) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  const isToday = (day) => {
    return today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;
  };

  return (
    <View style={calStyles.container}>
      {/* Month Navigator */}
      <View style={calStyles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.monthArrow}>
          <ChevronLeft size={22} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{MONTH_NAMES[month]}</Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.monthArrow}>
          <ChevronRight size={22} color={Colors.onBackground} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={calStyles.dayHeaderRow}>
        {DAY_NAMES.map(d => (
          <Text key={d} style={calStyles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      {rows.map((row, ri) => (
        <View key={ri} style={calStyles.weekRow}>
          {row.map((cell, ci) => {
            const isCurrentMonth = cell.type === 'current';
            const selected = isCurrentMonth && isSelected(cell.day);
            const past = isCurrentMonth && isPast(cell.day);
            const todayMark = isCurrentMonth && isToday(cell.day);

            return (
              <TouchableOpacity
                key={ci}
                style={[
                  calStyles.dayCell,
                  selected && calStyles.dayCellSelected,
                  todayMark && !selected && calStyles.dayCellToday,
                ]}
                onPress={() => isCurrentMonth && !past && handleDayPress(cell.day)}
                disabled={!isCurrentMonth || past}
                activeOpacity={0.7}
              >
                <Text style={[
                  calStyles.dayText,
                  !isCurrentMonth && calStyles.dayTextOther,
                  past && calStyles.dayTextPast,
                  selected && calStyles.dayTextSelected,
                ]}>
                  {cell.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
});

const calStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  monthArrow: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    maxHeight: 44,
  },
  dayCellSelected: {
    backgroundColor: Colors.headerDark,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  dayTextOther: {
    color: Colors.outline,
  },
  dayTextPast: {
    color: Colors.outline,
    opacity: 0.5,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },
});

// ─── Time Slot Chip ─────────────────────────────────────────
const TimeSlotChip = memo(({ slot, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.timeChip, isSelected && styles.timeChipSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
      {slot.startTime}-{slot.endTime}
    </Text>
  </TouchableOpacity>
));

// ─── People Count Chip ──────────────────────────────────────
const PeopleChip = memo(({ count, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.peopleChip, isSelected && styles.peopleChipSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.peopleChipText, isSelected && styles.peopleChipTextSelected]}>
      {String(count).padStart(2, '0')}
    </Text>
  </TouchableOpacity>
));

// ─── Main BookSlotScreen ────────────────────────────────────
const BookSlotScreen = ({ route, navigation }) => {
  const { turf } = route.params || {};
  const { user, token } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState(10);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [booking, setBooking] = useState(false);

  const peopleCounts = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const dateStr = selectedDate.toISOString().split('T')[0];

  // ── Fetch slots ──
  useEffect(() => {
    const fetchSlots = async () => {
      if (!turf?.id) return;
      try {
        setLoadingSlots(true);
        const res = await fetch(`${BACKEND_URL}/turfs/${turf.id}/slots?date=${dateStr}`);
        const data = await res.json();
        setAvailableSlots(data);
        setSelectedSlot(null);
      } catch (e) {
        console.log('Error fetching slots', e);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [turf?.id, dateStr]);

  // ── Fetch teams ──
  useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND_URL}/teams`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setTeams(Array.isArray(d) ? d : []))
      .catch(() => setTeams([]));
  }, [token]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Toast.show({ type: 'info', text1: 'Select a Time Slot', text2: 'Please choose a time slot to book.' });
      return;
    }

    try {
      setBooking(true);
      const bookingAmount = selectedSlot.price || (turf?.pricePerHour || 3500);

      // Create order
      const orderRes = await fetch(`${BACKEND_URL}/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bookingAmount })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize payment');

      // Payment options
      const options = {
        description: `Booking for ${turf.name}`,
        image: turf.imageUrl || 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: 'rzp_live_SRnIHqpELg4O62',
        amount: orderData.amount,
        name: 'Turf Score',
        order_id: orderData.id,
        prefill: { email: user?.email || '', contact: '', name: user?.name || '' },
        theme: { color: Colors.primary }
      };

      const nativeBridge = NativeModules.RazorpayCheckout;
      const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.expoVersion;
      const isNativeFunctional = nativeBridge && typeof nativeBridge.open === 'function';
      const shouldSimulate = isExpoGo || !isNativeFunctional;

      if (shouldSimulate) {
        if (__DEV__) {
          Alert.alert(
            'Simulation Mode',
            'Native Razorpay is unavailable in Expo Go. Simulate success?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Simulate Success',
                onPress: () => {
                  const mockData = {
                    razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
                    razorpay_order_id: orderData.id,
                    razorpay_signature: 'mock_signature'
                  };
                  handlePaymentSuccess(mockData, bookingAmount);
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Payment bridge missing. Please contact support.');
        }
        return;
      }

      const rzp = RazorpayCheckout || nativeBridge;
      rzp.open(options)
        .then((data) => handlePaymentSuccess(data, bookingAmount))
        .catch((error) => {
          if (error.code !== 2) Alert.alert(`Error: ${error.code}`, error.description);
        });

    } catch (error) {
      console.error(error);
      Alert.alert('Payment Error', error.message);
    } finally {
      setBooking(false);
    }
  };

  const handlePaymentSuccess = async (paymentData, amount) => {
    try {
      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          turfId: turf?.id,
          bookingDate: dateStr,
          timeSlot: selectedSlot.startTime,
          amount: amount,
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          paymentMethod: 'razorpay',
          teamId: selectedTeamId || undefined
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save booking');
      navigation.navigate('BookingSuccess', { booking: result });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Booking Error', text2: error.message });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Your Slot</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Calendar ── */}
        <View style={styles.section}>
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </View>

        {/* ── Time Slots ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Slot</Text>
          {loadingSlots ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginVertical: 24 }} />
          ) : availableSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {availableSlots.map(slot => (
                <TimeSlotChip
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlot?.id === slot.id}
                  onPress={() => setSelectedSlot(slot)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noSlotsBox}>
              <Clock size={24} color={Colors.onSurfaceVariant} />
              <Text style={styles.noSlotsText}>No slots available for this date</Text>
              <Text style={styles.noSlotsHint}>Try selecting a different date</Text>
            </View>
          )}
        </View>

        {/* ── Number of People ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No. of People</Text>
          <View style={styles.peopleGrid}>
            {peopleCounts.map(count => (
              <PeopleChip
                key={count}
                count={count}
                isSelected={selectedPeople === count}
                onPress={() => setSelectedPeople(count)}
              />
            ))}
          </View>
        </View>

        {/* ── Team Selector ── */}
        {teams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Book For Team</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.teamChip, !selectedTeamId && styles.teamChipSelected]}
                onPress={() => setSelectedTeamId('')}
              >
                <Text style={[styles.teamChipText, !selectedTeamId && styles.teamChipTextSelected]}>Individual</Text>
              </TouchableOpacity>
              {teams.map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={[styles.teamChip, selectedTeamId === team.id && styles.teamChipSelected]}
                  onPress={() => setSelectedTeamId(team.id)}
                >
                  <Text style={[styles.teamChipText, selectedTeamId === team.id && styles.teamChipTextSelected]}>
                    {team.name} ({team.members?.length || 0})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Booking Summary ── */}
        {selectedSlot && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Turf</Text>
              <Text style={styles.summaryValue}>{turf?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{selectedSlot.startTime} - {selectedSlot.endTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Players</Text>
              <Text style={styles.summaryValue}>{selectedPeople}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>₹{selectedSlot.price || turf?.pricePerHour || 3500}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!selectedSlot || booking) && styles.confirmBtnDisabled]}
          onPress={handleConfirmBooking}
          disabled={!selectedSlot || booking}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {booking ? 'Processing...' : 'Confirm Booking'}
          </Text>
          <View style={[styles.confirmBtnArrow, (!selectedSlot || booking) && { opacity: 0.5 }]}>
            <ChevronRight size={22} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: -0.3,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  // ── Sections ──
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // ── Time Slots ──
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    minWidth: (SCREEN_WIDTH - 40 - 30) / 4,
    alignItems: 'center',
  },
  timeChipSelected: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  timeChipTextSelected: {
    color: '#fff',
  },

  // ── No Slots ──
  noSlotsBox: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  noSlotsText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 10,
  },
  noSlotsHint: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },

  // ── People Grid ──
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  peopleChip: {
    width: (SCREEN_WIDTH - 40 - 40) / 5,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleChipSelected: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  peopleChipText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  peopleChipTextSelected: {
    color: '#fff',
  },

  // ── Team Chips ──
  teamChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    marginRight: 10,
  },
  teamChipSelected: {
    backgroundColor: Colors.headerDark,
    borderColor: Colors.headerDark,
  },
  teamChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  teamChipTextSelected: {
    color: '#fff',
  },

  // ── Summary Card ──
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.onBackground,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.outlineLight,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'android' ? 20 : 34,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.headerDark,
    paddingVertical: 6,
    paddingLeft: 28,
    paddingRight: 6,
    borderRadius: 30,
    gap: 12,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  confirmBtnArrow: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#8BC34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BookSlotScreen;
