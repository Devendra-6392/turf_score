import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Colors } from '../constants/Colors';
import { X, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

const RazorpayModal = ({ visible, onClose, onPaymentSuccess, amount, keyId }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success

  const handlePay = () => {
    setLoading(true);
    // Simulate Razorpay network processing
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setStatus('idle');
      }, 2000);
    }, 3000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.checkoutContainer}>
          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/89/Razorpay_logo.svg/1200px-Razorpay_logo.svg.png' }} 
              style={styles.rzpLogo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.merchantSection}>
            <View style={styles.merchantLogo}>
              <Text style={styles.logoText}>TS</Text>
            </View>
            <View>
              <Text style={styles.merchantName}>Turf Score Premium</Text>
              <Text style={styles.merchantId}>ID: {keyId.slice(0, 10)}...</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>₹{amount}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>PAYMENT METHODS</Text>
            
            <TouchableOpacity style={styles.methodItem} onPress={handlePay}>
              <View style={[styles.methodIcon, { backgroundColor: '#528FF0' }]}>
                <CreditCard size={20} color="#fff" />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>Cards (Visa, MaterCard, Rupay)</Text>
                <Text style={styles.methodSub}>Pay via Debit/Credit card</Text>
              </View>
              <ChevronRight size={20} color={Colors.surfaceContainerHighest} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodItem} onPress={handlePay}>
              <View style={[styles.methodIcon, { backgroundColor: '#2AD38E' }]}>
                <Image source={{ uri: 'https://cdn.iconscout.com/icon/free/png-256/free-upi-2085056-1747946.png' }} style={{ width: 24, height: 24 }} />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>UPI (PhonePe, Google Pay)</Text>
                <Text style={styles.methodSub}>Instant payment using UPI</Text>
              </View>
              <ChevronRight size={20} color={Colors.surfaceContainerHighest} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.securityInfo}>
              <ShieldCheck size={16} color="#4ECB71" />
              <Text style={styles.securityText}>Trusted by 10M+ businesses</Text>
            </View>
            <Text style={styles.secureBadge}>SECURE CHECKOUT</Text>
          </View>

          {loading && (
            <BlurView intensity={80} style={StyleSheet.absoluteFill}>
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3392FF" />
                <Text style={styles.loadingText}>Processing Payment...</Text>
                <Text style={styles.loadingSub}>Please do not press back or close</Text>
              </View>
            </BlurView>
          )}

          {status === 'success' && (
            <View style={[StyleSheet.absoluteFill, styles.successOverlay]}>
              <View style={styles.successIcon}>
                <ShieldCheck size={64} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Payment Successful</Text>
              <Text style={styles.successSub}>Transaction ID: rzp_pay_PKs82...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.7,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rzpLogo: {
    width: 100,
    height: 30,
  },
  closeBtn: {
    padding: 8,
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbfbfb',
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  merchantId: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  methodSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#4ECB71',
    fontWeight: '600',
    marginLeft: 6,
  },
  secureBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#aaa',
    letterSpacing: 2,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#3392FF',
  },
  loadingSub: {
    marginTop: 8,
    color: '#666',
  },
  successOverlay: {
    backgroundColor: '#3392FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  successSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  }
});

export default RazorpayModal;
