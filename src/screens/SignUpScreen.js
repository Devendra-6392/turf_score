import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { User, Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import { scheduleLocalNotification } from '../utils/notifications';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      Toast.show({ type: 'success', text1: 'Welcome!', text2: 'Account created successfully' });
      scheduleLocalNotification('Welcome to Turf Score! 🎉', 'Your account has been created successfully.', 1);
      navigation.replace('Main');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Sign Up Failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Top half wave background pattern */}
      <View style={styles.topHeaderContainer}>
        <Image 
          source={require('../assets/green_topography.jpg')} 
          style={styles.headerPattern} 
          resizeMode="cover"
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Sign up</Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[
              styles.inputContainer,
              nameFocused && styles.inputContainerFocused
            ]}>
              <User size={16} color={nameFocused ? Colors.primary : Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="John Doe"
                placeholderTextColor={Colors.onSurfaceVariant + '60'}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                style={styles.input}
              />
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={[
              styles.inputContainer,
              emailFocused && styles.inputContainerFocused
            ]}>
              <Mail size={16} color={emailFocused ? Colors.primary : Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="demo@email.com"
                placeholderTextColor={Colors.onSurfaceVariant + '60'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={styles.input}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={[
              styles.inputContainer,
              passwordFocused && styles.inputContainerFocused
            ]}>
              <Lock size={16} color={passwordFocused ? Colors.primary : Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Create your password"
                placeholderTextColor={Colors.onSurfaceVariant + '60'}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? (
                  <EyeOff size={18} color={Colors.onSurfaceVariant} />
                ) : (
                  <Eye size={18} color={Colors.onSurfaceVariant} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.signUpBtn} 
              onPress={handleSignUp}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.signUpBtnText}>Create Account</Text>
                  <View style={styles.signUpBtnArrow}>
                    <ChevronRight size={18} color="#fff" />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeaderContainer: {
    width: '100%',
    height: height * 0.35,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.onBackground,
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.outline,
    marginBottom: 24,
    height: 48,
  },
  inputContainerFocused: {
    borderBottomColor: Colors.primary,
  },
  icon: {
    marginRight: 10,
    bottom: -2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.onBackground,
    fontWeight: '600',
    paddingVertical: 4,
  },
  eyeBtn: {
    padding: 4,
  },
  signUpBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
    marginTop: 10,
  },
  signUpBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  signUpBtnArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
  },
  loginText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  }
});

export default SignUpScreen;
