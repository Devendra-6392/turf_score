import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { height } = Dimensions.get('window');

const AnimatedScreenWrapper = ({ children, focused }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (focused) {
      // Amazing slide up and scale animation using stable Animated API
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        })
      ]).start();
    } else {
      // Reset off-screen immediately
      translateY.setValue(height);
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [focused]);

  return (
    <Animated.View style={[
      styles.container, 
      {
        opacity: opacity,
        transform: [
          { translateY: translateY },
          { scale: scale }
        ]
      }
    ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedScreenWrapper;
