import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validation';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { forgotPassword } = useAuth();

  const validateForm = (): boolean => {
    const error = validateEmail(email);
    setEmailError(error);
    return !error;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setIsEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'If an account with this email exists, you will receive password reset instructions shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (isEmailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to {email}
            </Text>
            <Text style={styles.successSubMessage}>
              Please check your email and follow the instructions to reset your
              password.
            </Text>

            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateToLogin}
            >
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendContainer}
              onPress={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
            >
              <Text style={styles.resendText}>
                Didn't receive the email? Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) {
                    setEmailError(null);
                  }
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <TouchableOpacity
              style={[
                styles.resetButton,
                isLoading && styles.resetButtonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>
                  Send Reset Instructions
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={navigateToLogin}
            >
              <Text style={styles.backToLoginText}>
                Remember your password? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backToLoginContainer: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  successSubMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
