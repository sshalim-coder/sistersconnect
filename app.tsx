import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import ForYouPage from './video';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ForYouPage />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default App;
