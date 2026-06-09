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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please enter email and password' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Login successful' });
      navigation.replace('Main');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.message });
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
          source={require('../assets/green_topography.png')} 
          style={styles.headerPattern} 
          resizeMode="cover"
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign in</Text>

          <View style={styles.form}>
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
                placeholder="Enter your password"
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

            {/* Checkbox & Forgot Password */}
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.rememberRow} 
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxActive
                ]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginBtn} 
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Login</Text>
                  <View style={styles.loginBtnArrow}>
                    <ChevronRight size={18} color="#fff" />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an Account ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    height: height * 0.40,
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  forgotBtn: {},
  forgotText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  loginBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  loginBtnArrow: {
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
  signUpText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  }
});

export default LoginScreen;
