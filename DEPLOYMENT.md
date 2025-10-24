
# Hotel House of Vienna - Shift Manager App
## Deployment Guide

This guide will help you deploy the Hotel House of Vienna Shift Manager app to both iOS App Store and Google Play Store.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) installed
- **Expo CLI** installed globally: `npm install -g expo-cli`
- **EAS CLI** installed globally: `npm install -g eas-cli`
- **Apple Developer Account** (for iOS deployment)
- **Google Play Developer Account** (for Android deployment)
- **Supabase Project** configured and running

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://ymhpedaffxxdknroefnk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Login to EAS

```bash
eas login
```

### 4. Configure EAS Project

```bash
eas build:configure
```

---

## Building for Production

### iOS Build

#### Step 1: Update App Identifiers

In `app.json`, update:
- `ios.bundleIdentifier`: Use your unique bundle ID
- `extra.eas.projectId`: Your EAS project ID

#### Step 2: Create iOS Build

```bash
# For App Store submission
eas build --platform ios --profile production

# For TestFlight (internal testing)
eas build --platform ios --profile preview
```

#### Step 3: Submit to App Store

```bash
eas submit --platform ios --profile production
```

**Required Information:**
- App Store Connect App ID
- Apple Team ID
- App Store screenshots (required sizes):
  - 6.7" Display: 1290 x 2796 pixels
  - 6.5" Display: 1242 x 2688 pixels
  - 5.5" Display: 1242 x 2208 pixels
- App description and keywords
- Privacy policy URL
- Support URL

---

### Android Build

#### Step 1: Update App Identifiers

In `app.json`, update:
- `android.package`: Use your unique package name
- `android.versionCode`: Increment for each release

#### Step 2: Create Android Build

```bash
# For Google Play Store
eas build --platform android --profile production

# For internal testing (APK)
eas build --platform android --profile preview
```

#### Step 3: Submit to Google Play

```bash
eas submit --platform android --profile production
```

**Required Information:**
- Google Play Console service account key (JSON)
- App screenshots (required):
  - Phone: 1080 x 1920 pixels (minimum 2 screenshots)
  - 7" Tablet: 1200 x 1920 pixels
  - 10" Tablet: 1600 x 2560 pixels
- Feature graphic: 1024 x 500 pixels
- App icon: 512 x 512 pixels
- Short description (80 characters max)
- Full description (4000 characters max)
- Privacy policy URL

---

## App Store Requirements

### iOS App Store

**Required Assets:**
1. App Icon (1024x1024 pixels, no transparency)
2. Screenshots for all device sizes
3. App Preview video (optional but recommended)
4. Privacy Policy URL
5. Support URL
6. Marketing URL (optional)

**App Information:**
- App Name: "Hotel House of Vienna - Shift Manager"
- Subtitle: "Employee Scheduling & Time Tracking"
- Category: Business
- Age Rating: 4+
- Copyright: © 2025 Hotel House of Vienna

**Privacy Information:**
- Location: Used for GPS-based time tracking
- Camera: Used for uploading sick leave certificates
- Photo Library: Used for uploading sick leave certificates
- Biometric Data: Used for secure authentication

### Google Play Store

**Required Assets:**
1. App Icon (512x512 pixels)
2. Feature Graphic (1024x500 pixels)
3. Screenshots (minimum 2 per device type)
4. Privacy Policy URL

**App Information:**
- App Name: "Hotel House of Vienna - Shift Manager"
- Short Description: "Streamline hotel shift scheduling, time tracking, and employee management"
- Full Description: Include features, benefits, and usage instructions
- Category: Business
- Content Rating: Everyone

**Permissions Explanation:**
- Location: "Used for GPS-based clock-in/out functionality"
- Camera: "Used to upload sick leave certificates"
- Storage: "Used to store and upload documents"
- Biometric: "Used for secure fingerprint/face authentication"

---

## Testing Before Launch

