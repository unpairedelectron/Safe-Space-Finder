import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import { ValidatedTextInput, PasswordStrength } from '../components/ValidatedInput';
import { useAuth } from '@/state/auth/AuthContext';

const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      // Auth context switches navigation to Home
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>
          
          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={registrationSchema}
            onSubmit={handleRegister}
          >
            {({ handleSubmit, values, isValid }) => (
              <>
                <Field
                  name="name"
                  component={ValidatedTextInput}
                  label="Full Name"
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  maxLength={50}
                />
                
                <Field
                  name="email"
                  component={ValidatedTextInput}
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Field
                  name="password"
                  component={ValidatedTextInput}
                  label="Password"
                  placeholder="Enter a secure password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                
                <PasswordStrength password={values.password} />
                
                <Field
                  name="confirmPassword"
                  component={ValidatedTextInput}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading || !isValid}
                  style={styles.button}
                  accessibilityLabel="Register button"
                  accessibilityHint="Creates a new account"
                >
                  Register
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.link}
                  accessibilityLabel="Login link"
                  accessibilityHint="Navigate to login screen"
                >
                  Already have an account? Login
                </Button>
              </>
            )}
          </Formik>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 10,
  },
});
