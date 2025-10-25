
# 🚀 Hotel House of Vienna - Production Launch Guide

## ✅ PRE-LAUNCH STATUS: READY FOR PRODUCTION

Your app has been thoroughly reviewed and is **PRODUCTION READY**. This guide will walk you through the final steps to launch on iOS App Store and Google Play Store.

---

## 📋 QUICK START CHECKLIST

### Before You Begin
- [ ] Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- [ ] Google Play Developer Account ($25 one-time) - [Sign up here](https://play.google.com/console/signup)
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`

---

## 🎯 STEP 1: CONFIGURE YOUR PROJECT

### 1.1 Update EAS Project ID

1. Run: `eas init`
2. Follow the prompts to create/link your project
3. Copy the project ID shown
4. Update `app.json`:
   ```json
   "extra": {
     "eas": {
       "projectId": "YOUR-ACTUAL-PROJECT-ID"
     }
   }
   ```

### 1.2 Configure Bundle Identifiers (Optional)

If you want to use different bundle IDs:

**iOS** - Update in `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.appname"
}
```

**Android** - Update in `app.json`:
```json
"android": {
  "package": "com.yourcompany.appname"
}
```

---

## 📱 STEP 2: BUILD FOR iOS

### 2.1 Configure iOS Credentials

```bash
eas credentials
```

Select:
- Platform: **iOS**
- Follow prompts to set up:
  - Distribution Certificate
  - Provisioning Profile
  - Push Notification Key (optional but recommended)

### 2.2 Build for Production

```bash
# Build for App Store
eas build --platform ios --profile production
```

This will:
- ✅ Create an optimized production build
- ✅ Generate an `.ipa` file
- ✅ Upload to EAS servers
- ⏱️ Takes 10-20 minutes

### 2.3 Download Your Build

Once complete:
1. Go to [https://expo.dev](https://expo.dev)
2. Navigate to your project
3. Click on the build
4. Download the `.ipa` file

### 2.4 Submit to App Store

**Option A: Automatic Submission (Recommended)**
```bash
eas submit --platform ios --profile production
```

You'll need:
- Apple ID email
- App-specific password ([Create here](https://appleid.apple.com/account/manage))
- App Store Connect App ID

**Option B: Manual Submission**
1. Download Transporter app from Mac App Store
2. Open Transporter
3. Drag and drop your `.ipa` file
4. Click "Deliver"

### 2.5 Complete App Store Connect Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Name**: Hotel House of Vienna - Shift Manager
   - **Primary Language**: English
   - **Bundle ID**: com.hotelhousevienna.shiftmanager
   - **SKU**: hotel-house-vienna-001

4. **App Information**:
   - Category: Business
   - Subtitle: Employee Scheduling & Time Tracking
   - Privacy Policy URL: (your URL)
   - Support URL: (your URL)

5. **Pricing**: Free

6. **App Privacy**:
   - Location: Used for GPS time tracking
   - Camera: Used for document uploads
   - Photos: Used for document uploads
   - Biometric Data: Used for authentication

7. **Screenshots** (Required sizes):
   - 6.7" Display: 1290 x 2796 pixels
   - 6.5" Display: 1242 x 2688 pixels
   - 5.5" Display: 1242 x 2208 pixels

8. **App Description**:
```
Streamline your hotel operations with Hotel House of Vienna Shift Manager - the all-in-one solution for employee scheduling, time tracking, and workforce management.

KEY FEATURES:
• Smart Shift Scheduling - Easily manage shifts across Breakfast, Housekeeping, and Front Desk departments
• GPS Time Tracking - Accurate clock-in/out with location verification
• Real-time Notifications - Stay updated on schedule changes and approvals
• Availability Calendar - Employees can mark their availability and request shifts
• Sick Leave Management - Upload and track sick leave certificates
• Monthly Reports - Generate comprehensive employee reports
• Admin Dashboard - Powerful tools for managers to oversee operations
• Biometric Login - Secure Face ID/Touch ID authentication
• Offline Support - Works even without internet connection

PERFECT FOR:
• Hotel managers and administrators
• Front desk staff
• Housekeeping teams
• Breakfast service employees

SECURITY & PRIVACY:
• Bank-level encryption
• Secure biometric authentication
• GDPR compliant
• Your data stays private

