import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react-native';

const ToastBody = ({ icon: Icon, iconColor, bgColor, borderColor, text1, text2 }) => (
  <View style={[styles.container, { backgroundColor: bgColor, borderLeftColor: borderColor }]}>  
    <View style={[styles.iconWrap, { backgroundColor: borderColor + '18' }]}>
      <Icon size={20} color={iconColor} />
    </View>
    <View style={styles.textWrap}>
      {text1 ? <Text style={styles.title} numberOfLines={1}>{text1}</Text> : null}
      {text2 ? <Text style={styles.message} numberOfLines={2}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <ToastBody
      icon={CheckCircle}
      iconColor="#10B981"
      bgColor="#ffffff"
      borderColor="#10B981"
      text1={text1}
      text2={text2}
    />
  ),
  error: ({ text1, text2 }) => (
    <ToastBody
      icon={XCircle}
      iconColor="#EF4444"
      bgColor="#ffffff"
      borderColor="#EF4444"
      text1={text1}
      text2={text2}
    />
  ),
  info: ({ text1, text2 }) => (
    <ToastBody
      icon={Info}
      iconColor="#3B82F6"
      bgColor="#ffffff"
      borderColor="#3B82F6"
      text1={text1}
      text2={text2}
    />
  ),
  warning: ({ text1, text2 }) => (
    <ToastBody
      icon={AlertCircle}
      iconColor="#F59E0B"
      bgColor="#ffffff"
      borderColor="#F59E0B"
      text1={text1}
      text2={text2}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b1c1c',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
