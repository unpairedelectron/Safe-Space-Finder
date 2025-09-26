import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { AnimatedButton } from '../components/AnimatedButton';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }: { navigation: any }) {
  const [location, setLocation] = useState<any>(null);
  const [businesses, setBusinesses] = useState([
    {
      id: '1',
      name: 'Rainbow Cafe',
      description: 'LGBTQ+ friendly coffee shop',
      rating: 4.8,
      coordinate: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      tags: ['LGBTQ+ Friendly', 'Pet Friendly'],
    },
    {
      id: '2',
      name: 'Inclusive Books',
      description: 'Diverse literature store',
      rating: 4.6,
      coordinate: {
        latitude: 37.78925,
        longitude: -122.4314,
      },
      tags: ['LGBTQ+ Friendly', 'Family Friendly'],
    },
    {
      id: '3',
      name: 'Accessible Eats',
      description: 'Fully accessible restaurant',
      rating: 4.7,
      coordinate: {
        latitude: 37.78725,
        longitude: -122.4334,
      },
      tags: ['Wheelchair Accessible', 'Family Friendly'],
    },
  ]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to show nearby businesses');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const getMarkerColor = (tags: string[]) => {
    if (tags.includes('LGBTQ+ Friendly')) return '#FF6B6B';
    if (tags.includes('Wheelchair Accessible')) return '#4ECDC4';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={mapStyle}
      >
        {businesses.map((business) => (
          <Marker
            key={business.id}
            coordinate={business.coordinate}
            pinColor={getMarkerColor(business.tags)}
          >
            <Callout
              style={styles.callout}
              onPress={() => navigation.navigate('BusinessDetail', { businessId: business.id })}
            >
              <View style={styles.calloutContent}>
                <Title style={styles.calloutTitle}>{business.name}</Title>
                <Paragraph style={styles.calloutDescription}>{business.description}</Paragraph>
                <View style={styles.calloutRating}>
                  <Paragraph style={styles.rating}>⭐ {business.rating}</Paragraph>
                </View>
                <View style={styles.calloutTags}>
                  {business.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.miniTag}>
                      <Paragraph style={styles.miniTagText}>{tag}</Paragraph>
                    </View>
                  ))}
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <Card style={styles.legend}>
        <Card.Content>
          <Title style={styles.legendTitle}>Legend</Title>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Paragraph>LGBTQ+ Friendly</Paragraph>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
            <Paragraph>Wheelchair Accessible</Paragraph>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Paragraph>Other Safe Spaces</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <FAB
        icon="format-list-bulleted"
        style={styles.fab}
        onPress={() => navigation.navigate('Businesses')}
      />
    </View>
  );
}

const mapStyle = [
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  callout: {
    width: 200,
    padding: 0,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    marginBottom: 8,
    color: '#666',
  },
  calloutRating: {
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  calloutTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  miniTagText: {
    fontSize: 10,
    color: '#2E7D32',
  },
  legend: {
    position: 'absolute',
    top: 60,
    right: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
