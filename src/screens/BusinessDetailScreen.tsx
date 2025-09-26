import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { LayoutAnimation } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Chip, Appbar, Divider } from 'react-native-paper';
import { PhotoGallery } from '../components/PhotoGallery';
import { StarRating, RatingDisplay } from '../components/StarRating';
import { AccessibilityTags } from '../components/AccessibilityTags';
import { SocialActions, UserProfileBadge, LikeButton } from '../components/SocialFeatures';
import { notificationService } from '../services/NotificationService';
import { ProgressiveImage } from '../components/LoadingOptimizations';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export default function BusinessDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  // Mock data for demonstration
  const mockBusiness = {
    id: businessId,
    name: 'Rainbow Cafe',
    description: 'A welcoming LGBTQ+ friendly coffee shop with amazing pastries and a cozy atmosphere. We pride ourselves on being a safe space for everyone.',
    address: '123 Inclusive Street, Diversity City, DC 12345',
    rating: 4.8,
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8',
    ],
    tags: ['lgbtq', 'wheelchair', 'pet-friendly', 'women-owned'],
    hours: '7:00 AM - 9:00 PM',
    phone: '(555) 123-4567',
  };

  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Amazing place! The staff is so welcoming and the coffee is fantastic. Truly feels like a safe space.',
      userName: 'Alex Smith',
      isVerified: true,
      reviewCount: 23,
      likes: 12,
      isLiked: false,
      photos: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93'],
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great atmosphere and very inclusive. The only downside is it can get quite busy during peak hours.',
      userName: 'Jordan Lee',
      isVerified: false,
      reviewCount: 7,
      likes: 8,
      isLiked: true,
      photos: [],
    },
  ];

  useEffect(() => {
    fetchBusiness();
    fetchReviews();
  }, []);

  const fetchBusiness = async () => {
    try {
      // Use mock data for now
      setBusiness(mockBusiness);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (error) {
      Alert.alert('Error', 'Failed to load business');
    }
  };

  const fetchReviews = async () => {
    try {
      // Use mock data for now
      setReviews(mockReviews);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (error) {
      // Reviews might not exist yet
    }
    setLoading(false);
  };

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited && business) {
      // Schedule a review reminder notification for 24 hours later
      await notificationService.scheduleReviewReminder(businessId, business.name);
      
      // Show immediate confirmation
      await notificationService.sendLocalNotification({
        title: `Added to favorites!`,
        body: `${business.name} has been added to your favorites.`,
        data: { businessId },
        priority: 'default',
      });
    }
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
  };

  const handleReviewLike = (reviewId: string) => {
    setReviews(prev => 
      prev.map((review: any) => 
        review.id === reviewId 
          ? { 
              ...review, 
              isLiked: !review.isLiked,
              likes: review.isLiked ? review.likes - 1 : review.likes + 1 
            }
          : review
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Paragraph>Business not found.</Paragraph>
      </View>
    );
  }

  const renderReview = ({ item }: any) => (
    <Card style={styles.reviewCard}>
      <Card.Content>
        <UserProfileBadge
          userName={item.userName}
          isVerified={item.isVerified}
          reviewCount={item.reviewCount}
        />
        <View style={styles.reviewHeader}>
          <RatingDisplay rating={item.rating} size={18} />
        </View>
        <Paragraph style={styles.reviewComment}>{item.comment}</Paragraph>
        {item.photos.length > 0 && (
          <PhotoGallery photos={item.photos} />
        )}
        <View style={styles.reviewActions}>
          <LikeButton
            isLiked={item.isLiked}
            likeCount={item.likes}
            onPress={() => handleReviewLike(item.id)}
            size="small"
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={business.name} />
      </Appbar.Header>

      {business.photos && business.photos.length > 0 && (
        <PhotoGallery photos={business.photos} />
      )}

      <Card style={styles.businessCard}>
        <Card.Content>
          <Title style={styles.businessName}>{business.name}</Title>
          <RatingDisplay rating={business.rating} size={20} showValue={true} />
          <Paragraph style={styles.address}>{business.address}</Paragraph>
          <Paragraph style={styles.description}>{business.description}</Paragraph>
          
          <Divider style={styles.divider} />
          
          <AccessibilityTags
            selectedTags={business.tags}
            maxVisible={4}
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.businessInfo}>
            <Paragraph style={styles.infoLabel}>Hours:</Paragraph>
            <Paragraph>{business.hours}</Paragraph>
            <Paragraph style={styles.infoLabel}>Phone:</Paragraph>
            <Paragraph>{business.phone}</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <SocialActions
        businessId={business.id}
        businessName={business.name}
        isFavorited={isFavorited}
        isFollowed={isFollowed}
        onFavoritePress={handleFavorite}
        onFollowPress={handleFollow}
      />

      <View style={styles.reviewsSection}>
        <Title style={styles.sectionTitle}>Reviews ({mockReviews.length})</Title>
        <FlatList
          data={reviews}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderReview}
          scrollEnabled={false}
          ListEmptyComponent={<Paragraph>No reviews yet.</Paragraph>}
        />
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Review', { businessId })}
        style={styles.addReviewButton}
        contentStyle={styles.buttonContent}
      >
        Add Review
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    color: '#666',
    marginVertical: 8,
  },
  description: {
    lineHeight: 22,
    marginVertical: 12,
  },
  divider: {
    marginVertical: 16,
  },
  businessInfo: {
    marginTop: 8,
  },
  infoLabel: {
    fontWeight: '600',
    marginTop: 8,
    color: '#333',
  },
  reviewsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  reviewHeader: {
    marginVertical: 8,
  },
  reviewComment: {
    lineHeight: 20,
    marginVertical: 8,
  },
  reviewActions: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  addReviewButton: {
    margin: 16,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