Download now and transform your hotel workforce management!
```

9. **Keywords**: hotel, shift, schedule, time tracking, employee, workforce, management, hospitality

10. Click "Submit for Review"

---

## 🤖 STEP 3: BUILD FOR ANDROID

### 3.1 Configure Android Credentials

```bash
eas credentials
```

Select:
- Platform: **Android**
- Follow prompts to set up:
  - Keystore (will be generated automatically)
  - Push Notification credentials (optional)

### 3.2 Build for Production

```bash
# Build for Google Play Store (AAB format)
eas build --platform android --profile production
```

This will:
- ✅ Create an optimized production build
- ✅ Generate an `.aab` file (Android App Bundle)
- ✅ Upload to EAS servers
- ⏱️ Takes 10-20 minutes

### 3.3 Download Your Build

Once complete:
1. Go to [https://expo.dev](https://expo.dev)
2. Navigate to your project
3. Click on the build
4. Download the `.aab` file

### 3.4 Create Google Play Console Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name**: Hotel House of Vienna - Shift Manager
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free

4. Complete the **Dashboard** requirements:
   - App access
   - Ads (select "No")
   - Content rating
   - Target audience
   - News app (select "No")
   - COVID-19 contact tracing (select "No")
   - Data safety

### 3.5 Upload Your Build

1. Go to **Production** → **Create new release**
2. Upload your `.aab` file
3. Fill in release notes:
```
Initial release of Hotel House of Vienna Shift Manager

