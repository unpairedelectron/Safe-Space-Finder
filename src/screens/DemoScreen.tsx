import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeableList, {
  createLikeAction,
  createBookmarkAction,
  createShareAction,
  createDeleteAction,
  SwipeableItemData,
} from '../components/SwipeableList';
import { ProgressiveImage, useOptimisticUpdate } from '../components/LoadingOptimizations';
import { notificationService } from '../services/NotificationService';
import offlineManager from '../services/OfflineManager';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface DemoItem {
  id: string;
  title: string;
  subtitle: string;
  isLiked: boolean;
  isBookmarked: boolean;
  image?: string;
}

export default function DemoScreen({ navigation }: { navigation: any }) {
  const [isOnline, setIsOnline] = useState(true);
  
  // Mock data for demonstration
  const mockData: DemoItem[] = [
    {
      id: '1',
      title: 'Rainbow Cafe',
      subtitle: 'LGBTQ+ friendly coffee shop with amazing pastries',
      isLiked: false,
      isBookmarked: false,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    },
    {
      id: '2',
      title: 'Inclusive Books',
      subtitle: 'Diverse literature and community events',
      isLiked: true,
      isBookmarked: false,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    },
    {
      id: '3',
      title: 'Accessible Eats',
      subtitle: 'Fully accessible restaurant with diverse menu',
      isLiked: false,
      isBookmarked: true,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    },
  ];

  // Use optimistic updates for better UX
  const {
    data: items,
    isOptimistic,
    performOptimisticUpdate,
  } = useOptimisticUpdate<DemoItem[]>(mockData);

  useEffect(() => {
    // For demo purposes, start online
    setIsOnline(true);
  }, []);

  const handleLike = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Optimistic update
    const updatedItems = items.map(i =>
      i.id === itemId ? { ...i, isLiked: !i.isLiked } : i
    );

    try {
      await performOptimisticUpdate(updatedItems, async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Schedule notification for liked items
        if (!item.isLiked) {
          await notificationService.sendLocalNotification({
            title: 'Added to favorites!',
            body: `You liked ${item.title}`,
            data: { itemId, action: 'like' },
          });
        }
        
        return updatedItems;
      });
      
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleBookmark = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const updatedItems = items.map(i =>
      i.id === itemId ? { ...i, isBookmarked: !i.isBookmarked } : i
    );

    try {
      await performOptimisticUpdate(updatedItems, async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!item.isBookmarked) {
          // Schedule review reminder
          await notificationService.scheduleReviewReminder(itemId, item.title);
        }
        
        return updatedItems;
      });
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Alert.alert('Error', 'Failed to bookmark item');
    }
  };

  const handleShare = async (item: DemoItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Share', `Sharing ${item.title}...`);
    } catch (error) {
      Alert.alert('Error', 'Failed to share item');
    }
  };

  const handleDelete = async (itemId: string) => {
    const updatedItems = items.filter(i => i.id !== itemId);
    
    try {
      await performOptimisticUpdate(updatedItems, async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return updatedItems;
      });
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const testNotifications = async () => {
    await notificationService.sendLocalNotification({
      title: 'Test Notification',
      body: 'This is a test of the notification system!',
      data: { test: true },
      priority: 'high',
    });
  };

  const testOfflineSync = async () => {
    if (isOnline) {
      Alert.alert('Offline Test', 'Going offline to test sync...');
      // This would normally be handled by the network state
    } else {
      Alert.alert('Offline Mode', 'Currently offline. Changes will sync when online.');
    }
  };

  const renderItem = ({ item }: { item: SwipeableItemData; index: number }) => {
    const demoItem = item as DemoItem & SwipeableItemData;
    
    return (
      <Card style={[styles.card, isOptimistic && styles.optimisticCard]}>
        <View style={styles.cardContent}>
          <ProgressiveImage
            source={{ uri: demoItem.image || 'https://via.placeholder.com/100' }}
            style={styles.image}
            borderRadius={8}
          />
          <View style={styles.textContent}>
            <Title numberOfLines={1}>{demoItem.title}</Title>
            <Paragraph numberOfLines={2}>{demoItem.subtitle}</Paragraph>
            <View style={styles.statusRow}>
              {demoItem.isLiked && (
                <Ionicons name="heart" size={16} color="#E53E3E" />
              )}
              {demoItem.isBookmarked && (
                <Ionicons name="bookmark" size={16} color="#3182CE" />
              )}
              {isOptimistic && (
                <Text style={styles.optimisticText}>Updating...</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#81C784']} style={styles.header}>
        <Title style={styles.headerTitle}>Demo: Improvements 18-20</Title>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </LinearGradient>

      <SwipeableList
        data={items.map(item => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          isLiked: item.isLiked,
          isBookmarked: item.isBookmarked,
          image: item.image,
        }))}
        renderItem={renderItem}
        rightActions={[
          createBookmarkAction(() => console.log('Bookmark action'), false),
          createShareAction(() => console.log('Share action')),
          createDeleteAction(() => console.log('Delete action')),
        ]}
        emptyText="No items to display"
      />

      <View style={styles.demoButtons}>
        <Button
          mode="contained"
          onPress={testNotifications}
          style={styles.demoButton}
          icon="bell"
        >
          Test Notification
        </Button>
        <Button
          mode="outlined"
          onPress={testOfflineSync}
          style={styles.demoButton}
          icon="sync"
        >
          Test Offline
        </Button>
      </View>

      <FAB
        icon="arrow-left"
        style={styles.fab}
        onPress={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  optimisticCard: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  optimisticText: {
    fontSize: 12,
    color: '#805AD5',
    fontStyle: 'italic',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 12,
  },
  demoButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
