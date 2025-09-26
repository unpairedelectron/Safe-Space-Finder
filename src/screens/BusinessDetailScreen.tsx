import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, useColorScheme, AccessibilityInfo } from 'react-native';
import { LayoutAnimation } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { PhotoGallery } from '../components/PhotoGallery';
import { RatingDisplay } from '../components/StarRating';
import { AccessibilityTags } from '../components/AccessibilityTags';
import { SocialActions, UserProfileBadge, LikeButton } from '../components/SocialFeatures';
import { notificationService } from '../services/NotificationService';
import { fetchBusiness as apiFetchBusiness, fetchBusinessReviews, likeReview, toggleFavoriteBusiness, ReviewDTO } from '@/services/api/businessApi';
import OfflineManager from '@/services/OfflineManager';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSnackbar } from '@/components/SnackbarHost';
import { humanizeApiError } from '@/utils/apiError';
import { ds } from '@/theme/designSystem';

// API integration WIP: will replace mock data with real fetch using businessApi
export default function BusinessDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { businessId } = route.params;
  const offline = OfflineManager.getInstance();
  const snackbar = useAppSnackbar();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {}); }, []);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  // Business details query
  const { data: business, isLoading: businessLoading, isError: businessError } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => apiFetchBusiness(businessId),
    staleTime: 1000 * 60,
  });

  // Reviews infinite query
  const {
    data: reviewsPages,
    isLoading: reviewsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<{ items: ReviewDTO[]; nextPage?: number }>({
    queryKey: ['businessReviews', businessId],
    queryFn: ({ pageParam = 1 }) => fetchBusinessReviews(businessId, pageParam as number),
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });

  const reviews: ReviewDTO[] = reviewsPages?.pages.flatMap((p) => p.items) || [];

  // Like review mutation (optimistic)
  const likeMutation = useMutation({
    mutationFn: (review: ReviewDTO) => likeReview(review.id),
    onMutate: async (review) => {
      await queryClient.cancelQueries({ queryKey: ['businessReviews', businessId] });
      const prev = queryClient.getQueryData<any>(['businessReviews', businessId]);
      queryClient.setQueryData(['businessReviews', businessId], (data: any) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((pg: any) => ({
            ...pg,
            items: pg.items.map((r: ReviewDTO) => r.id === review.id ? { ...r, isLiked: !r.isLiked, likes: (r.likes || 0) + (r.isLiked ? -1 : 1) } : r)
          })),
        };
      });
      return { prev };
    },
    onError: (_err, _review, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['businessReviews', businessId], ctx.prev);
      snackbar.show('Failed to like review');
    },
    onSuccess: (resp, review) => {
      // Sync likes exactly with server response
      queryClient.setQueryData(['businessReviews', businessId], (data: any) => {
        if (!data) return data;
        return {
          ...data,
            pages: data.pages.map((pg: any) => ({
              ...pg,
              items: pg.items.map((r: ReviewDTO) => r.id === review.id ? { ...r, isLiked: resp.liked, likes: resp.likes } : r)
            })),
        };
      });
    },
  });

  const handleReviewLike = (reviewId: string) => {
    const target = reviews.find(r => r.id === reviewId);
    if (target) likeMutation.mutate(target);
  };

  const handleFavorite = async () => {
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      // Optimistic toggle to backend
      await toggleFavoriteBusiness(businessId);
    } catch (e) {
      setIsFavorited(!next); // revert
      snackbar.show('Failed to update favorite');
    }
    try {
      if (next && business) {
        await offline.addFavorite(businessId);
        await notificationService.scheduleReviewReminder(businessId, business.name);
        await notificationService.sendLocalNotification({
          title: 'Added to favorites!',
          body: `${business.name} has been added to your favorites.`,
          data: { businessId },
          priority: 'default',
        });
      } else if (!next) {
        await offline.removeFavorite(businessId);
      }
    } catch {}
  };

  const handleFollow = () => { setIsFollowed(f => !f); };

  useEffect(() => {
    if (businessError) snackbar.show('Failed to load business');
  }, [businessError, snackbar]);

  const loading = businessLoading || reviewsLoading;

  if (loading) {
    return (
      <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel="Loading business details">
        <ActivityIndicator animating size="large" />
        <Paragraph style={{ marginTop: ds.spacing(3) }}>Loading...</Paragraph>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center} accessibilityRole="alert">
        <Paragraph>Business not found.</Paragraph>
        <Button onPress={() => queryClient.invalidateQueries({ queryKey: ['business', businessId] })}>Retry</Button>
      </View>
    );
  }

  const renderReview = ({ item }: { item: ReviewDTO }) => (
    <Card style={styles.reviewCard} accessibilityLabel={`Review by ${item.userName}`}>
      <Card.Content>
        <UserProfileBadge userName={item.userName} isVerified={false} reviewCount={0} />
        <View style={styles.reviewHeader}>
          <RatingDisplay rating={item.rating} size={18} />
        </View>
        <Paragraph style={styles.reviewComment}>{item.comment}</Paragraph>
        <View style={styles.reviewActions}>
          <LikeButton isLiked={!!item.isLiked} likeCount={item.likes || 0} onPress={() => handleReviewLike(item.id)} size="small" />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container} accessibilityLabel={`Details for ${business.name}`}>
      {/* Header */}
      <Card style={styles.businessCard} accessibilityRole="summary">
        <Card.Content>
          <Title style={styles.businessName}>{business.name}</Title>
          <RatingDisplay rating={business.rating} size={20} showValue />
          {business.address && <Paragraph style={styles.address}>{business.address}</Paragraph>}
          {business.description && <Paragraph style={styles.description}>{business.description}</Paragraph>}
          <Divider style={styles.divider} />
          <AccessibilityTags selectedTags={[]} maxVisible={4} />
          <Divider style={styles.divider} />
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
        <Title style={styles.sectionTitle}>Reviews ({reviews.length})</Title>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          scrollEnabled={false}
          ListEmptyComponent={<Paragraph>No reviews yet.</Paragraph>}
          ListFooterComponent={
            hasNextPage ? (
              <Button
                mode="outlined"
                onPress={() => fetchNextPage()}
                loading={isFetchingNextPage}
                accessibilityLabel="Load more reviews"
                style={{ marginTop: 8 }}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load More'}
              </Button>
            ) : null
          }
        />
      </View>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Review', { businessId })}
        style={styles.addReviewButton}
        contentStyle={styles.buttonContent}
        accessibilityLabel="Add a review"
      >
        Add Review
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.palette.bgLight },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: ds.spacing(4) },
  businessCard: { margin: ds.spacing(4), elevation: 4, borderRadius: ds.radii.md },
  businessName: { fontSize: 24, fontWeight: 'bold', marginBottom: ds.spacing(2) },
  address: { color: '#666', marginVertical: ds.spacing(2) },
  description: { lineHeight: 22, marginVertical: ds.spacing(3) },
  divider: { marginVertical: ds.spacing(4) },
  businessInfo: { marginTop: ds.spacing(2) },
  infoLabel: { fontWeight: '600', marginTop: ds.spacing(2), color: '#333' },
  reviewsSection: { margin: ds.spacing(4) },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: ds.spacing(4) },
  reviewCard: { marginBottom: ds.spacing(3), elevation: 2, borderRadius: ds.radii.sm },
  reviewHeader: { marginVertical: ds.spacing(2) },
  reviewComment: { lineHeight: 20, marginVertical: ds.spacing(2) },
  reviewActions: { marginTop: ds.spacing(3), alignItems: 'flex-start' },
  addReviewButton: { margin: ds.spacing(4), elevation: 4 },
  buttonContent: { paddingVertical: ds.spacing(2) },
});