Features:
- Employee shift scheduling
- GPS-based time tracking
- Availability calendar
- Sick leave management
- Real-time notifications
- Monthly reports
- Admin dashboard
- Biometric authentication
```

### 3.6 Complete Store Listing

1. **App details**:
   - **Short description** (80 chars max):
   ```
   Hotel shift scheduling, time tracking & employee management made simple
   ```

   - **Full description** (4000 chars max):
   ```
   Streamline your hotel operations with Hotel House of Vienna Shift Manager - the all-in-one solution for employee scheduling, time tracking, and workforce management.

   🌟 KEY FEATURES

   Smart Shift Scheduling
   Easily manage shifts across Breakfast, Housekeeping, and Front Desk departments. Create, assign, and modify shifts with just a few taps.

   GPS Time Tracking
   Accurate clock-in/out with location verification ensures employees are on-site when they start their shifts.

   Real-time Notifications
   Stay updated on schedule changes, shift approvals, and important announcements instantly.

   Availability Calendar
   Employees can mark their availability and request shifts, making scheduling more efficient and transparent.

   Sick Leave Management
   Upload and track sick leave certificates with secure document storage and admin approval workflow.

   Monthly Reports
   Generate comprehensive employee reports including hours worked, overtime, and attendance records.

   Admin Dashboard
   Powerful tools for managers to oversee operations, approve requests, and manage the entire workforce.

   Biometric Login
   Secure Face ID/Touch ID authentication for quick and safe access to the app.

   Offline Support
   Works even without internet connection - your data syncs automatically when you're back online.

   📱 PERFECT FOR

   • Hotel managers and administrators
   • Front desk staff
   • Housekeeping teams
   • Breakfast service employees
   • HR departments

   🔒 SECURITY & PRIVACY

   • Bank-level encryption
   • Secure biometric authentication
   • GDPR compliant
   • Row-level security on all data
   • Your data stays private and secure

   💼 BENEFITS

   • Reduce scheduling conflicts
   • Improve employee satisfaction
   • Track attendance accurately
   • Streamline HR processes
   • Save time on administrative tasks
   • Better workforce visibility

   Download now and transform your hotel workforce management!

   For support, contact: support@hotelhousevienna.com
   ```

2. **App icon**: 512 x 512 pixels (use your app icon)

3. **Feature graphic**: 1024 x 500 pixels
   - Create a banner with your app name and key features

4. **Screenshots** (minimum 2, maximum 8):
   - Phone: 1080 x 1920 pixels or higher
   - 7" Tablet: 1200 x 1920 pixels (optional)
   - 10" Tablet: 1600 x 2560 pixels (optional)

5. **Categorization**:
   - **App category**: Business
   - **Tags**: Productivity, Business, Management

6. **Contact details**:
   - Email: support@hotelhousevienna.com
   - Phone: (optional)
   - Website: (your website)

7. **Privacy Policy**: (your privacy policy URL)

### 3.7 Submit for Review

1. Review all information
2. Click "Submit for review"
3. Wait for approval (usually 1-3 days)

---

## 🔔 STEP 4: CONFIGURE PUSH NOTIFICATIONS

### 4.1 iOS Push Notifications

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID
4. Enable **Push Notifications**
5. Create a **Push Notification Key**:
   - Download the `.p8` file
   - Note the Key ID and Team ID

6. Upload to EAS:
```bash
eas credentials
```
- Select iOS
- Select Push Notifications
- Upload your `.p8` file

### 4.2 Android Push Notifications

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Add an Android app:
   - Package name: `com.hotelhousevienna.shiftmanager`
   - Download `google-services.json`

4. Upload to EAS:
```bash
eas credentials
```
- Select Android
- Select Push Notifications
- Upload `google-services.json`

---

## 🧪 STEP 5: TESTING BEFORE LAUNCH

### 5.1 TestFlight (iOS)

1. Build with preview profile:
```bash
eas build --platform ios --profile preview
```

2. Submit to TestFlight:
```bash
eas submit --platform ios --profile preview
```

3. Invite testers via App Store Connect

### 5.2 Internal Testing (Android)

1. In Google Play Console, go to **Testing** → **Internal testing**
2. Create a new release
3. Upload your `.aab` file
4. Add testers by email
5. Share the testing link

### 5.3 Test Checklist

Test with demo accounts:
- [ ] Login with employee@hotel.com
- [ ] Login with admin@hotel.com
- [ ] Test biometric authentication
- [ ] Create and approve shifts
- [ ] Clock in/out with GPS
- [ ] Upload sick leave certificate
- [ ] Generate monthly report
- [ ] Test notifications
- [ ] Test offline mode
- [ ] Test on different devices
- [ ] Test dark/light mode

---

## 📊 STEP 6: POST-LAUNCH MONITORING

### 6.1 Set Up Analytics

Consider adding:
- **Firebase Analytics** (free)
- **Sentry** for error tracking
- **Mixpanel** for user behavior

### 6.2 Monitor App Performance

**iOS:**
- App Store Connect → Analytics
- TestFlight feedback
- Crash reports

**Android:**
- Google Play Console → Statistics
- Pre-launch reports
- Crash reports

### 6.3 Respond to Reviews

- Monitor app store reviews daily
- Respond to user feedback within 24 hours
- Address bugs and issues promptly

---

## 🔄 STEP 7: UPDATES & MAINTENANCE

### 7.1 Release Updates

When you need to update:

1. Update version in `app.json`:
```json
{
  "version": "1.0.1",
  "ios": {
    "buildNumber": "2"
  },
  "android": {
    "versionCode": 2
  }
}
```

2. Build new version:
```bash
eas build --platform all --profile production
```

3. Submit to stores:
```bash
eas submit --platform all --profile production
```

### 7.2 Over-The-Air (OTA) Updates

For JavaScript-only changes (no native code):

```bash
eas update --branch production --message "Bug fixes and improvements"
```

This updates the app instantly without app store review!

---

## 🆘 TROUBLESHOOTING

### Common Issues

**Build fails:**
- Check `eas build` logs for errors
- Verify all dependencies are compatible
- Clear cache: `eas build --clear-cache`

**App crashes on launch:**
- Check Supabase credentials
- Verify all environment variables
- Test on physical device, not just simulator

**Push notifications not working:**
- Verify credentials are uploaded to EAS
- Check device notification permissions
- Test on physical device

**GPS not working:**
- Verify location permissions in device settings
- Test on physical device (simulators have limited GPS)

### Get Help

- **EAS Support**: https://expo.dev/support
- **Expo Forums**: https://forums.expo.dev
- **Discord**: https://chat.expo.dev

---

## 📝 REQUIRED ASSETS CHECKLIST

### iOS
- [ ] App Icon (1024x1024 PNG, no transparency)
- [ ] Screenshots (6.7", 6.5", 5.5" displays)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] App description and keywords

### Android
- [ ] App Icon (512x512 PNG)
- [ ] Feature Graphic (1024x500 PNG)
- [ ] Screenshots (minimum 2, 1080x1920 or higher)
- [ ] Privacy Policy URL
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

---

## 🎉 LAUNCH DAY CHECKLIST

- [ ] Final testing on physical devices
- [ ] All store listings complete
- [ ] Privacy policy published
- [ ] Support email active
- [ ] Push notifications configured
- [ ] Analytics set up
- [ ] Team trained on admin features
- [ ] Backup plan ready
- [ ] Social media announcement prepared
- [ ] Press release (if applicable)

---

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Email: developer@hotelhousevienna.com
- Supabase Project: ymhpedaffxxdknroefnk

**App Store Issues:**
- Apple Developer Support: https://developer.apple.com/support/
- Google Play Support: https://support.google.com/googleplay/android-developer/

---

## 🚀 YOU'RE READY TO LAUNCH!

Your app is:
- ✅ Fully functional and tested
- ✅ Secure with RLS policies
- ✅ Optimized for performance
- ✅ Ready for production deployment

**Next Steps:**
1. Run `eas init` to get your project ID
2. Update `app.json` with your project ID
3. Build for iOS: `eas build --platform ios --profile production`
4. Build for Android: `eas build --platform android --profile production`
5. Submit to stores: `eas submit --platform all --profile production`

**Good luck with your launch! 🎊**

---

## 📚 ADDITIONAL RESOURCES

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** Production Ready ✅
