import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

const PremiumButton = ({ title, onPress, type = 'primary', style, loading = false, disabled = false, icon: Icon }) => {
  if (type === 'primary') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        style={[styles.container, style, disabled && styles.disabled]}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        <View style={styles.primaryGrad}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              {typeof title === 'string' ? (
                <Text style={styles.primaryText}>{title}</Text>
              ) : (
                title
              )}
              <View style={styles.primaryArrow}>
                {Icon ? <Icon size={18} color="#fff" /> : <ChevronRight size={18} color="#fff" />}
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.container, styles.secondary, style, disabled && styles.disabled]}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : typeof title === 'string' ? (
        <Text style={styles.secondaryText}>{title}</Text>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    backgroundColor: '#1A1A1A',
    minHeight: 54,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.outlineLight,
    minHeight: 54,
  },
  secondaryText: {
    color: Colors.onBackground,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PremiumButton;
