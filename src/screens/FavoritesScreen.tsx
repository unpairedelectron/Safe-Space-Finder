import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, IconButton, Chip } from 'react-native-paper';
import { EmptyState } from '../components/EmptyState';
import { AnimatedButton } from '../components/AnimatedButton';

export default function FavoritesScreen({ navigation }: { navigation: any }) {
  const [favorites] = useState([
    {
      id: '1',
      name: 'Rainbow Cafe',
      description: 'LGBTQ+ friendly coffee shop',
      rating: 4.8,
      tags: ['LGBTQ+ Friendly', 'Wheelchair Accessible'],
    },
    {
      id: '2',
      name: 'Inclusive Books',
      description: 'Diverse literature for all',
      rating: 4.6,
      tags: ['Diverse Books', 'Safe Space'],
    },
  ]);

  const removeFavorite = (id: string) => {
    // TODO: Implement remove favorite functionality
    console.log('Remove favorite:', id);
  };

  const renderFavorite = ({ item }: any) => (
    <AnimatedButton
      onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })}
      style={styles.cardContainer}
      hapticType="light"
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Title>{item.name}</Title>
              <Paragraph>{item.description}</Paragraph>
              <Paragraph style={styles.rating}>⭐ {item.rating}</Paragraph>
            </View>
            <IconButton
              icon="heart"
              iconColor="#FF5722"
              onPress={() => removeFavorite(item.id)}
            />
          </View>
          <View style={styles.tagsContainer}>
            {item.tags.map((tag: string, index: number) => (
              <Chip key={index} style={styles.tag} compact>
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </AnimatedButton>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        ListEmptyComponent={
          <EmptyState
            title="No Favorites Yet"
            description="Start exploring and save your favorite safe spaces!"
            buttonText="Explore Businesses"
            onButtonPress={() => navigation.navigate('Businesses')}
            icon="💝"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={favorites.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
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
  rating: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
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
});
