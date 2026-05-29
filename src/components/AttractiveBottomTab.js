import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trophy, Search, Users, User, Home, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TabItem = ({ route, index, isFocused, onPress }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        // 1. Move icon UP and OUT (0 to -40)
        Animated.timing(translateY, {
          toValue: -40,
          duration: 150,
          useNativeDriver: true,
        }),
        // 2. Instantly teleport to BOTTOM (40)
        Animated.timing(translateY, {
          toValue: 40,
          duration: 0,
          useNativeDriver: true,
        }),
        // 3. Spring back up to CENTER (0)
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Ensure inactive tabs are resting at 0
      translateY.setValue(0);
    }
  }, [isFocused]);

  const Icon = () => {
    const props = { size: 22, color: isFocused ? '#ffffff' : '#888888' };
    switch (route.name) {
      case 'Home': return <Home {...props} />;
      case 'Search': return <Search {...props} />;
      case 'Challenges': return <Target {...props} />;
      case 'Teams': return <Users {...props} />;
      case 'Profile': return <User {...props} />;
      default: return <Home {...props} />;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.8}>
      <View style={styles.iconContainerOuter}>
        {isFocused ? (
          <View style={styles.activeIconContainer}>
            <Animated.View style={{ transform: [{ translateY }] }}>
              <Icon />
            </Animated.View>
          </View>
        ) : (
          <View style={styles.inactiveIconContainer}>
            <Icon />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const AttractiveBottomTab = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.tabContent}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={index}
                route={route}
                index={index}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: width * 0.05,
    right: width * 0.05,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  blurContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
  },
  iconContainerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    overflow: 'hidden', // This ensures the icon disappears when moving up/down out of the circle
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  inactiveIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  }
});

export default AttractiveBottomTab;
