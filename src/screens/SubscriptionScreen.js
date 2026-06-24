import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { ArrowLeft, CheckCircle2, ChevronRight, Crown } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/Colors';

const PlanCard = memo(({ plan, isActive, type, onSubscribe, onCancel }) => {
  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      {isActive && (
        <View style={styles.activeBadgeTop}>
          <Crown size={14} color="#FFF" />
          <Text style={styles.activeBadgeTopText}>Current Plan</Text>
        </View>
      )}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planPrice}>
        ₹{plan.price} <Text style={styles.planPriceUnit}>/ month</Text>
      </Text>
      
      <View style={styles.benefits}>
        {plan.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <CheckCircle2 size={18} color={Colors.primary} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {isActive ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.subscribeBtn} 
          onPress={() => onSubscribe(plan.planId, type)} 
          activeOpacity={0.85}
        >
          <Text style={styles.subscribeBtnText}>Subscribe</Text>
          <View style={styles.subscribeBtnArrow}>
            <ChevronRight size={20} color={Colors.primaryDark} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

const SubscriptionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('INDIVIDUAL');
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
      const res = await fetch(`${API_URL}/subscriptions/my`, {
        headers: { 'Content-Type': 'application/json' },
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

  const handleSubscribe = useCallback((planId, type) => {
    Alert.alert('Subscribe', `Initiating subscription for ${planId}`);
  }, []);

  const handleCancel = useCallback(() => {
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
                headers: { 'Content-Type': 'application/json' }
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
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const currentPlans = activeTab === 'INDIVIDUAL' ? plans.individual : plans.team;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skipers Memberships</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'INDIVIDUAL' && styles.activeTab]}
            onPress={() => setActiveTab('INDIVIDUAL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'INDIVIDUAL' && styles.activeTabText]}>
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'TEAM' && styles.activeTab]}
            onPress={() => setActiveTab('TEAM')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'TEAM' && styles.activeTabText]}>
              Team Passes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionSubtitle}>
          {activeTab === 'INDIVIDUAL' 
            ? 'Unlock exclusive benefits and priority bookings for yourself.' 
            : 'Get the best value for your entire squad with team passes.'}
        </Text>

        {currentPlans.map((plan) => (
          <PlanCard
            key={plan.planId}
            plan={plan}
            isActive={activeSubscription?.plan === plan.planId}
            type={activeTab.toLowerCase()}
            onSubscribe={handleSubscribe}
            onCancel={handleCancel}
          />
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44, 
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerTitle: { 
    color: Colors.onBackground, 
    fontSize: 18, 
    fontWeight: '700',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabs: { 
    flexDirection: 'row', 
    backgroundColor: Colors.surfaceContainerHighest, 
    borderRadius: 14, 
    padding: 4,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12,
  },
  activeTab: { 
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { 
    color: Colors.onSurfaceVariant, 
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: { 
    color: Colors.primaryDark,
    fontWeight: '700', 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 20,
    lineHeight: 22,
  },
  card: { 
    backgroundColor: Colors.surface, 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: Colors.outlineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: Colors.primaryContainer,
    borderWidth: 2,
  },
  activeBadgeTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
    gap: 6,
  },
  activeBadgeTopText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: { 
    color: Colors.onBackground, 
    fontSize: 22, 
    fontWeight: '800', 
    marginBottom: 6,
    marginTop: 4,
  },
  planPrice: { 
    color: Colors.primaryDark, 
    fontSize: 28, 
    fontWeight: '900',
    marginBottom: 24, 
  },
  planPriceUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  benefits: { 
    marginBottom: 28,
    gap: 12,
  },
  benefitRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
  },
  benefitText: { 
    color: Colors.onSurface, 
    fontSize: 15,
    flex: 1, 
    fontWeight: '500',
  },
  subscribeBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.headerDark,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 30,
  },
  subscribeBtnText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 16,
  },
  subscribeBtnArrow: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelBtnText: { 
    color: Colors.error, 
    fontWeight: '700', 
    fontSize: 15, 
  },
});

export default SubscriptionScreen;
