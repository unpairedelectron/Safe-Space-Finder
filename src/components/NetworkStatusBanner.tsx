import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Animated, StyleSheet, Text } from 'react-native';

export const NetworkStatusBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [anim] = useState(new Animated.Value(0));

  useEffect(() => {
    const sub = NetInfo.addEventListener(state => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setVisible(offline);
      Animated.timing(anim, { toValue: offline ? 1 : 0, duration: 300, useNativeDriver: true }).start();
    });
    return () => sub();
  }, [anim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [-40,0] }) }] }] } accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.text}>You are offline. Some features may be unavailable.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left:0, right:0, backgroundColor: '#b71c1c', padding:8, zIndex: 100 },
  text: { color: 'white', textAlign: 'center', fontSize: 12, fontWeight: '600' },
});
