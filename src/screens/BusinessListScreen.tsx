import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { LayoutAnimation } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedButton } from '../components/AnimatedButton';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export default function BusinessListScreen({ navigation }: { navigation: any }) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = await axios.get(`${API_BASE}/businesses?page=${pageNum}&limit=10`);
      const newBusinesses = response.data;
      
      if (isRefresh || pageNum === 1) {
        setBusinesses(newBusinesses);
      } else {
        setBusinesses(prev => [...prev, ...newBusinesses]);
      }
      
      setHasMore(newBusinesses.length === 10);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (error) {
      Alert.alert('Error', 'Failed to load businesses');
    }
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchBusinesses(1, true);
  };

  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchBusinesses(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator animating={true} size="small" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonCard count={5} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={businesses}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <AnimatedButton
            onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
            style={styles.card}
            hapticType="light"
          >
            <Card
              accessibilityLabel={`Business card for ${item.name}`}
              accessibilityHint="Tap to view business details"
            >
              <Card.Content>
                <Title>{item.name}</Title>
                <Paragraph>{item.description}</Paragraph>
                <Paragraph>Rating: {item.rating || 'N/A'}</Paragraph>
              </Card.Content>
            </Card>
          </AnimatedButton>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Businesses Found"
            description="We couldn't find any safe spaces in this area. Be the first to add one!"
            buttonText="Add Business"
            onButtonPress={() => Alert.alert('Feature Coming Soon', 'Business registration will be available soon.')}
            icon="🏪"
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 10,
    elevation: 3,
    borderRadius: 12,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
