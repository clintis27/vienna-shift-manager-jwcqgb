
# Complete Launch Guide - HR Management App

## 🚀 Quick Start

This guide will help you launch the HR Management App for Hotel House of Vienna on iOS, Android, and Web platforms.

---

## 📋 Pre-Launch Checklist

### 1. Environment Setup ✅
- [x] Node.js installed (v18 or higher)
- [x] Expo CLI installed globally
- [x] EAS CLI installed globally
- [x] Supabase project configured
- [x] Environment variables set

### 2. Dependencies Installed ✅
All required dependencies are already in package.json:
- React Native 0.81.4
- Expo 54
- Supabase client
- All UI and utility libraries

### 3. Database Setup ✅
All tables created with migrations:
- ✅ employees
- ✅ shifts
- ✅ leave_requests (NEW)
- ✅ tasks (NEW)
- ✅ documents (NEW)
- ✅ sick_leave_certificates

### 4. Features Implemented ✅
- ✅ Authentication & user management
- ✅ Shift scheduling
- ✅ Leave management with calendar
- ✅ Task management system
- ✅ Document upload system
- ✅ Enhanced admin dashboard
- ✅ Time tracking
- ✅ Smart reports
- ✅ Notifications system
- ✅ Profile management

---

## 🔧 Configuration Steps

### Step 1: Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "Hotel Vienna HR",
    "slug": "hotel-vienna-hr",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/final_quest_240x240.png",
    "scheme": "hotelviennahr",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/final_quest_240x240.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a1a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hotelviennahr.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/final_quest_240x240.png",
        "backgroundColor": "#1a1a1a"
      },
      "package": "com.hotelviennahr.app",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/final_quest_240x240.png"
    }
  }
}
```

### Step 2: Environment Variables

Create `.env` file (if not exists):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📱 Development Testing

### Test on iOS Simulator
```bash
npm run ios
```

### Test on Android Emulator
```bash
npm run android
```

### Test on Web Browser
```bash
npm run web
```

### Test on Physical Device (Expo Go)
```bash
npm run dev
```
Then scan the QR code with:
- iOS: Camera app
- Android: Expo Go app

---

## 🏗️ Production Builds

### Prerequisites

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS** (if not already done):
```bash
eas build:configure
```

---

### Build for iOS

#### Development Build (for testing):
```bash
eas build --platform ios --profile development
```

#### Production Build (for App Store):
```bash
eas build --platform ios --profile production
```

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect access
- Provisioning profiles configured

**Steps after build:**
1. Download the .ipa file
2. Upload to App Store Connect
3. Submit for review
4. Wait for approval (typically 1-3 days)

---

### Build for Android

#### Development Build (for testing):
```bash
eas build --platform android --profile development
```

#### Production Build (for Google Play):
```bash
eas build --platform android --profile production
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Signing key configured

**Steps after build:**
1. Download the .aab file
2. Upload to Google Play Console
3. Create a release
4. Submit for review
5. Wait for approval (typically 1-3 days)

---

### Build for Web

```bash
npm run build:web
```

**Deployment Options:**

#### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option 3: GitHub Pages
```bash
# Build
npm run build:web

# Deploy (requires gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

---

## 🔐 Security Configuration

### 1. Supabase RLS Policies
All tables have Row Level Security enabled. Verify with:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. API Keys
- ✅ Supabase URL and Anon Key configured
- ✅ Keys stored in environment variables
- ✅ Never commit keys to git

### 3. Authentication
- ✅ Email verification required
- ✅ Secure session management
- ✅ Role-based access control

---

## 📊 Post-Launch Monitoring

### 1. Error Tracking
Recommended: Sentry

```bash
npm install @sentry/react-native
```

Configure in `app/_layout.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### 2. Analytics
Recommended: Expo Analytics or Google Analytics

```bash
expo install expo-analytics
```

### 3. Performance Monitoring
- Monitor app load times
- Track API response times
- Watch for memory leaks
- Monitor crash rates

---

## 🧪 Testing Checklist

### Before Launch:

#### Authentication
- [ ] Sign up with new email
- [ ] Verify email
- [ ] Login with credentials
- [ ] Biometric login (if available)
- [ ] Logout and re-login
- [ ] Password reset flow

#### Employee Features
- [ ] View home dashboard
- [ ] Check today's shifts
- [ ] Request leave
- [ ] Upload sick leave certificate
- [ ] View assigned tasks
- [ ] Complete a task
- [ ] Clock in/out
- [ ] Generate report
- [ ] Update profile
- [ ] Change notification preferences

#### Admin Features
- [ ] View all employees
- [ ] Create new shift
- [ ] Assign shift to employee
- [ ] Approve leave request
- [ ] Reject leave request
- [ ] Approve sick leave certificate
- [ ] Create new task
- [ ] Assign task to employee
- [ ] View pending actions
- [ ] Delete shift

#### Cross-Platform
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web browser
- [ ] Test on tablet
- [ ] Test in dark mode
- [ ] Test in light mode