### 1. Internal Testing

```bash
# iOS TestFlight
eas build --platform ios --profile preview
eas submit --platform ios --profile preview

# Android Internal Testing
eas build --platform android --profile preview
```

### 2. Beta Testing

Invite 10-20 employees to test:
- Login/Registration flow
- Shift scheduling
- Time tracking with GPS
- Sick leave certificate upload
- Admin panel functionality
- Notifications
- Report generation

### 3. Performance Testing

- Test on low-end devices (Android 8.0+, iOS 13+)
- Test with poor network conditions
- Test offline functionality
- Monitor app size (should be < 50MB)
- Check battery usage
- Verify memory usage

---

## Launch Checklist

### Pre-Launch

- [ ] All features tested and working
- [ ] Database migrations applied
- [ ] RLS policies optimized
- [ ] Push notifications configured
- [ ] App icons and splash screens finalized
- [ ] Privacy policy published
- [ ] Support email/website ready
- [ ] App Store/Play Store listings prepared
- [ ] Screenshots and videos ready
- [ ] Beta testing completed
- [ ] Performance optimized
- [ ] Security audit completed

### iOS Launch

- [ ] Apple Developer account active
- [ ] Bundle ID registered
- [ ] Certificates and provisioning profiles created
- [ ] App Store Connect app created
- [ ] App metadata filled
- [ ] Screenshots uploaded
- [ ] Privacy policy linked
- [ ] App submitted for review
- [ ] Review approved
- [ ] App released

### Android Launch

- [ ] Google Play Developer account active
- [ ] Package name registered
- [ ] Signing key generated and secured
- [ ] Play Console app created
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] Privacy policy linked
- [ ] Content rating completed
- [ ] App submitted for review
- [ ] Review approved
- [ ] App released

---

## Post-Launch

### Monitoring

1. **Analytics**: Monitor user engagement and feature usage
2. **Crash Reports**: Use Sentry or similar for crash tracking
3. **User Feedback**: Monitor app store reviews and ratings
4. **Performance**: Track app performance metrics

### Updates

1. **Bug Fixes**: Release patches as needed
2. **Feature Updates**: Plan quarterly feature releases
3. **OS Updates**: Test with new iOS/Android versions
4. **Security Updates**: Keep dependencies updated

### Support

1. **User Support**: Respond to user inquiries within 24 hours
2. **Documentation**: Maintain user guides and FAQs
3. **Training**: Provide training materials for new employees

---

## Minimum System Requirements

### iOS
- iOS 13.0 or later
- iPhone 6s or newer
- iPad (5th generation) or newer
- 100 MB free storage

### Android
- Android 8.0 (API level 26) or later
- 2 GB RAM minimum
- 100 MB free storage
- GPS capability (for time tracking)

---

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Monitor error logs
- Check user feedback
- Review app performance metrics

**Monthly:**
- Update dependencies
- Security patches
- Performance optimization

**Quarterly:**
- Feature updates
- Major bug fixes
- OS compatibility updates

### Emergency Procedures

If critical issues arise:
1. Identify the issue severity
2. Create hotfix branch
3. Test thoroughly
4. Submit expedited review (if available)
5. Communicate with users

---

## Contact & Resources

- **Developer Support**: developer@hotelhousevienna.com
- **User Support**: support@hotelhousevienna.com
- **Supabase Dashboard**: https://app.supabase.com
- **EAS Dashboard**: https://expo.dev
- **Apple Developer**: https://developer.apple.com
- **Google Play Console**: https://play.google.com/console

---

## Version History

### Version 1.0.0 (Current)
- Initial release
- Employee authentication
- Shift scheduling
- GPS-based time tracking
- Admin panel
- Sick leave certificate upload
- Push notifications
- Monthly reports
- Category-specific layouts (Breakfast, Housekeeping, Front Desk)

---

## License

© 2025 Hotel House of Vienna. All rights reserved.
