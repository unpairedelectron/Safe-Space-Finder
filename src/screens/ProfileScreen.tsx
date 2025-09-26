import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, Card, Button, Avatar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        style={styles.header}
      >
        <Avatar.Icon size={80} icon="person" style={styles.avatar} />
        <Title style={styles.name}>John Doe</Title>
        <Paragraph style={styles.email}>john.doe@example.com</Paragraph>
      </LinearGradient>
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Account Settings</Title>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              Edit Profile
            </Button>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              Preferences
            </Button>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              Notifications
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Community</Title>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              My Reviews
            </Button>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              Businesses I Added
            </Button>
            <Button mode="text" onPress={() => {}} style={styles.menuItem}>
              Help & Support
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          style={styles.logoutButton}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  menuItem: {
    justifyContent: 'flex-start',
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
