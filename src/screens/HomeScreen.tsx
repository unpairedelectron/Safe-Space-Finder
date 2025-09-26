import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Share, Alert, useColorScheme, AccessibilityInfo } from 'react-native';
import { Searchbar, Button, Card, Title, Paragraph, FAB, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeletonCard } from '../components/SkeletonCard';
import SwipeableList, { createLikeAction, createBookmarkAction, createShareAction } from '../components/SwipeableList';
import { AnimatedButton } from '../components/AnimatedButton';
import { useQuery } from '@tanstack/react-query';
import { fetchBusinesses } from '../services/api/businessApi';
import { ds, createGradient } from '@/theme/designSystem';

interface Business {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  category?: string;
  tags?: string[];
}

// Fallback mock (used only if API empty) – keep minimal for UX
const mockFallback: Business[] = [
  { id: 'mock1', name: 'Rainbow Cafe', description: 'Inclusive coffee & pastries', rating: 4.8, category: 'cafes', tags: ['LGBTQ+ Friendly'] },
  { id: 'mock2', name: 'Accessible Eats', description: 'Accessible dining experience', rating: 4.7, category: 'restaurants', tags: ['Wheelchair Accessible'] },
];

const categories = [
  { id: 'all', name: 'All', icon: '🌐' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️' },
  { id: 'cafes', name: 'Cafes', icon: '☕' },
  { id: 'shops', name: 'Shops', icon: '🛍️' },
  { id: 'services', name: 'Services', icon: '🔧' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
];

const filters = [
  'LGBTQ+ Friendly',
  'Wheelchair Accessible',
  'Pet Friendly',
  'Family Friendly',
  'Women-Owned',
  'Minority-Owned',
];

const BusinessCard = React.memo(function BusinessCard({ item, onPress }: { item: { title: string; subtitle?: string; rating?: number; tags?: string[] }; onPress(): void }) {
  return (
    <AnimatedButton onPress={onPress} style={styles.businessCard} hapticType="light" accessibilityLabel={`Open details for ${item.title}`} accessibilityHint="Navigates to business detail screen">
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Title maxFontSizeMultiplier={1.4}>{item.title}</Title>
              {item.subtitle && <Paragraph numberOfLines={2}>{item.subtitle}</Paragraph>}
              <View style={styles.ratingContainer}>
                {item.rating ? <Paragraph style={styles.rating}>⭐ {item.rating.toFixed(1)}</Paragraph> : <Paragraph accessibilityLabel="No rating yet">No rating</Paragraph>}
              </View>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            {item.tags?.slice(0, 3).map((tag, i) => (
              <Chip key={i} style={styles.tag} accessibilityLabel={`Tag ${tag}`} compact>{tag}</Chip>
            ))}
            {item.tags && item.tags.length > 3 && (
              <Chip style={styles.tag} accessibilityLabel={`Plus ${item.tags.length - 3} more tags`} compact>+{item.tags.length - 3}</Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </AnimatedButton>
  );
});

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const gradient = useMemo(() => createGradient(colorScheme === 'dark'), [colorScheme]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  const { data: apiBusinesses, isLoading: apiLoading, error: apiError, refetch, isFetching } = useQuery<Business[]>({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    staleTime: 60_000,
  });

  const businesses: Business[] = apiBusinesses && apiBusinesses.length > 0 ? apiBusinesses : mockFallback;

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  };

  const handleCategoryPress = (id: string) => setSelectedCategory(id);

  const filteredBusinesses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return businesses.filter(b => {
      const matchesSearch = !query || b.name.toLowerCase().includes(query) || (b.description?.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesFilters = selectedFilters.length === 0 || (b.tags && selectedFilters.every(f => b.tags?.includes(f)));
      return matchesSearch && matchesCategory && matchesFilters;
    });
  }, [businesses, searchQuery, selectedCategory, selectedFilters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.resolve(refetch()).finally(() => setTimeout(() => setRefreshing(false), 400));
  }, [refetch]);

  const handleShare = async (business: Business) => {
    try { await Share.share({ message: `Check out ${business.name}! ${business.description || ''}`.trim() }); } catch { Alert.alert('Error', 'Unable to share right now.'); }
  };
  const handleLike = (id: string) => { /* placeholder for future server call */ };
  const handleBookmark = (id: string) => { /* placeholder for future server call */ };

  const listData = filteredBusinesses.map(b => ({ id: b.id, title: b.name, subtitle: b.description, rating: b.rating, category: b.category, tags: b.tags }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradient} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Title style={styles.welcomeText} accessibilityRole="header">Find Your Safe Space</Title>
        <Searchbar
          placeholder="Search businesses..."
          accessibilityLabel="Search businesses"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
        {isFetching && <ActivityIndicator animating size="small" style={{ marginTop: 8 }} />}
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer} contentContainerStyle={{ paddingRight: 16 }} accessibilityLabel="Business categories" accessibilityHint="Swipe horizontally to explore categories">
        {categories.map(category => (
          <AnimatedButton
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={[styles.categoryChip, selectedCategory === category.id && styles.selectedCategoryChip]}
            hapticType="light"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category.id }}
            accessibilityLabel={`${category.name} category`}
          >
            <View style={styles.categoryContent}>
              <Title style={styles.categoryIcon}>{category.icon}</Title>
              <Paragraph style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}>{category.name}</Paragraph>
            </View>
          </AnimatedButton>
        ))}
      </ScrollView>

      <View style={styles.filtersContainer} accessibilityLabel="Filter options">
        <Paragraph style={styles.filtersTitle}>Filters:</Paragraph>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <Chip key={filter} selected={selectedFilters.includes(filter)} onPress={() => toggleFilter(filter)} style={styles.filterChip} textStyle={styles.filterText} accessibilityRole="checkbox" accessibilityState={{ checked: selectedFilters.includes(filter) }} accessibilityLabel={`Filter ${filter}`}>{filter}</Chip>
          ))}
        </ScrollView>
      </View>

      <Divider style={styles.divider} />

      {apiError && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }} accessibilityRole="alert">
          <Paragraph style={{ color: '#D32F2F' }}>Failed to load latest data. Showing cached / fallback.</Paragraph>
          <Button mode="text" onPress={() => refetch()} compact>Retry</Button>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Paragraph accessibilityLabel={`Found ${listData.length} results`}>{listData.length} result{listData.length === 1 ? '' : 's'}</Paragraph>
      </View>

      {/* Loading skeleton state */}
      {apiLoading && !apiBusinesses ? (
        <View style={{ paddingHorizontal: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </View>
      ) : (
        <SwipeableList
          data={listData}
          renderItem={({ item }) => (
            <BusinessCard
              item={item as any}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
            />
          )}
          leftActions={[createLikeAction(() => handleLike('temp'))]}
          rightActions={[createBookmarkAction(() => handleBookmark('temp')), createShareAction(() => handleShare({ id: 'temp', name: 'Business' } as any))]}
          refreshing={refreshing || apiLoading}
          onRefresh={onRefresh}
          emptyText="No businesses match your criteria"
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('Businesses')} accessibilityLabel="Open full business list" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.palette.bgLight },
  header: { padding: ds.spacing(5), paddingTop: ds.spacing(11), borderBottomLeftRadius: ds.radii.lg, borderBottomRightRadius: ds.radii.lg },
  welcomeText: { color: 'white', fontSize: ds.typography.scale.h2, fontWeight: 'bold', marginBottom: ds.spacing(4), textAlign: 'center' },
  searchbar: { elevation: 4, backgroundColor: 'rgba(255,255,255,0.95)' },
  searchInput: { fontSize: 16 },
  categoriesContainer: { padding: ds.spacing(4), paddingBottom: ds.spacing(2) },
  categoryChip: { marginRight: ds.spacing(3), backgroundColor: 'white', borderRadius: ds.radii.lg, padding: ds.spacing(3), elevation: 2, minWidth: 90 },
  selectedCategoryChip: { backgroundColor: ds.palette.primary },
  categoryContent: { alignItems: 'center' },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#555' },
  selectedCategoryText: { color: 'white' },
  filtersContainer: { paddingHorizontal: ds.spacing(4), paddingBottom: ds.spacing(2) },
  filtersTitle: { fontSize: 16, fontWeight: '600', marginBottom: ds.spacing(2), color: '#333' },
  filterChip: { marginRight: ds.spacing(2) },
  filterText: { fontSize: 12 },
  divider: { marginVertical: ds.spacing(2) },
  businessCard: { marginHorizontal: ds.spacing(4), marginVertical: ds.spacing(1.5) },
  card: { elevation: 3, borderRadius: ds.radii.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardContent: { flex: 1 },
  ratingContainer: { marginTop: ds.spacing(1) },
  rating: { fontSize: 16, fontWeight: '600', color: ds.palette.accent },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: ds.spacing(3) },
  tag: { marginRight: ds.spacing(2), marginBottom: ds.spacing(1) },
  fab: { position: 'absolute', margin: ds.spacing(4), right: 0, bottom: 0, backgroundColor: ds.palette.primary },
});
