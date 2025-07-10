# SistersConnect

A React Native app for Muslim women to connect and build community.

## Authentication System

This app includes a comprehensive authentication system with the following features:

### 🔐 Core Authentication Features

1. **Sign Up Screen** - New user registration with email/password
2. **Login Screen** - Existing user authentication
3. **Forgot Password** - Password reset functionality
4. **Authentication State Management** - Global auth state tracking
5. **Secure Storage** - Token storage using Expo SecureStore
6. **Form Validation** - Email format and password strength validation
7. **Loading States** - Visual feedback during auth operations
8. **Error Handling** - Meaningful error messages

### 🎨 User Experience Features

- Clean, modern UI design with blue theme (#3b82f6)
- Smooth navigation between screens
- Password visibility toggle
- "Remember me" functionality
- Responsive form validation with real-time feedback
- Loading indicators for all auth operations

### 🔒 Security Features

- **Password Requirements**: Minimum 8 characters with letters and numbers
- **Secure Token Storage**: Uses Expo SecureStore for sensitive data
- **Email Validation**: Proper email format validation
- **Form Validation**: Client-side validation for all inputs

### 📱 Screens

1. **LoginScreen** (`src/screens/LoginScreen.tsx`)
   - Email/password login form
   - Remember me checkbox
   - Forgot password link
   - Navigation to sign up

2. **SignUpScreen** (`src/screens/SignUpScreen.tsx`)
   - First name, last name, email, password fields
   - Password confirmation
   - Password requirements display
   - Form validation feedback

3. **ForgotPasswordScreen** (`src/screens/ForgotPasswordScreen.tsx`)
   - Email input for password reset
   - Back navigation
   - Success confirmation

4. **HomeScreen** (`src/screens/HomeScreen.tsx`)
   - Welcome message with user's name
   - Profile information display
   - Feature previews
   - Logout functionality

### 🏗️ Architecture

#### Components (`src/components/`)
- **FormInput**: Reusable form input with validation and password toggle
- **CustomButton**: Styled button with loading states
- **ErrorMessage**: Consistent error display component

#### Context (`src/contexts/`)
- **AuthContext**: Global authentication state management with React Context

#### Utils (`src/utils/`)
- **validation.ts**: Email and password validation functions
- **storage.ts**: Secure storage operations for tokens and user data

#### Navigation (`src/navigation/`)
- **Navigation.tsx**: Authentication-aware navigation setup

#### Types (`src/types/`)
- **auth.ts**: TypeScript interfaces for authentication

### 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Test credentials for demo:
   - Email: `test@example.com`
   - Password: `password123`

### 🧪 Testing

The authentication system includes:
- Form validation testing
- Email format validation
- Password strength validation
- Authentication flow simulation

Run validation tests:
```bash
node /tmp/test-validation.js
```

### 📋 Features Checklist

- [x] Sign Up Screen with form validation
- [x] Login Screen with form validation
- [x] Forgot Password functionality
- [x] Authentication state management
- [x] Secure token storage
- [x] Form validation (email, password strength)
- [x] Loading states and error handling
- [x] Password visibility toggle
- [x] "Remember me" functionality
- [x] Blue theme styling (#3b82f6)
- [x] Navigation between auth screens
- [x] TypeScript support
- [x] Clean, modern UI design

### 🔮 Future Enhancements

- Social media authentication (Google, Apple)
- Two-factor authentication
- Biometric authentication
- Password strength meter
- Account verification via email
- Social features for connecting with other Muslim women

---

**Note**: This is currently a demo implementation with mock API calls. In production, you would replace the mock authentication functions in `AuthContext.tsx` with actual API calls to your backend service.