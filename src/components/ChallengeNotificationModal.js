import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Trophy, X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChallengeNotificationModal = ({ visible, challenge, creatorName, onClose, onViewChallenge }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Trigger animations
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, scaleAnim, opacityAnim, slideAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            opacity: scaleAnim,
          },
        ]}
      >
        <View style={styles.modal}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <X size={24} color={Colors.onSurface} />
          </TouchableOpacity>

          {/* Header with Gradient */}
          <LinearGradient
            colors={[Colors.primary, '#6B8E23']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.iconContainer}>
              <CheckCircle size={60} color="#fff" strokeWidth={1.5} />
            </View>
            <Text style={styles.mainTitle}>Challenge Accepted! 🎉</Text>
            <Text style={styles.subtitle}>Get ready for an epic match</Text>
          </LinearGradient>

          {/* Challenge Details */}
          <View style={styles.content}>
            {/* Challenge Title */}
            <View style={styles.detailsSection}>
              <Trophy size={18} color={Colors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Challenge</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {challenge?.title || 'Untitled Challenge'}
                </Text>
              </View>
            </View>

            {/* Creator Name */}
            <View style={styles.detailsSection}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>
                  {challenge?.creator?.name?.charAt(0) || 'P'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Challenged by</Text>
                <Text style={styles.detailValue}>{creatorName}</Text>
              </View>
            </View>

            {/* Sport Type */}
            {challenge?.sportType && (
              <View style={styles.detailsSection}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportEmoji}>⚽</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Sport</Text>
                  <Text style={styles.detailValue}>{challenge.sportType}</Text>
                </View>
              </View>
            )}

            {/* Description if available */}
            {challenge?.description && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Challenge Message</Text>
                <Text style={styles.descriptionText}>{challenge.description}</Text>
              </View>
            )}

            {/* What's Next */}
            <View style={styles.nextStepsBox}>
              <Text style={styles.nextStepsTitle}>What's Next?</Text>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>You'll be notified when payment is due</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Complete the payment to confirm the booking</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Show up on the match day and have fun!</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onViewChallenge}
              activeOpacity={0.8}
            >
              <Trophy size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>View Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    transform: [{ scale: 1 }],
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  detailsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  sportBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(75, 122, 47, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sportEmoji: {
    fontSize: 22,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  descriptionBox: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurface,
    lineHeight: 20,
  },
  nextStepsBox: {
    backgroundColor: 'rgba(75, 122, 47, 0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});

export default ChallengeNotificationModal;
