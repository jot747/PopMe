import React, { useRef } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';

export type BubbleInputProps = {
  label?: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export const BubbleInput = ({ label = 'add task', onPress, onLayout }: BubbleInputProps) => {
  const { width } = useWindowDimensions();
  const bubbleSize = Math.min(width - 8, 520);
  const bubbleHeight = Math.round(bubbleSize * 0.38);
  const pressScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={label}
        onLayout={onLayout}>
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <LinearGradient
            colors={['#CFE6E8', '#B9B1D3']}
            style={[
              styles.bubble,
              {
                width: bubbleSize,
                height: bubbleHeight,
                borderTopLeftRadius: bubbleSize / 2,
                borderTopRightRadius: bubbleSize / 2,
              },
            ]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 1 }}>
            <Text style={styles.label}>{label}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    marginBottom: -45,
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D2733',
    shadowOpacity: 0.4,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#161A1F',
    textTransform: 'lowercase',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
});
