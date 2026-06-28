import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, Share, Platform,
  Dimensions, TouchableOpacity, Linking, ScrollView
} from 'react-native';
import { CheckCircle2, Calendar, Clock, MapPin, Share2, Trophy, Navigation, Zap } from 'lucide-react-native';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { wp, hp, scale, fontScale, moderateScale, SCREEN_WIDTH } from '../utils/responsive';

import { API_URL as BACKEND_URL } from '../config/api';

const BookingSuccessScreen = ({ route, navigation }) => {
  const { booking } = route.params || {};
  const confettiRef = useRef(null);
  const { token } = useAuth();
  const [creatingChallenge, setCreatingChallenge] = React.useState(false);

  useEffect(() => {
    const playCheer = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-stadium-crowd-cheer-and-applause-481.mp3' },
          { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) sound.unloadAsync();
        });
      } catch (error) {
        console.log('Audio Error:', error);
      }
    };
    playCheer();
  }, []);

  const handleShare = async () => {
    try {
      const date = new Date(booking?.bookingDate || new Date());
      const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const message = `Game On!\n\n${formattedDate} @ ${booking?.timeSlot}\nVenue: ${booking?.turf?.name || 'Turf'}\n\nYour pitch is locked in. Assemble the squad!`;
      await Share.share({ message, title: 'Match Ready!' });
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  const handleAutoCreateChallenge = async () => {
    if (creatingChallenge) return;
    setCreatingChallenge(true);
    try {
      const payload = {
        title: `Match at ${booking?.turf?.name || 'Turf'}`,
        sportType: booking?.slot?.sportType || 'FOOTBALL',
        type: booking?.teamId ? 'TEAM' : 'INDIVIDUAL',
        turfId: booking?.turfId,
        slotId: booking?.slotId,
        scheduledDate: booking?.bookingDate,
        scheduledTime: booking?.timeSlot,
      };
      const response = await fetch(`${BACKEND_URL}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Challenge Created!' });
        navigation.navigate('Main', { screen: 'Challenges' });
      } else {
        const errorData = await response.json();
        Toast.show({ type: 'error', text1: 'Error', text2: errorData.error || 'Failed to create challenge' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Network error occurred' });
    } finally {
      setCreatingChallenge(false);
    }
  };

  const openMaps = () => {
    const lat = booking?.turf?.latitude;
    const lng = booking?.turf?.longitude;
    const label = encodeURIComponent(booking?.turf?.name || 'Turf Location');
    let url = '';
    if (lat && lng) {
      url = Platform.select({ ios: `maps:${lat},${lng}?q=${label}`, android: `geo:${lat},${lng}?q=${lat},${lng}(${label})` });
    } else {
      const query = encodeURIComponent(booking?.turf?.location || booking?.turf?.name);
      url = Platform.select({ ios: `maps:0,0?q=${query}`, android: `geo:0,0?q=${query}` });
    }
    Linking.openURL(url).catch(() => console.log('Error opening maps'));
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background & Confetti */}
      <View style={s.bgAccent} />
      <ConfettiCannon
        count={200} origin={{ x: -10, y: 0 }} fadeOut={true} explosionSpeed={350} fallSpeed={3000}
        colors={[Colors.primary, '#FFD700', '#FF4D4D', '#4D94FF']} ref={confettiRef}
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Compact Header */}
        <View style={s.headerBox}>
          <View style={s.iconRing}>
            <CheckCircle2 size={42} color={Colors.primary} strokeWidth={2.5} />
            <View style={s.trophyMini}><Trophy size={12} color="#fff" /></View>
          </View>
          <Text style={s.headline}>Booking Confirmed!</Text>
          <Text style={s.subheadline}>Your pitch is locked. Time to assemble the squad.</Text>
        </View>

        {/* Premium Ticket Card */}
        <View style={s.ticket}>
          {/* Top Half: Turf */}
          <View style={s.ticketTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.turfName}>{booking?.turf?.name || 'Galaxy Turf'}</Text>
              <Text style={s.turfLoc} numberOfLines={2}>{booking?.turf?.location || 'Location details'}</Text>
            </View>
            <TouchableOpacity style={s.mapBtn} onPress={openMaps} activeOpacity={0.8}>
              <Navigation size={16} color="#fff" />
              <Text style={s.mapBtnText}>Map</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={s.ticketDivider}>
            <View style={[s.notch, s.notchLeft]} />
            <View style={s.dashedLine} />
            <View style={[s.notch, s.notchRight]} />
          </View>

          {/* Middle Half: Date/Time */}
          <View style={s.ticketMid}>
            <View style={s.infoCol}>
              <View style={s.infoLabelRow}>
                <Calendar size={14} color={Colors.primary} />
                <Text style={s.infoLabel}>DATE</Text>
              </View>
              <Text style={s.infoValue}>
                {new Date(booking?.bookingDate || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
              </Text>
            </View>
            <View style={s.verticalLine} />
            <View style={s.infoCol}>
              <View style={s.infoLabelRow}>
                <Clock size={14} color={Colors.primary} />
                <Text style={s.infoLabel}>TIME</Text>
              </View>
              <Text style={s.infoValue}>{booking?.timeSlot || '19:30'}</Text>
            </View>
          </View>

          {/* Bottom Half: Payment Meta */}
          <View style={s.ticketBottom}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Booking ID</Text>
              <Text style={s.metaValue}>{booking?.bookingNumber || booking?.id?.slice(0, 8).toUpperCase() || 'N/A'}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Paid Amount</Text>
              <Text style={s.metaValueHighlight}>₹{booking?.amount || '0'}</Text>
            </View>
            {booking?.paymentDetail?.razorpayPaymentId && (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Transaction</Text>
                <Text style={s.metaValue}>{booking.paymentDetail.razorpayPaymentId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Share Action */}
        <TouchableOpacity style={s.shareRow} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={18} color={Colors.onBackground} />
          <Text style={s.shareText}>Invite your squad</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Sticky Footer */}
      <View style={s.footer}>
        {!booking?.challengeId && (
          <TouchableOpacity onPress={handleAutoCreateChallenge} disabled={creatingChallenge} activeOpacity={0.85} style={s.primaryAction}>
            <LinearGradient colors={['#1A1A1A', '#000']} style={s.primaryActionGrad}>
              <Zap size={20} color={Colors.primary} />
              <Text style={s.primaryActionText}>{creatingChallenge ? "Creating..." : "Create Challenge & Save 50%"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={s.secondaryActions}>
          <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('QRScanner')} activeOpacity={0.7}>
            <Text style={s.outlineBtnText}>Scan Gate QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.grayBtn} onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
            <Text style={s.grayBtnText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 250, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 100 },

  headerBox: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  iconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  trophyMini: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FFD700', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: Colors.surface },
  headline: { fontSize: 24, fontWeight: '900', color: Colors.onBackground, marginBottom: 6 },
  subheadline: { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18 },

  // Ticket Card
  ticket: { backgroundColor: Colors.surface, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.outlineLight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  ticketTop: { padding: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: Colors.surface },
  turfName: { fontSize: 20, fontWeight: '800', color: Colors.onBackground, marginBottom: 4 },
  turfLoc: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
  mapBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Ticket Divider
  ticketDivider: { height: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, position: 'relative' },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: Colors.outlineLight, borderStyle: 'dashed', marginHorizontal: 15 },
  notch: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, position: 'absolute' },
  notchLeft: { left: -10 },
  notchRight: { right: -10 },

  // Ticket Mid
  ticketMid: { flexDirection: 'row', padding: 20, backgroundColor: Colors.surface },
  infoCol: { flex: 1, gap: 6 },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: 11, fontWeight: '800', color: Colors.onSurfaceVariant, letterSpacing: 1 },
  infoValue: { fontSize: 16, fontWeight: '800', color: Colors.onBackground },
  verticalLine: { width: 1, backgroundColor: Colors.outlineLight, marginHorizontal: 15 },

  // Ticket Bottom (Meta)
  ticketBottom: { padding: 16, backgroundColor: Colors.surfaceVariant + '30', borderTopWidth: 1, borderTopColor: Colors.outlineLight, gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },
  metaValue: { fontSize: 12, fontWeight: '700', color: Colors.onBackground },
  metaValueHighlight: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  // Share
  shareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  shareText: { fontSize: 14, fontWeight: '700', color: Colors.onBackground },

  // Footer Actions
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.outlineLight },
  primaryAction: { width: '100%', marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
  primaryActionGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  primaryActionText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  secondaryActions: { flexDirection: 'row', gap: 10 },
  outlineBtn: { flex: 1.5, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: Colors.primary },
  outlineBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  grayBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.surface },
  grayBtnText: { fontSize: 14, fontWeight: '700', color: Colors.onBackground },
});

export default BookingSuccessScreen;
