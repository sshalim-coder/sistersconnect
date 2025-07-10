import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import { HomeScreen } from '../src/screens/HomeScreen';

const MockNavigationProp = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => false),
  isFocused: jest.fn(() => true),
  push: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  setOptions: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('HomeScreen', () => {
  it('should render correctly when user is authenticated', () => {
    const { getByText } = render(
      <AuthProvider>
        <HomeScreen navigation={MockNavigationProp} />
      </AuthProvider>
    );

    expect(getByText('Welcome to SistersConnect')).toBeTruthy();
    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText('Find Sisters')).toBeTruthy();
  });
});
