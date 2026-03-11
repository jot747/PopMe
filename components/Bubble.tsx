import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SubtaskOrbit } from '@/components/SubtaskOrbit';
import { Subtask } from '@/types/task';
import { playPopFeedback } from '@/utils/pop-feedback';

export type BubbleProps = {
  title: string;
  size: number;
  colors: string[];
  subtasks?: Subtask[];
  selected?: boolean;
  floating?: boolean;
  spawnOffset?: { x: number; y: number } | null;
  onPop?: () => void;
  onPress?: () => void;
  onDoublePress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Bubble = ({
  title,
  size,
  colors,
  subtasks = [],
  selected = false,
  floating = true,
  spawnOffset = null,
  onPop,
  onPress,
  onDoublePress,
  style,
}: BubbleProps) => {
  const appear = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const animatedSize = useRef(new Animated.Value(size)).current;
  const colorFade = useRef(new Animated.Value(1)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;
  const spawn = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [colorPair, setColorPair] = useState(() => ({ from: colors, to: colors }));
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef<number | null>(null);

  useEffect(() => {
    appear.setValue(0);
    Animated.spring(appear, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: false,
    }).start();
  }, [appear]);

  useEffect(() => {
    Animated.timing(animatedSize, {
      toValue: size,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animatedSize, size]);

  useEffect(() => {
    setColorPair((prev) => ({ from: prev.to, to: colors }));
    colorFade.setValue(0);
    Animated.timing(colorFade, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [colorFade, colors]);

  useEffect(() => {
    if (!spawnOffset) return;
    spawn.setValue(spawnOffset);
    Animated.timing(spawn, {
      toValue: { x: 0, y: 0 },
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [spawn, spawnOffset]);

  useEffect(() => {
    if (!floating) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500 + Math.random() * 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500 + Math.random() * 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [floatAnim, floating]);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const scale = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const animatedRadius = Animated.divide(animatedSize, 2);
  const translateY = Animated.add(floatTranslate, spawn.y);
  const translateX = spawn.x;
  const combinedScale = Animated.multiply(scale, popScale);
  const fromOpacity = colorFade.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const shadowStyle = useMemo(
    () => ({
      shadowColor: colorPair.to[0],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
      elevation: 8,
    }),
    [colorPair.to]
  );

  const handlePress = () => {
    if (!onPress && !onDoublePress) return;

    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 260) {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      lastTap.current = null;
      onDoublePress?.();
      return;
    }

    lastTap.current = now;
    tapTimeout.current = setTimeout(() => {
      onPress?.();
      lastTap.current = null;
    }, 260);
  };

  const handlePop = () => {
    if (!onPop) return;
    playPopFeedback();
    Animated.parallel([
      Animated.timing(popScale, {
        toValue: 0.2,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(popOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => {
      onPop?.();
      popScale.setValue(1);
      popOpacity.setValue(1);
    });
  };

  return (
    <Pressable onPress={handlePress} onLongPress={handlePop} delayLongPress={420} style={style}>
      <View style={styles.wrapper}>
        <SubtaskOrbit subtasks={subtasks} parentSize={size} colors={colors} />
        <Animated.View
          style={[
            styles.container,
            shadowStyle,
            {
              width: animatedSize,
              height: animatedSize,
              borderRadius: animatedRadius,
              transform: [{ translateX }, { translateY }, { scale: combinedScale }],
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
              opacity: popOpacity,
            },
          ]}>
          <Animated.View style={[styles.gradient, { opacity: fromOpacity }]}>
            <LinearGradient colors={colorPair.from} style={styles.gradient} />
          </Animated.View>
          <Animated.View style={[styles.gradient, { opacity: colorFade }]}>
            <LinearGradient colors={colorPair.to} style={styles.gradient} />
          </Animated.View>
          <View style={styles.gloss} />
          <Text numberOfLines={2} style={styles.label}>
            {title}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gloss: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '55%',
    height: '35%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    transform: [{ rotate: '-15deg' }],
  },
  label: {
    paddingHorizontal: 10,
    textAlign: 'center',
    color: '#1D2733',
    fontSize: 13,
    fontWeight: '600',
  },
});
