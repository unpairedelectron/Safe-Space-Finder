import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Headline, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { ValidatedTextInput } from '../components/ValidatedInput';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, values);
      // Store token and navigate
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Please check your credentials and try again.'
      );
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#81C784', '#A5D6A7']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Headline style={styles.headline}>Welcome Back</Headline>
          <Title style={styles.subtitle}>Safe Space Finder</Title>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ handleSubmit, isValid, dirty }) => (
              <>
                <Field
                  component={ValidatedTextInput}
                  name="email"
                  label="Email"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                />
                
                <Field
                  component={ValidatedTextInput}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  left={<TextInput.Icon icon="lock-outline" />}
                />

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={!isValid || !dirty || loading}
                  style={[
                    styles.button,
                    (!isValid || !dirty) && styles.disabledButton,
                  ]}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </>
            )}
          </Formik>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.link}
          >
            Don't have an account? Register
          </Button>
        </Card.Content>
      </Card>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
    color: '#666',
    fontWeight: '300',
  },
  button: {
    marginTop: 24,
    elevation: 4,
  },
  disabledButton: {
    elevation: 1,
    opacity: 0.7,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  link: {
    marginTop: 16,
  },
});
