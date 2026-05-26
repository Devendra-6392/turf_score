import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const PremiumButton = ({ title, onPress, type = 'primary', style }) => {
  if (type === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
        <LinearGradient
          colors={Colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {typeof title === 'string' ? (
            <Text style={styles.primaryText}>{title}</Text>
          ) : (
            title
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.container, styles.secondary, style]}
    >
      {typeof title === 'string' ? (
        <Text style={styles.secondaryText}>{title}</Text>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System', // Will update to Plus Jakarta Sans later
  },
  secondaryText: {
    color: Colors.onBackground,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumButton;
