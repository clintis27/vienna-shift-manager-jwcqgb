
# 🚀 Launch Commands - Quick Reference

## Essential Commands for Production Launch

---

## 📋 STEP-BY-STEP LAUNCH COMMANDS

### 1️⃣ Initial Setup (One-Time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize your EAS project
eas init

# This will give you a project ID - copy it!
# Then update app.json:
# "extra": { "eas": { "projectId": "YOUR-PROJECT-ID" } }
```

---

### 2️⃣ Configure Credentials

#### iOS Credentials
```bash
# Set up iOS credentials (certificates, provisioning profiles)
eas credentials

# Select: iOS
# Follow the prompts to configure:
# - Distribution Certificate
# - Provisioning Profile
# - Push Notification Key (optional)
```

#### Android Credentials
```bash
# Set up Android credentials (keystore)
eas credentials

# Select: Android
# Follow the prompts to configure:
# - Keystore (auto-generated)
# - Push Notification credentials (optional)
```

---

### 3️⃣ Build for Production

#### Build iOS
```bash
# Build for App Store (production)
eas build --platform ios --profile production

# Build for TestFlight (preview/testing)
eas build --platform ios --profile preview

# Check build status
eas build:list
```

#### Build Android
```bash
# Build for Google Play Store (production - AAB format)
eas build --platform android --profile production

# Build for testing (preview - APK format)
eas build --platform android --profile preview

# Check build status
eas build:list
```

#### Build Both Platforms
```bash
# Build for both iOS and Android at once
eas build --platform all --profile production
```

---

### 4️⃣ Submit to App Stores

#### Submit to iOS App Store
```bash
# Automatic submission (recommended)
eas submit --platform ios --profile production

# You'll be prompted for:
# - Apple ID email
# - App-specific password
# - App Store Connect App ID
```

#### Submit to Google Play Store
```bash
# Automatic submission (recommended)
eas submit --platform android --profile production

# You'll need:
# - Service account key JSON file
# - Track: production, beta, or alpha
```

#### Submit Both Platforms
```bash
# Submit to both stores at once
eas submit --platform all --profile production
```

---

### 5️⃣ Over-The-Air (OTA) Updates

```bash
# Publish an update (for JavaScript-only changes)
eas update --branch production --message "Bug fixes and improvements"

# View update history
eas update:list

# Roll back to previous version
eas update:rollback
```

---

## 🔧 DEVELOPMENT COMMANDS

### Local Development
```bash
# Start development server
npm run dev

# Start with tunnel (for testing on physical device)
npm run dev -- --tunnel

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

### Testing
```bash
# Run linter
npm run lint

# Check TypeScript types
npx tsc --noEmit

# Clear cache and restart
npx expo start --clear
```

---

## 📱 DEVICE TESTING COMMANDS

### iOS Device Testing
```bash
# Install on connected iOS device
eas device:create

# Build development client for device
eas build --platform ios --profile development

# Install build on device
eas build:run --platform ios
```

### Android Device Testing
```bash
# Install on connected Android device
adb install path/to/your-app.apk

# Check connected devices
adb devices

# View logs
adb logcat | grep ReactNative
```

---

## 🔍 DEBUGGING COMMANDS

### View Logs
```bash
# View EAS build logs
eas build:view <build-id>

# View update logs
eas update:view <update-id>

# View project info
eas project:info
```

### Supabase Commands
```bash
# Check Supabase connection (in your app)
# Add this to your code temporarily:
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
```

---

## 📊 MONITORING COMMANDS

### Check Build Status
```bash
# List all builds
eas build:list

# View specific build
eas build:view <build-id>

# Cancel a build
eas build:cancel <build-id>
```

### Check Submission Status
```bash
# List all submissions
eas submit:list

# View specific submission
eas submit:view <submission-id>
```

---

## 🔐 CREDENTIALS MANAGEMENT

### View Credentials
```bash
# View iOS credentials
eas credentials --platform ios

# View Android credentials
eas credentials --platform android
```

### Update Credentials
```bash
# Update iOS push notification key
eas credentials --platform ios

# Update Android keystore
eas credentials --platform android
```

---

## 🚀 QUICK LAUNCH SEQUENCE

### Complete Launch (Copy & Paste)
```bash
# 1. Setup (one-time)
npm install -g eas-cli
eas login
eas init

# 2. Configure credentials
eas credentials  # iOS
eas credentials  # Android

# 3. Build for production
eas build --platform all --profile production

# 4. Wait for builds to complete (10-20 minutes)
# Check status: eas build:list

# 5. Submit to stores
eas submit --platform all --profile production

# 6. Done! Monitor your submissions in:
# - App Store Connect: https://appstoreconnect.apple.com
# - Google Play Console: https://play.google.com/console
```

---

## 🔄 UPDATE WORKFLOW

### For Bug Fixes (OTA Update)
```bash
# 1. Fix the bug in your code
# 2. Test locally
npm run dev

# 3. Publish update
eas update --branch production --message "Fixed login bug"

# Users will get the update automatically!
```

### For New Features (New Build)
```bash
# 1. Update version in app.json
# "version": "1.0.1"
# "ios": { "buildNumber": "2" }
# "android": { "versionCode": 2 }

# 2. Build new version
eas build --platform all --profile production

# 3. Submit to stores
eas submit --platform all --profile production
```

---

## 🆘 TROUBLESHOOTING COMMANDS

### Clear Everything and Start Fresh
```bash
# Clear Expo cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Clear EAS cache
eas build --clear-cache
```

### Check Environment
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Expo CLI version
npx expo --version

# Check EAS CLI version
eas --version
```

---

## 📞 GET HELP

### EAS Help Commands
```bash
# General help
eas --help

# Build help
eas build --help

# Submit help
eas submit --help

# Update help
eas update --help
```

### Useful Links
- **EAS Dashboard**: https://expo.dev
- **Build Status**: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
- **Documentation**: https://docs.expo.dev/

---

## ✅ VERIFICATION COMMANDS

### Before Launch
```bash
# 1. Check if EAS is configured
eas project:info

# 2. Check if credentials are set
eas credentials --platform ios
eas credentials --platform android

# 3. Test build locally
npm run dev

# 4. Verify environment variables
cat .env

# 5. Check app.json configuration
cat app.json | grep -A 5 "eas"
```

---

## 🎯 COMMON WORKFLOWS

### Workflow 1: First Time Launch
```bash
eas init
eas credentials  # iOS
eas credentials  # Android
eas build --platform all --profile production
eas submit --platform all --profile production
```

### Workflow 2: Quick Update (OTA)
```bash
# Make changes to JavaScript code
eas update --branch production --message "Your update message"
```

### Workflow 3: New Version Release
```bash
# Update version in app.json
eas build --platform all --profile production
eas submit --platform all --profile production
```

### Workflow 4: Emergency Rollback
```bash
eas update:rollback
```

---

## 📝 NOTES

### Important Reminders
- ✅ Always test on physical devices before submitting
- ✅ Update version numbers for new builds
- ✅ Use OTA updates for JavaScript-only changes
- ✅ Keep your credentials secure
- ✅ Monitor build status regularly
- ✅ Respond to app store reviews

### Build Times
- iOS build: ~10-20 minutes
- Android build: ~10-20 minutes
- OTA update: ~1-2 minutes

### Costs
- EAS Build: Free tier available, then paid plans
- Apple Developer: $99/year
- Google Play: $25 one-time

---

## 🚀 YOU'RE READY!

Copy and paste the commands above to launch your app!

**Start here:**
```bash
eas init
```

**Questions?** Run `eas --help` or check https://docs.expo.dev/

**Good luck! 🎉**
