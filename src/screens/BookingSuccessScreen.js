import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Share,
  Platform,
  Dimensions,
  TouchableOpacity,
  Linking
} from 'react-native';
import { CheckCircle2, Calendar, Clock, MapPin, Share2, Trophy, Navigation } from 'lucide-react-native';
import { Audio } from 'expo-av';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import PremiumCard from '../components/PremiumCard';

const { width } = Dimensions.get('window');

const BookingSuccessScreen = ({ route, navigation }) => {
  const { booking } = route.params || {};
  const confettiRef = useRef(null);

  useEffect(() => {
    const playCheer = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-stadium-crowd-cheer-and-applause-481.mp3' },
          { shouldPlay: true }
        );
        // Automatically unload from memory when done
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
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
      const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      const message = `Game On! 🏏\n\n${formattedDate} @ ${booking?.timeSlot}\n📍 ${booking?.turf?.name || 'Galaxy Turf'}\n\nYour pitch is locked in. Assemble the squad! ⚽🏆`;

      const result = await Share.share({
        message,
        title: 'Match Ready!',
      });
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Confetti Animation Layer */}
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={3000}
        colors={[Colors.primary, '#FFD700', '#FF4D4D', '#4D94FF']}
        ref={confettiRef}
      />

      <View style={styles.content}>
        {/* Success Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.trophyBadge}>
            <Trophy size={20} color="#fff" />
          </View>
          <CheckCircle2 size={80} color={Colors.primary} strokeWidth={2} />
        </View>

        <Text style={styles.headline}>Match Ready!</Text>
        <Text style={styles.subheadline}>
          Your pitch is locked in. Time to warm up, assemble the squad, and take the turf.
        </Text>

        {/* Booking Details Card */}
        <PremiumCard style={styles.detailsCard} level="low">
          <View style={styles.header}>
            <View style={styles.arenaIcon}>
              <MapPin size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.arenaName}>{booking?.turf?.name || 'Galaxy Turf'}</Text>
              <Text style={styles.pitchInfo} numberOfLines={2}>{booking?.turf?.location || 'Location loading...'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.directionBtn}
              onPress={() => {
                const lat = booking?.turf?.latitude;
                const lng = booking?.turf?.longitude;
                const label = encodeURIComponent(booking?.turf?.name || 'Turf Location');
                let url = '';
                if (lat && lng) {
                  url = Platform.select({
                    ios: `maps:${lat},${lng}?q=${label}`,
                    android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`
                  });
                } else {
                  const query = encodeURIComponent(booking?.turf?.location || booking?.turf?.name);
                  url = Platform.select({
                    ios: `maps:0,0?q=${query}`,
                    android: `geo:0,0?q=${query}`
                  });
                }
                Linking.openURL(url).catch(() => console.log('Error opening maps'));
              }}
            >
              <Navigation size={18} color={Colors.primary} />
              <Text style={styles.directionText}>Directions</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Calendar size={18} color={Colors.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(booking?.bookingDate || new Date()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    weekday: 'short'
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.infoBlock}>
              <Clock size={18} color={Colors.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Kick-off</Text>
                <Text style={styles.infoValue}>{booking?.timeSlot || '19:30'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.extraInfoContainer}>
            <View style={styles.extraInfoRow}>
               <Text style={styles.extraInfoLabel}>Booking ID</Text>
               <Text style={styles.extraInfoValue}>{booking?.bookingNumber || booking?.id?.slice(0, 8).toUpperCase() || 'N/A'}</Text>
            </View>
            <View style={styles.extraInfoRow}>
               <Text style={styles.extraInfoLabel}>Amount Paid</Text>
               <Text style={styles.extraInfoValue}>₹{booking?.amount || '0'}</Text>
            </View>
            <View style={styles.extraInfoRow}>
               <Text style={styles.extraInfoLabel}>Payment Method</Text>
               <Text style={styles.extraInfoValue}>{booking?.paymentDetail?.paymentMethod?.toUpperCase() || 'ONLINE'}</Text>
            </View>
            {booking?.paymentDetail?.razorpayPaymentId && (
              <View style={styles.extraInfoRow}>
                 <Text style={styles.extraInfoLabel}>Transaction ID</Text>
                 <Text style={styles.extraInfoValue}>{booking.paymentDetail.razorpayPaymentId}</Text>
              </View>
            )}
          </View>
        </PremiumCard>

        {/* Digital Pass Section */}
        <View style={styles.passSection}>
          <Text style={styles.passLabel}>SHARE WITH THE SQUAD</Text>
          <TouchableOpacity
            style={styles.passIdContainer}
            onPress={handleShare}
          >
            <Text style={styles.passId}>Invite Team</Text>
            <Share2 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {!booking?.challengeId && (
            <PremiumButton
              title="Create Challenge to Save 50%"
              onPress={() => navigation.navigate('CreateChallenge', { 
                prefillTurfId: booking?.turfId,
                prefillSlotId: booking?.slotId,
                prefillDate: booking?.bookingDate,
                prefillTime: booking?.timeSlot
              })}
              style={styles.challengeAction}
            />
          )}
          <PremiumButton
            title="Scan Gate QR to Enter"
            onPress={() => navigation.navigate('QRScanner')}
            style={styles.scanAction}
          />
          <PremiumButton
            title="Go to Dashboard"
            onPress={() => navigation.navigate('Main')}
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: Colors.primary + '10',
    padding: 20,
    borderRadius: 60,
    position: 'relative'
  },
  trophyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.background,
    elevation: 5,
  },
  headline: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
    fontWeight: '500',
  },
  detailsCard: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    marginBottom: 32,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arenaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  arenaName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  pitchInfo: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '600',
  },
  directionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  directionText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: 20,
    opacity: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 2,
  },
  extraInfoContainer: {
    marginTop: 20,
    backgroundColor: Colors.surfaceVariant + '30', // Very light background
    padding: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
  },
  extraInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraInfoLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  extraInfoValue: {
    fontSize: 13,
    color: Colors.onBackground,
    fontWeight: '800',
  },
  passSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  passLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  passIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  passId: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 12,
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  scanAction: {
    width: '100%',
    marginBottom: 12,
  },
  challengeAction: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: Colors.primary, // Could change if we want it to stand out
  }
});

export default BookingSuccessScreen;

