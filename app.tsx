import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Welcome to SistersConnect!</Text>
        <Text style={styles.subtitle}>Make new Muslim sisters friends.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6', // blue-ish
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
});

export default App;
