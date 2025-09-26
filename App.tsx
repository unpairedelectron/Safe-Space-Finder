import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import BusinessDetailScreen from './src/screens/BusinessDetailScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import DemoScreen from './src/screens/DemoScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { notificationService } from './src/services/NotificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;

    async function prepare() {
      try {
        console.log('APP PREP START');
        safetyTimer = setTimeout(() => {
          console.log('Safety timer fired, setting app ready');
          setAppIsReady(true);
        }, 5000);

        try {
          console.log('NOTIF INIT START');
          await notificationService.initialize();
          console.log('NOTIF INIT END');
        } catch (e) {
          console.warn('Notification init failed (continuing):', e);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        if (!appIsReady) {
          setAppIsReady(true);
        }
        if (safetyTimer) clearTimeout(safetyTimer);
      }
    }

    prepare();

    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately!
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  const customLight = {
    colors: {
      primary: '#4CAF50',
      accent: '#FF9800',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#212121',
      placeholder: '#757575',
    },
    roundness: 8,
  };

  const customDark = {
    colors: {
      primary: '#81C784',
      accent: '#FFB74D',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      placeholder: '#BDBDBD',
    },
    roundness: 8,
  };

  const theme = colorScheme === 'dark' ? { ...MD3DarkTheme, ...customDark } : { ...DefaultTheme, ...customLight };

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer
          linking={{
            prefixes: ['safespace://'],
            config: {
              screens: {
                Onboarding: 'onboarding',
                Login: 'login',
                Register: 'register',
                Home: 'home',
                BusinessDetail: 'business/:businessId',
                Review: 'business/:businessId/review',
                Demo: 'demo',
              },
            },
          }}
        >
          <Stack.Navigator initialRouteName="Onboarding">
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                title: 'Welcome',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ 
                title: 'Create Account',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="Home" 
              component={TabNavigator} 
              options={{ 
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="BusinessDetail" 
              component={BusinessDetailScreen} 
              options={{ 
                title: 'Business Details',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="Review" 
              component={ReviewScreen} 
              options={{ 
                title: 'Add Review',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="Demo" 
              component={DemoScreen} 
              options={{ 
                title: 'Feature Demo',
                headerShown: false,
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
