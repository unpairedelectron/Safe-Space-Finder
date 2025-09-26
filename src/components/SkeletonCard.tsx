import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  const cards = Array.from({ length: count }, (_, index) => (
    <View key={index} style={styles.card}>
      <ShimmerPlaceholder style={styles.title} />
      <ShimmerPlaceholder style={styles.subtitle} />
      <ShimmerPlaceholder style={styles.description} />
      <View style={styles.buttonRow}>
        <ShimmerPlaceholder style={styles.button} />
        <ShimmerPlaceholder style={styles.rating} />
      </View>
    </View>
  ));

  return <View>{cards}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    height: 24,
    marginBottom: 8,
    borderRadius: 4,
  },
  subtitle: {
    height: 16,
    width: '60%',
    marginBottom: 12,
    borderRadius: 4,
  },
  description: {
    height: 14,
    marginBottom: 8,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  button: {
    height: 36,
    width: 100,
    borderRadius: 18,
  },
  rating: {
    height: 20,
    width: 80,
    borderRadius: 4,
  },
});
