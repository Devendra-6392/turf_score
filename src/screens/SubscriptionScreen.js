import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import Toast from 'react-native-toast-message';

const SubscriptionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('INDIVIDUAL'); // INDIVIDUAL | TEAM
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState({ individual: [], team: [] });
  const [activeSubscription, setActiveSubscription] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/subscriptions/plans`);
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchMySubscription = async () => {
    try {
      // Pass token in headers if you have auth configured
      const res = await fetch(`${API_URL}/subscriptions/my`, {
        headers: { 'Content-Type': 'application/json' /* Add token here */ },
      });
      const data = await res.json();
      if (data.subscription) {
        setActiveSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching my subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId, type) => {
    // Navigate to a checkout flow or trigger Razorpay
    Alert.alert('Subscribe', `Initiating subscription for ${planId}`);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your active subscription? Any remaining value will be pro-rated and refunded to your wallet.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(`${API_URL}/subscriptions/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' /* Auth token should go here */ }
              });
              const data = await res.json();
              if (res.ok) {
                Toast.show({ type: 'success', text1: 'Subscription Cancelled', text2: data.message });
                setActiveSubscription(null);
                fetchMySubscription();
              } else {
                Toast.show({ type: 'error', text1: 'Error', text2: data.error });
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel subscription' });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A8FF00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skipers Memberships</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'INDIVIDUAL' && styles.activeTab]}
          onPress={() => setActiveTab('INDIVIDUAL')}
        >
          <Text style={[styles.tabText, activeTab === 'INDIVIDUAL' && styles.activeTabText]}>
            Memberships
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'TEAM' && styles.activeTab]}
          onPress={() => setActiveTab('TEAM')}
        >
          <Text style={[styles.tabText, activeTab === 'TEAM' && styles.activeTabText]}>
            Team Passes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'INDIVIDUAL' && plans.individual.map((plan) => (
          <View key={plan.planId} style={styles.card}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>₹{plan.price} / month</Text>
            
            <View style={styles.benefits}>
              {plan.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#00B51E" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {activeSubscription?.plan === plan.planId ? (
              <View style={styles.activeBadgeContainer}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Current Plan</Text>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>Cancel Plan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => handleSubscribe(plan.planId, 'individual')}
              >
                <Text style={styles.subscribeBtnText}>Subscribe</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {activeTab === 'TEAM' && plans.team.map((plan) => (
          <View key={plan.planId} style={styles.card}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>₹{plan.price} / month</Text>
            
            <View style={styles.benefits}>
              {plan.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#00B51E" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Note: Team active subscription logic needs to check team memberships */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={() => handleSubscribe(plan.planId, 'team')}
            >
              <Text style={styles.subscribeBtnText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#1A212D', borderRadius: 10, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#A8FF00' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#0D1117' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#1A212D', borderRadius: 15, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  planName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  planPrice: { color: '#A8FF00', fontSize: 18, marginBottom: 15 },
  benefits: { marginBottom: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  benefitText: { color: '#CCC', marginLeft: 10, fontSize: 14 },
  subscribeBtn: { backgroundColor: '#00B51E', padding: 15, borderRadius: 10, alignItems: 'center' },
  subscribeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  activeBadgeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBadge: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginRight: 10 },
  activeBadgeText: { color: '#A8FF00', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});

export default SubscriptionScreen;
