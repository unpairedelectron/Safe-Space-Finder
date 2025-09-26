import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { ds } from '@/theme/designSystem';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface SkeletonCardProps {
  count?: number;
  variant?: 'list' | 'detail' | 'compact';
  intensity?: 'subtle' | 'default' | 'bold';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1, variant = 'list', intensity = 'default' }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {}); }, []);

  const intensityColors = useMemo(() => {
    switch (intensity) {
      case 'subtle':
        return ['#f2f2f2', '#e6e6e6', '#f2f2f2'];
      case 'bold':
        return ['#eeeeee', '#dddddd', '#eeeeee'];
      case 'default':
      default:
        return undefined; // library default gradient
    }
  }, [intensity]);

  const shimmerExtra = intensityColors ? { shimmerColors: intensityColors } : {};
  const shimmerProps = reduceMotion ? { visible: false } : { shimmerStyle: {}, ...shimmerExtra };

  const makeCard = (index: number) => {
    switch (variant) {
      case 'detail':
        return (
          <View key={index} style={[styles.card, styles.detailCard]} accessibilityLabel="Loading detailed content" accessibilityRole="progressbar">
            <ShimmerPlaceholder {...shimmerProps} style={styles.hero} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.title} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.subtitle} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.description} />
            <View style={styles.row}> <ShimmerPlaceholder {...shimmerProps} style={styles.buttonWide} /> </View>
          </View>
        );
      case 'compact':
        return (
          <View key={index} style={[styles.card, styles.compactCard]} accessibilityLabel="Loading compact content" accessibilityRole="progressbar">
            <ShimmerPlaceholder {...shimmerProps} style={styles.smallLine} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.smallLineHalf} />
          </View>
        );
      case 'list':
      default:
        return (
          <View key={index} style={styles.card} accessibilityLabel="Loading content" accessibilityRole="progressbar">
            <ShimmerPlaceholder {...shimmerProps} style={styles.title} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.subtitle} />
            <ShimmerPlaceholder {...shimmerProps} style={styles.description} />
            <View style={styles.buttonRow}>
              <ShimmerPlaceholder {...shimmerProps} style={styles.button} />
              <ShimmerPlaceholder {...shimmerProps} style={styles.rating} />
            </View>
          </View>
        );
    }
  };

  return <View>{Array.from({ length: count }).map((_, i) => makeCard(i))}</View>;
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  detailCard: { padding: 0, overflow: 'hidden' },
  compactCard: { paddingVertical: 12, paddingHorizontal: 16 },
  hero: { height: 160, width: '100%' },
  title: { height: 24, marginBottom: 8, borderRadius: 4 },
  subtitle: { height: 16, width: '60%', marginBottom: 12, borderRadius: 4 },
  description: { height: 14, marginBottom: 8, borderRadius: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  row: { flexDirection: 'row', marginTop: 12 },
  button: { height: 36, width: 100, borderRadius: 18 },
  buttonWide: { height: 44, flex: 1, marginHorizontal: 16, borderRadius: ds.radii.md },
  rating: { height: 20, width: 80, borderRadius: 4 },
  smallLine: { height: 16, borderRadius: 4, marginBottom: 6 },
  smallLineHalf: { height: 16, width: '40%', borderRadius: 4 },
});
