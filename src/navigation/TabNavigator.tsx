import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import BusinessListScreen from '../screens/BusinessListScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import DemoScreen from '../screens/DemoScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Businesses') {
            iconName = 'business';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Favorites') {
            iconName = 'favorite';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Demo') {
            iconName = 'science';
          } else {
            iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Discover',
          headerTitle: 'Safe Space Finder',
        }}
      />
      <Tab.Screen 
        name="Businesses" 
        component={BusinessListScreen}
        options={{
          title: 'Explore',
          headerTitle: 'All Businesses',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: 'Map',
          headerTitle: 'Find Nearby',
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          title: 'Saved',
          headerTitle: 'My Favorites',
        }}
      />
      <Tab.Screen 
        name="Demo" 
        component={DemoScreen}
        options={{
          title: 'Demo',
          headerTitle: 'New Features',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
}