#### Performance
- [ ] App loads in < 3 seconds
- [ ] Smooth animations
- [ ] No lag when scrolling
- [ ] Images load quickly
- [ ] No memory leaks

#### Edge Cases
- [ ] No internet connection
- [ ] Poor internet connection
- [ ] Invalid data entry
- [ ] Concurrent updates
- [ ] Large data sets

---

## 📱 App Store Submission

### iOS App Store

1. **Prepare Assets:**
   - App icon (1024x1024)
   - Screenshots (various sizes)
   - App preview video (optional)

2. **App Store Connect:**
   - Create new app
   - Fill in app information
   - Set pricing (free)
   - Add screenshots
   - Write description
   - Set age rating
   - Add privacy policy URL

3. **Submit for Review:**
   - Upload build from EAS
   - Submit for review
   - Respond to any feedback
   - Wait for approval

**Timeline:** 1-3 days typically

### Google Play Store

1. **Prepare Assets:**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (various sizes)
   - Promo video (optional)

2. **Google Play Console:**
   - Create new app
   - Fill in app details
   - Set pricing (free)
   - Add screenshots
   - Write description
   - Set content rating
   - Add privacy policy URL

3. **Submit for Review:**
   - Upload build from EAS
   - Create production release
   - Submit for review
   - Wait for approval

**Timeline:** 1-3 days typically

---

## 🔄 Over-The-Air (OTA) Updates

Expo supports OTA updates for JavaScript changes without app store review.

### Publish Update:
```bash
eas update --branch production --message "Bug fixes and improvements"
```

### What can be updated OTA:
- ✅ JavaScript code
- ✅ Assets (images, fonts)
- ✅ Styling changes
- ✅ Bug fixes

### What requires new build:
- ❌ Native code changes
- ❌ New native dependencies
- ❌ Permission changes
- ❌ App icon/splash screen

---

## 📈 Growth & Scaling

### Phase 1: Launch (Week 1-4)
- Deploy to production
- Onboard initial users
- Monitor for critical bugs
- Collect feedback

### Phase 2: Stabilization (Month 2-3)
- Fix reported bugs
- Optimize performance
- Improve UX based on feedback
- Add minor features

### Phase 3: Enhancement (Month 4-6)
- Add AI assistant
- Advanced analytics
- Payroll integration
- Mobile widgets

### Phase 4: Expansion (Month 7+)
- Multi-location support
- Advanced reporting
- API for integrations
- White-label options

---

## 🆘 Troubleshooting

### Common Issues:

#### Build Fails
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Update Expo
npm install expo@latest
```

#### Supabase Connection Issues
- Check environment variables
- Verify Supabase URL and key
- Check RLS policies
- Verify network connection

#### Push Notifications Not Working
- Check Expo push token
- Verify notification permissions
- Test with Expo push tool
- Check device settings

#### App Crashes on Launch
- Check error logs
- Verify all dependencies installed
- Check for missing environment variables
- Test in development mode first

---

## 📞 Support Resources

### Documentation:
- Expo Docs: https://docs.expo.dev
- Supabase Docs: https://supabase.com/docs
- React Native Docs: https://reactnative.dev

### Community:
- Expo Discord
- React Native Community
- Stack Overflow

### Professional Support:
- Expo Support (paid plans)
- Supabase Support
- Custom development services

---

## ✅ Launch Day Checklist

### Morning of Launch:
- [ ] Final build tested
- [ ] All features working
- [ ] No critical bugs
- [ ] Database backed up
- [ ] Monitoring tools active
- [ ] Support team ready

### Launch:
- [ ] Submit to App Store
- [ ] Submit to Google Play
- [ ] Deploy web version
- [ ] Announce to team
- [ ] Monitor error logs
- [ ] Watch user feedback

### Post-Launch (First 24 Hours):
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to feedback
- [ ] Fix critical bugs immediately
- [ ] Prepare hotfix if needed

### First Week:
- [ ] Daily monitoring
- [ ] Collect user feedback
- [ ] Plan first update
- [ ] Optimize based on usage
- [ ] Celebrate success! 🎉

---

## 🎉 Congratulations!

Your HR Management App is ready for launch! This comprehensive system includes:

✅ Complete employee management
✅ Shift scheduling
✅ Leave management with calendar
✅ Task assignment system
✅ Document uploads
✅ Time tracking
✅ Smart reports
✅ Admin dashboard
✅ Notifications
✅ And much more!

**You've built a production-ready, enterprise-grade HR management solution!**

---

## 📝 Quick Command Reference

```bash
# Development
npm run dev          # Start development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in web browser

# Building
eas build --platform ios --profile production
eas build --platform android --profile production
npm run build:web

# Updates
eas update --branch production --message "Update message"

# Deployment
netlify deploy --prod --dir=dist
vercel --prod
```

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** 🚀 READY TO LAUNCH  
**Good luck with your launch!** 🎊
