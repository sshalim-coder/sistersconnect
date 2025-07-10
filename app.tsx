import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';

const App = () => {
  const handleGetStarted = () => {
    Alert.alert(
      'Welcome Sister! 🌙',
      'SistersConnect is ready to help you build meaningful friendships with your Muslim sisters worldwide. This is a preview of the app setup.',
      [{text: 'Alhamdulillah!', style: 'default'}],
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.moonIcon} />
          </View>

          <Text style={styles.title}>SistersConnect</Text>
          <Text style={styles.subtitle}>
            Building bonds, strengthening faith
          </Text>

          <Text style={styles.description}>
            Join the most trusted social platform for Muslim women to build
            meaningful friendships and strengthen community bonds in a safe,
            respectful environment guided by Islamic values.
          </Text>

          <Pressable style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>

          <View style={styles.features}>
            <Text style={styles.featureItem}>
              🤝 Safe & Respectful Community
            </Text>
            <Text style={styles.featureItem}>🌙 Islamic Values-Based</Text>
            <Text style={styles.featureItem}>🔒 Privacy First</Text>
            <Text style={styles.featureItem}>🌍 Global Sisterhood</Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  moonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    alignItems: 'center',
  },
  featureItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default App;
