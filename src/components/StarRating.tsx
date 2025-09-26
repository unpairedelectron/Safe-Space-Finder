import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  showLabel?: boolean;
  color?: string;
  emptyColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  interactive = false,
  showLabel = false,
  color = '#FFD700',
  emptyColor = '#E0E0E0',
}) => {
  const [currentRating, setCurrentRating] = useState(rating);
  const scaleValues = Array.from({ length: 5 }, () => useSharedValue(1));

  const animateStars = (starIndex: number) => {
    // Animate the pressed star and all previous stars
    for (let i = 0; i <= starIndex; i++) {
      scaleValues[i].value = withSequence(
        withSpring(1.3, { duration: 200 }),
        withSpring(1, { duration: 200 })
      );
    }
  };

  const handleStarPress = (starIndex: number) => {
    if (!interactive) return;

    const newRating = starIndex + 1;
    setCurrentRating(newRating);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate stars
    animateStars(starIndex);
    
    // Callback
    onRatingChange?.(newRating);
  };

  const renderStar = (index: number) => {
    const isFilled = index < Math.floor(currentRating);
    const isHalfFilled = index === Math.floor(currentRating) && currentRating % 1 !== 0;
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleValues[index].value }],
      };
    });

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index)}
        disabled={!interactive}
        style={styles.starContainer}
      >
        <Animated.View style={animatedStyle}>
          {isHalfFilled ? (
            <View style={styles.halfStarContainer}>
              <View style={[styles.halfStar, styles.leftHalf]}>
                <Text style={[styles.star, { fontSize: size, color }]}>★</Text>
              </View>
              <View style={[styles.halfStar, styles.rightHalf]}>
                <Text style={[styles.star, { fontSize: size, color: emptyColor }]}>★</Text>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.star,
                {
                  fontSize: size,
                  color: isFilled ? color : emptyColor,
                },
              ]}
            >
              ★
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => renderStar(index))}
      </View>
      {showLabel && (
        <Text style={styles.ratingLabel}>
          {currentRating.toFixed(1)} out of 5
        </Text>
      )}
    </View>
  );
};

export const RatingDisplay: React.FC<{ rating: number; size?: number; showValue?: boolean }> = ({
  rating,
  size = 16,
  showValue = true,
}) => {
  return (
    <View style={styles.displayContainer}>
      <StarRating rating={rating} size={size} interactive={false} />
      {showValue && (
        <Text style={[styles.ratingValue, { fontSize: size }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
  star: {
    fontWeight: 'bold',
  },
  halfStarContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    overflow: 'hidden',
  },
  halfStar: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    overflow: 'hidden',
  },
  leftHalf: {
    left: 0,
  },
  rightHalf: {
    right: 0,
  },
  ratingLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#333',
  },
});
