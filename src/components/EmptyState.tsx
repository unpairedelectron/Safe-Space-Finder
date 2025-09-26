import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
  icon = '🔍'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Title style={styles.icon}>{icon}</Title>
      </View>
      <Title style={styles.title}>{title}</Title>
      <Paragraph style={styles.description}>{description}</Paragraph>
      {buttonText && onButtonPress && (
        <Button
          mode="contained"
          onPress={onButtonPress}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {buttonText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    elevation: 4,
    borderRadius: 24,
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
