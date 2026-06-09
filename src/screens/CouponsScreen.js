import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Ticket, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';

export default function CouponsScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/coupons/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        throw new Error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load coupons' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code) => {
    await Clipboard.setStringAsync(code);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: `${code} copied to clipboard.`
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.couponCard}>
      <View style={styles.couponLeft}>
        <Text style={styles.discountText}>
          {item.discountType === 'PERCENTAGE' ? `${item.value}% OFF` : `₹${item.value} OFF`}
        </Text>
        <Text style={styles.couponDesc}>
          Valid until {new Date(item.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.couponMin}>
          Min Booking: ₹{item.minBookingAmt}
        </Text>
      </View>
      <View style={styles.couponRight}>
        <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(item.code)}>
          <Text style={styles.codeText}>{item.code}</Text>
          <Copy size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ticket size={64} color={Colors.onSurfaceVariant} />
              <Text style={styles.emptyTitle}>No Active Coupons</Text>
              <Text style={styles.emptySub}>Check back later for exciting offers!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 20,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  couponLeft: {
    flex: 2,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  discountText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  couponDesc: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  couponMin: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    opacity: 0.8,
  },
  couponRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 123, 104, 0.1)', // Primary with opacity
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  }
});
