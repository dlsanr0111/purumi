import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  onRatingChange,
}) => {
  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(starRating)}
        disabled={!interactive}
        style={styles.star}
        accessibilityRole={interactive ? 'button' : 'none'}
        accessibilityLabel={`${starRating}점 ${isFilled ? '선택됨' : '선택 안됨'}`}
      >
        <Text style={[styles.starIcon, styles[size]]}>
          {isFilled ? '⭐' : isHalfFilled ? '⭐' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      {rating > 0 && (
        <Text style={[styles.ratingText, styles[`${size}Text`]]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: Layout.spacing.xs,
  },
  starIcon: {
    color: Colors.warning,
  },
  small: {
    fontSize: Layout.fontSize.sm,
  },
  medium: {
    fontSize: Layout.fontSize.md,
  },
  large: {
    fontSize: Layout.fontSize.lg,
  },
  ratingText: {
    marginLeft: Layout.spacing.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  smallText: {
    fontSize: Layout.fontSize.xs,
  },
  mediumText: {
    fontSize: Layout.fontSize.sm,
  },
  largeText: {
    fontSize: Layout.fontSize.md,
  },
});


