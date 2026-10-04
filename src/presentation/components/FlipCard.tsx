/**
 * FlipCard Component
 * 3D flip animation using react-native-reanimated.
 * Shows front face initially, flips to back on tap.
 */
import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Radius, Shadows, Animation } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
const CARD_HEIGHT = 260;

interface FlipCardProps {
  isFlipped: boolean;
  onFlip: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
}

export function FlipCard({ isFlipped, onFlip, front, back }: FlipCardProps) {
  const flipProgress = useSharedValue(0);

  React.useEffect(() => {
    flipProgress.value = withTiming(isFlipped ? 1 : 0, {
      duration: Animation.flipDuration,
    });
  }, [isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [1, 1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(
        flipProgress.value,
        [0, 0.5, 1],
        [0, 0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Pressable
      onPress={onFlip}
      accessible
      accessibilityRole="button"
      accessibilityLabel={
        isFlipped
          ? 'Cartão virado, toque para voltar'
          : 'Toque para virar o cartão'
      }
    >
      <View style={styles.container}>
        <Animated.View
          style={[styles.cardFace, styles.frontFace, frontAnimatedStyle]}
        >
          {front}
        </Animated.View>
        <Animated.View
          style={[styles.cardFace, styles.backFace, backAnimatedStyle]}
        >
          {back}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backfaceVisibility: 'hidden',
    ...Shadows.lg,
  },
  frontFace: {
    backgroundColor: Colors.primary,
  },
  backFace: {
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
});