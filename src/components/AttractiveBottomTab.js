import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trophy, Users, User, Home, Target, Scan, Menu, Megaphone } from 'lucide-react-native';

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
      case 'LFP': return <Megaphone {...props} />;
      case 'Scanner': return <Scan {...props} />;
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
  const [isExpanded, setIsExpanded] = useState(true);
  const timeoutRef = useRef(null);
  const marginAnim = useRef(new Animated.Value(width * 0.05)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsExpanded(true);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 4000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [state.index]); // reset timer on tab change

  useEffect(() => {
    if (isExpanded) {
      Animated.parallel([
        Animated.spring(marginAnim, {
          toValue: width * 0.05,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(marginAnim, {
          toValue: (width - 70) / 2,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [isExpanded]);

  return (
    <Animated.View style={[styles.container, { left: marginAnim, right: marginAnim }]}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <TouchableWithoutFeedback onPress={resetTimer}>
          <View style={{ flex: 1 }}>

            <Animated.View style={[styles.tabContent, { opacity: opacityAnim }]} pointerEvents={isExpanded ? 'auto' : 'none'}>
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                  resetTimer();
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
            </Animated.View>

            <Animated.View
              style={[
                styles.collapsedIcon,
                { opacity: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }
              ]}
              pointerEvents={isExpanded ? 'none' : 'auto'}
            >
              <Menu color="#000" size={28} />
            </Animated.View>

          </View>
        </TouchableWithoutFeedback>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    // left and right are animated
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
    overflow: 'hidden',
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
  },
  collapsedIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default AttractiveBottomTab;
