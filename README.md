# SistersConnect

SistersConnect is a React Native app designed to help Muslim sisters connect, make friends, and build meaningful relationships within their community.

## Features

### 🔐 Complete Authentication System

- **Login Screen**: Secure email/password authentication with validation
- **Sign Up Screen**: User registration with comprehensive form validation
- **Forgot Password**: Password reset functionality via email
- **Profile Management**: User profile viewing and account management
- **Secure Token Storage**: Uses AsyncStorage for secure token management
- **Auto-logout**: Session management with automatic logout on token expiration

### 🎨 UI/UX Features

- Clean, modern design with Islamic-friendly aesthetics
- Responsive layouts that work on different screen sizes
- Loading states and error handling throughout the app
- Accessible and user-friendly interface
- Islamic greetings and culturally appropriate messaging

### 🛡️ Security Features

- Password strength validation (uppercase, lowercase, numbers required)
- Email format validation
- Input sanitization and validation
- Secure token storage using AsyncStorage
- Protected routes requiring authentication

## Technology Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation and routing
- **React Context API** - State management for authentication
- **AsyncStorage** - Secure local storage
- **Jest** - Testing framework

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── AppNavigator.tsx # Main navigation component
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── screens/            # App screens
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── HomeScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # API and business logic
│   └── authService.ts  # Authentication service
├── types/              # TypeScript type definitions
│   └── auth.ts
└── utils/              # Utility functions
    └── validation.ts   # Form validation helpers
```

## Authentication Flow

1. **Unauthenticated Users** see the Auth Stack:

   - Login Screen (default)
   - Sign Up Screen
   - Forgot Password Screen

2. **Authenticated Users** see the Main App:
   - Home Screen with quick actions and stats
   - Profile Screen for account management
   - Bottom tab navigation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sshalim-coder/sistersconnect.git
cd sistersconnect
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Run on your platform:

```bash
# For Android
npm run android

# For iOS
npm run ios
```

### Testing

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Authentication Service Integration

The app is designed to easily integrate with various authentication backends:

- **Firebase Auth** - Ready for Firebase integration
- **Auth0** - Can be configured for Auth0
- **Custom Backend** - Adaptable to any REST API

Simply update the `AuthService` class in `src/services/authService.ts` to connect to your chosen backend.

## Validation Features

- **Email Validation**: Proper email format checking
- **Password Strength**: Requires uppercase, lowercase, and numbers
- **Form Validation**: Real-time validation with helpful error messages
- **Input Sanitization**: Prevents malicious input

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Islamic Values

This app is built with Islamic values in mind:

- Encouraging positive connections between Muslim sisters
- Promoting community building and sisterhood
- Maintaining appropriate Islamic etiquette in all interactions
- Supporting Islamic study circles and community events
