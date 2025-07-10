# iOS Build and Deployment Guide

## Prerequisites

Before building for iOS, ensure you have:
- Xcode 14.0 or later
- iOS 13.0+ deployment target
- Valid Apple Developer account
- Provisioning profiles and certificates

## Development Build

### 1. Install Dependencies
```bash
npm install
cd ios && pod install && cd ..
```

### 2. Start Metro Bundler
```bash
npm start
```

### 3. Run on Simulator/Device
```bash
npm run ios
# or for specific device
npx react-native run-ios --device "Your Device Name"
```

## Production Build

### 1. Prepare for Release

#### Update Version Numbers
In `ios/sistersconnect/Info.plist`:
- `CFBundleShortVersionString`: App version (e.g., "1.0.0")
- `CFBundleVersion`: Build number (increment for each build)

#### Configure Code Signing
1. Open `ios/sistersconnect.xcworkspace` in Xcode
2. Select sistersconnect target
3. Go to "Signing & Capabilities"
4. Select appropriate Team and Provisioning Profile

### 2. Create Release Build

#### Option A: Using Xcode
1. Open `ios/sistersconnect.xcworkspace`
2. Select "Any iOS Device" or your target device
3. Choose Product → Archive
4. Once archived, click "Distribute App"
5. Choose "App Store Connect"

#### Option B: Using Command Line
```bash
# Build JavaScript bundle
npm run build:ios

# Build and archive
cd ios
xcodebuild -workspace sistersconnect.xcworkspace \
           -scheme sistersconnect \
           -configuration Release \
           -archivePath sistersconnect.xcarchive \
           archive

# Export for App Store
xcodebuild -exportArchive \
           -archivePath sistersconnect.xcarchive \
           -exportPath . \
           -exportOptionsPlist ExportOptions.plist
```

### 3. App Store Connect

#### Upload Build
1. Use Xcode's Organizer, or
2. Use Application Loader, or
3. Use Transporter app

#### Complete App Store Listing
1. App Information
   - Name: SistersConnect
   - Subtitle: Muslim Sisterhood Community
   - Category: Social Networking
   - Age Rating: 12+

2. Pricing and Availability
   - Price: Free
   - Availability: Worldwide

3. App Store Information
   - Description: See APP_STORE_METADATA.md
   - Keywords: muslim, sisterhood, community, islam, friendship
   - Screenshots: Required for all device sizes

4. App Review Information
   - Contact Information
   - Demo Account (if required)
   - Review Notes

## Code Signing Setup

### 1. Certificates
- iOS Development Certificate (for development)
- iOS Distribution Certificate (for App Store)

### 2. Provisioning Profiles
- Development Provisioning Profile
- App Store Distribution Provisioning Profile

### 3. App Store Connect Setup
1. Create App ID: `com.sshalimcoder.sistersconnect`
2. Configure App Services:
   - Push Notifications (if applicable)
   - In-App Purchase (if applicable)
   - Associated Domains (if applicable)

## Build Configuration

### Debug vs Release

#### Debug Build
- JavaScript debugging enabled
- Metro bundler connection
- Detailed error information
- Performance profiling available

#### Release Build
- JavaScript optimized and minified
- Metro bundler not required
- Error logging reduced
- Maximum performance

### Environment Variables

Create `ios/.xcode.env.local` for local environment:
```bash
export RCT_METRO_PORT=8081
export SKIP_BUNDLING=1  # Set to skip bundling during archive
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clean build folder
cd ios
rm -rf build/
xcodebuild clean

# Reset Metro cache
npx react-native start --reset-cache
```

#### 2. Pod Installation Issues
```bash
cd ios
pod deintegrate
pod install
```

#### 3. Code Signing Issues
- Verify certificates in Keychain Access
- Check provisioning profiles in Xcode preferences
- Ensure bundle identifier matches App ID

#### 4. Archive Issues
- Ensure proper build configuration (Release)
- Check for any build warnings or errors
- Verify all required frameworks are linked

### Performance Optimization

#### 1. Bundle Size Optimization
```bash
# Analyze bundle size
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios-bundle.js \
  --verbose
```

#### 2. Image Optimization
- Use appropriate image sizes for @1x, @2x, @3x
- Optimize images with tools like ImageOptim
- Consider using WebP format where supported

#### 3. JavaScript Optimization
- Enable Hermes JavaScript engine (if applicable)
- Use ProGuard/R8 for code obfuscation
- Remove unnecessary dependencies

## App Store Review Guidelines

### Key Points for SistersConnect

1. **User-Generated Content**
   - Implement robust content moderation
   - Provide easy reporting mechanisms
   - Clear community guidelines

2. **Social Networking**
   - Age-appropriate content controls
   - Privacy protection measures
   - Anti-bullying policies

3. **Religious Content**
   - Respectful representation of Islamic values
   - No discriminatory content
   - Inclusive community approach

### Pre-Submission Checklist

- [ ] App crashes tested and fixed
- [ ] All features work as expected
- [ ] Privacy policy accessible in app
- [ ] Terms of service accessible in app
- [ ] Age rating appropriate (12+)
- [ ] In-app purchases configured (if any)
- [ ] Push notifications configured (if any)
- [ ] App metadata complete and accurate
- [ ] Screenshots current and representative
- [ ] Test account provided (if login required)

## Post-Submission

### Monitoring
1. App Store Connect for review status
2. Crash reporting tools
3. User feedback and ratings
4. Performance metrics

### Updates
1. Bug fixes and improvements
2. New features based on user feedback
3. iOS version compatibility updates
4. Security updates

---

For questions or issues with the iOS build process, please check the main README.md or create an issue in the repository.