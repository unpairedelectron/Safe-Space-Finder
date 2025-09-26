import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export interface SwipeAction {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

export interface SwipeableItemData {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  [key: string]: any;
}

interface SwipeableListProps {
  data: SwipeableItemData[];
  renderItem: ({ item, index }: { item: SwipeableItemData; index: number }) => React.ReactElement;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onRefresh?: () => void;
  refreshing?: boolean;
  keyExtractor?: (item: SwipeableItemData) => string;
  emptyText?: string;
  estimatedItemSize?: number; // performance hint
}

const SwipeableList: React.FC<SwipeableListProps> = ({
  data,
  renderItem,
  leftActions = [],
  rightActions = [],
  onRefresh,
  refreshing = false,
  keyExtractor = (item) => item.id,
  emptyText = 'No items found',
  estimatedItemSize = 120,
}) => {
  const memoKeyExtractor = useCallback((item: SwipeableItemData) => keyExtractor(item), [keyExtractor]);
  const renderLeftActions = useCallback((data: SwipeableItemData, rowMap: any) => {
    if (leftActions.length === 0) return null;

    return (
      <View style={styles.leftActionContainer}>
        {leftActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              { backgroundColor: action.backgroundColor },
              index === 0 && styles.firstLeftAction,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              action.onPress();
              rowMap[keyExtractor(data)].closeRow();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={action.icon} size={24} color={action.color} />
            <Text style={[styles.actionText, { color: action.color }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [leftActions, keyExtractor]);

  const renderRightActions = useCallback((data: SwipeableItemData, rowMap: any) => {
    if (rightActions.length === 0) return null;

    return (
      <View style={styles.rightActionContainer}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              { backgroundColor: action.backgroundColor },
              index === rightActions.length - 1 && styles.lastRightAction,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              action.onPress();
              rowMap[keyExtractor(data)].closeRow();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={action.icon} size={24} color={action.color} />
            <Text style={[styles.actionText, { color: action.color }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [rightActions, keyExtractor]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="list-outline" size={64} color="#CBD5E0" />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  ), [emptyText]);

  return (
    <SwipeListView
      data={data}
      renderItem={({ item, index }) => (
        <View style={styles.itemContainer} accessibilityLabel={`List item ${index + 1} of ${data.length}`}>
          {renderItem({ item, index })}
        </View>
      )}
      renderHiddenItem={({ item }, rowMap) => (
        <View style={styles.hiddenItemContainer}>
          {renderLeftActions(item, rowMap)}
          {renderRightActions(item, rowMap)}
        </View>
      )}
      leftOpenValue={leftActions.length * 80}
      rightOpenValue={-rightActions.length * 80}
      keyExtractor={memoKeyExtractor}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={renderEmptyComponent}
      disableRightSwipe={leftActions.length === 0}
      disableLeftSwipe={rightActions.length === 0}
      swipeToOpenPercent={10}
      swipeToClosePercent={10}
      useNativeDriver={false}
      initialNumToRender={8}
      windowSize={10}
      removeClippedSubviews
    />
  );
};

// Pre-configured swipe actions for common use cases
export const createLikeAction = (onLike: () => void, isLiked: boolean = false): SwipeAction => ({
  text: isLiked ? 'Unlike' : 'Like',
  icon: isLiked ? 'heart' : 'heart-outline',
  color: '#FFFFFF',
  backgroundColor: '#E53E3E',
  onPress: onLike,
});

export const createBookmarkAction = (onBookmark: () => void, isBookmarked: boolean = false): SwipeAction => ({
  text: isBookmarked ? 'Remove' : 'Save',
  icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
  color: '#FFFFFF',
  backgroundColor: '#3182CE',
  onPress: onBookmark,
});

export const createShareAction = (onShare: () => void): SwipeAction => ({
  text: 'Share',
  icon: 'share-outline',
  color: '#FFFFFF',
  backgroundColor: '#38A169',
  onPress: onShare,
});

export const createDeleteAction = (onDelete: () => void, confirmDelete: boolean = true): SwipeAction => ({
  text: 'Delete',
  icon: 'trash-outline',
  color: '#FFFFFF',
  backgroundColor: '#E53E3E',
  onPress: () => {
    if (confirmDelete) {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ]
      );
    } else {
      onDelete();
    }
  },
});

export const createReportAction = (onReport: () => void): SwipeAction => ({
  text: 'Report',
  icon: 'flag-outline',
  color: '#FFFFFF',
  backgroundColor: '#FF8C00',
  onPress: () => {
    Alert.alert(
      'Report Content',
      'This will report the content to moderators for review.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: onReport },
      ]
    );
  },
});

export const createEditAction = (onEdit: () => void): SwipeAction => ({
  text: 'Edit',
  icon: 'pencil-outline',
  color: '#FFFFFF',
  backgroundColor: '#805AD5',
  onPress: onEdit,
});

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#FFFFFF',
  },
  hiddenItemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: '#F7FAFC',
  },
  leftActionContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  firstLeftAction: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastRightAction: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Inter-Medium',
  },
});

export default React.memo(SwipeableList);
