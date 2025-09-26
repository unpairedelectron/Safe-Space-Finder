import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, Share, Alert } from 'react-native';
import { Searchbar, Button, Card, Title, Paragraph, FAB, Chip, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import SwipeableList, {
  createLikeAction,
  createBookmarkAction,
  createShareAction,
  SwipeableItemData,
} from '../components/SwipeableList';
import { ProgressiveImage, useOptimisticUpdate } from '../components/LoadingOptimizations';
import { notificationService } from '../services/NotificationService';
import { AnimatedButton } from '../components/AnimatedButton';

const mockBusinesses = [
  { 
    id: '1', 
    name: 'Rainbow Cafe', 
    description: 'LGBTQ+ friendly coffee shop with amazing pastries.',
    rating: 4.8,
    category: 'cafes',
    tags: ['LGBTQ+ Friendly', 'Pet Friendly'],
  },
  { 
    id: '2', 
    name: 'Inclusive Books', 
    description: 'Diverse literature and community events.',
    rating: 4.6,
    category: 'shops',
    tags: ['LGBTQ+ Friendly', 'Family Friendly'],
  },
  { 
    id: '3', 
    name: 'Accessible Eats', 
    description: 'Fully accessible restaurant with diverse menu.',
    rating: 4.7,
    category: 'restaurants',
    tags: ['Wheelchair Accessible', 'Family Friendly'],
  },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState(mockBusinesses);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '🏢' },
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

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.some(filter => business.tags.includes(filter));
    
    return matchesSearch && matchesCategory && matchesFilters;
  });

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleShare = async (business: any) => {
    try {
      await Share.share({
        message: `Check out this business: ${business.name} - ${business.description}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share the business. Please try again later.');
    }
  };

  const handleLike = (id: string) => {
    // Handle like action
    console.log('Liked business with id:', id);
  };

  const handleBookmark = (id: string) => {
    // Handle bookmark action
    console.log('Bookmarked business with id:', id);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        style={styles.header}
      >
        <Title style={styles.welcomeText}>Find Your Safe Space</Title>
        <Searchbar
          placeholder="Search businesses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map(category => (
          <AnimatedButton
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip,
            ]}
            hapticType="light"
          >
            <View style={styles.categoryContent}>
              <Title style={styles.categoryIcon}>{category.icon}</Title>
              <Paragraph style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}>
                {category.name}
              </Paragraph>
            </View>
          </AnimatedButton>
        ))}
      </ScrollView>

      <View style={styles.filtersContainer}>
        <Paragraph style={styles.filtersTitle}>Filters:</Paragraph>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <Chip
              key={filter}
              selected={selectedFilters.includes(filter)}
              onPress={() => toggleFilter(filter)}
              style={styles.filterChip}
              textStyle={styles.filterText}
            >
              {filter}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Divider style={styles.divider} />

      <SwipeableList
        data={filteredBusinesses.map(item => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          rating: item.rating,
          category: item.category,
          tags: item.tags,
        }))}
        renderItem={({ item }) => (
          <AnimatedButton
            onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
            style={styles.businessCard}
            hapticType="light"
          >
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardContent}>
                    <Title>{item.title}</Title>
                    <Paragraph>{item.subtitle}</Paragraph>
                    <View style={styles.ratingContainer}>
                      <Paragraph style={styles.rating}>⭐ {item.rating}</Paragraph>
                    </View>
                  </View>
                </View>
                <View style={styles.tagsContainer}>
                  {item.tags?.map((tag: string, index: number) => (
                    <Chip key={index} style={styles.tag} compact>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </AnimatedButton>
        )}
        rightActions={[
          createBookmarkAction(() => console.log('Bookmark')),
          createShareAction(() => console.log('Share')),
        ]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        emptyText="No businesses match your criteria."
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Businesses')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchbar: {
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    minWidth: 80,
  },
  selectedCategoryChip: {
    backgroundColor: '#4CAF50',
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterChip: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  businessCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  ratingContainer: {
    marginTop: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
