import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { AnimatedButton } from '../components/AnimatedButton';
import { EmptyState } from '../components/EmptyState';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '@/services/api/httpClient';

interface PagedBusiness { id: string; name: string; description?: string; rating?: number; }
interface PagedResponse { items: PagedBusiness[]; nextPage?: number; }

async function fetchBusinessesPage({ pageParam = 1 }): Promise<PagedResponse> {
  const data = await httpClient.get<PagedResponse>(`/businesses?page=${pageParam}&limit=10`);
  return data;
}

export default function BusinessListScreen({ navigation }: { navigation: any }) {
  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } = useInfiniteQuery({
    queryKey: ['businesses', 'infinite'],
    queryFn: fetchBusinessesPage,
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
  });

  const businesses = data?.pages.flatMap(p => p.items) || [];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedButton
              onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
              style={styles.card}
              hapticType="light"
            >
              <Card accessibilityLabel={`Business card for ${item.name}`} accessibilityHint="Tap to view business details">
                <Card.Content>
                  <Title>{item.name}</Title>
                  {item.description && <Paragraph>{item.description}</Paragraph>}
                  <Paragraph>Rating: {item.rating ?? 'N/A'}</Paragraph>
                </Card.Content>
              </Card>
            </AnimatedButton>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Businesses Found"
              description="We couldn't find any safe spaces in this area. Be the first to add one!"
              buttonText="Refresh"
              onButtonPress={() => refetch()}
              icon="🏪"
            />
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={['#4CAF50']} tintColor="#4CAF50" />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 10, elevation: 3, borderRadius: 12 },
});
