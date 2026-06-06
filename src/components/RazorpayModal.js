import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { X, ShieldCheck, CheckCircle, XCircle } from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';

const { height } = Dimensions.get('window');

const RAZORPAY_KEY_ID = Constants.expoConfig?.extra?.RAZORPAY_KEY_ID || 'rzp_test_Sx2Yhd3xvB6nWM';
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.18.23:5000/api';

const RazorpayModal = ({ visible, onClose, onPaymentSuccess, amount, bookingDetails }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);

      const orderRes = await fetch(`${API_URL}/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Turf Score',
        description: bookingDetails?.description || 'Turf Booking Payment',
        order_id: orderData.id,
        prefill: {
          email: bookingDetails?.email || '',
          contact: bookingDetails?.phone || '',
          name: bookingDetails?.name || '',
        },
        theme: { color: Colors.headerDark },
      };

      const paymentData = await RazorpayCheckout.open(options);

      onPaymentSuccess({
        razorpay_order_id: paymentData.razorpay_order_id || paymentData.razorpayOrderId,
        razorpay_payment_id: paymentData.razorpay_payment_id || paymentData.razorpayPaymentId,
        razorpay_signature: paymentData.razorpay_signature || paymentData.razorpaySignature,
      });

      onClose();
    } catch (error) {
      if (error.code === 2) {
        Alert.alert('Payment Cancelled', 'You cancelled the payment.');
      } else {
        Alert.alert('Payment Error', error.description || error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.checkoutContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pay with Razorpay</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.merchantSection}>
            <View style={styles.merchantLogo}>
              <Text style={styles.logoText}>TS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.merchantName}>Turf Score</Text>
              <Text style={styles.merchantDesc}>{bookingDetails?.description || 'Secure Payment'}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceValue}>₹{amount}</Text>
          </View>

          <View style={styles.content}>
            <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>Pay ₹{amount}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <ShieldCheck size={16} color="#4ECB71" />
                <Text style={styles.featureText}>Secured by Razorpay</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#4ECB71" />
                <Text style={styles.featureText}>UPI, Cards, NetBanking & Wallet</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Razorpay</Text>
          </View>
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
    height: height * 0.55,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  closeBtn: {
    padding: 8,
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbfbfb',
    gap: 14,
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  merchantDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#222',
    marginTop: 4,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  payButton: {
    backgroundColor: Colors.headerDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  featuresList: {
    marginTop: 20,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
  },
});

export default RazorpayModal;
