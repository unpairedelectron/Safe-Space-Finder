import React, { useState } from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { IconButton, Menu, Divider, Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { AnimatedButton } from './AnimatedButton';

interface SocialActionsProps {
  businessId: string;
  businessName: string;
  isFavorited?: boolean;
  isFollowed?: boolean;
  onFavoritePress?: () => void;
  onFollowPress?: () => void;
  onReportPress?: () => void;
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  businessId,
  businessName,
  isFavorited = false,
  isFollowed = false,
  onFavoritePress,
  onFollowPress,
  onReportPress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${businessName} on Safe Space Finder - a verified inclusive business! safespace://business/${businessId}`,
        title: `${businessName} - Safe Space Finder`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time');
    }
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFavoritePress?.();
  };

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFollowPress?.();
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert(
      'Report Business',
      'Why are you reporting this business?',
      [
        { text: 'Inappropriate Content', onPress: () => onReportPress?.() },
        { text: 'Misleading Information', onPress: () => onReportPress?.() },
        { text: 'Not a Safe Space', onPress: () => onReportPress?.() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedButton
        onPress={handleFavorite}
        hapticType="medium"
        style={styles.actionButton}
      >
        <IconButton
          icon={isFavorited ? 'heart' : 'heart-outline'}
          iconColor={isFavorited ? '#E91E63' : '#666'}
          size={24}
        />
      </AnimatedButton>

      <AnimatedButton
        onPress={handleFollow}
        hapticType="light"
        style={styles.actionButton}
      >
        <IconButton
          icon={isFollowed ? 'bell' : 'bell-outline'}
          iconColor={isFollowed ? '#4CAF50' : '#666'}
          size={24}
        />
      </AnimatedButton>

      <AnimatedButton
        onPress={handleShare}
        hapticType="light"
        style={styles.actionButton}
      >
        <IconButton
          icon="share-variant"
          iconColor="#666"
          size={24}
        />
      </AnimatedButton>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            iconColor="#666"
            size={24}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item
          onPress={handleReport}
          title="Report Business"
          leadingIcon="flag-outline"
        />
        <Divider />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            Alert.alert('Feature Coming Soon', 'Business verification coming soon!');
          }}
          title="Request Verification"
          leadingIcon="check-circle-outline"
        />
      </Menu>
    </View>
  );
};

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onPress,
  size = 'medium',
}) => {
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const textSizes = {
    small: 12,
    medium: 14,
    large: 16,
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedButton
      onPress={handlePress}
      hapticType="light"
      style={styles.likeButton}
    >
      <View style={styles.likeContent}>
        <IconButton
          icon={isLiked ? 'thumb-up' : 'thumb-up-outline'}
          iconColor={isLiked ? '#4CAF50' : '#666'}
          size={iconSizes[size]}
          style={styles.likeIcon}
        />
        <Text style={[styles.likeText, { fontSize: textSizes[size] }]}>
          {likeCount}
        </Text>
      </View>
    </AnimatedButton>
  );
};

interface UserProfileBadgeProps {
  userName: string;
  userAvatar?: string;
  isVerified?: boolean;
  reviewCount?: number;
  onPress?: () => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  userName,
  userAvatar,
  isVerified = false,
  reviewCount = 0,
  onPress,
}) => {
  return (
    <AnimatedButton
      onPress={onPress || (() => {})}
      hapticType="light"
      style={styles.profileBadge}
    >
      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <IconButton icon="account-circle" size={32} iconColor="#4CAF50" />
          ) : (
            <IconButton icon="account-circle" size={32} iconColor="#666" />
          )}
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <IconButton icon="check-circle" size={16} iconColor="#4CAF50" />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.reviewCount}>
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </AnimatedButton>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginVertical: 8,
  },
  actionButton: {
    borderRadius: 20,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  likeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    margin: 0,
  },
  likeText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#333',
  },
  profileBadge: {
    backgroundColor: 'transparent',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  profileInfo: {
    marginLeft: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
});
