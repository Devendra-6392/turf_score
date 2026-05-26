import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const PremiumCard = ({ children, style, level = 'lowest' }) => {
  const getBackgroundColor = () => {
    switch (level) {
      case 'low': return Colors.surfaceContainerLow;
      case 'highest': return Colors.surfaceContainerHighest;
      default: return '#ffffff';
    }
  };

  return (
    <View style={[
      styles.card, 
      { backgroundColor: getBackgroundColor() }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 24,
    marginVertical: 12,
    // Tonal layering instead of heavy shadows
    borderWidth: 0,
  },
});

export default PremiumCard;
