import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  colors: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Safe Space Finder',
    description: 'Discover inclusive businesses and safe spaces in your community where everyone belongs.',
    icon: '🏳️‍🌈',
    colors: ['#4CAF50', '#81C784'],
  },
  {
    id: 2,
    title: 'Community Driven',
    description: 'Real reviews from real people help you find places that truly embrace diversity and inclusion.',
    icon: '🤝',
    colors: ['#2196F3', '#64B5F6'],
  },
  {
    id: 3,
    title: 'Your Safe Haven',
    description: 'Whether you\'re looking for LGBTQ+ friendly spaces, accessible venues, or culturally inclusive environments.',
    icon: '🛡️',
    colors: ['#FF9800', '#FFB74D'],
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = withSpring(-(currentIndex + 1) * width);
    } else {
      navigation.replace('Login');
    }
  };

  const skipOnboarding = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.slidesContainer, animatedStyle]}>
        {slides.map((slide, index) => (
          <LinearGradient
            key={slide.id}
            colors={slide.colors as [string, string]}
            style={[styles.slide, { width }]}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Title style={styles.icon}>{slide.icon}</Title>
              </View>
              <Title style={styles.title}>{slide.title}</Title>
              <Paragraph style={styles.description}>{slide.description}</Paragraph>
            </View>
          </LinearGradient>
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            mode="text"
            onPress={skipOnboarding}
            textColor="rgba(255, 255, 255, 0.7)"
          >
            Skip
          </Button>
          <Button
            mode="contained"
            onPress={nextSlide}
            style={styles.nextButton}
            buttonColor="rgba(255, 255, 255, 0.2)"
            textColor="white"
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    elevation: 0,
  },
});
