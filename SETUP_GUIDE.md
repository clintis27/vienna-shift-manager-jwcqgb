
# Hotel House of Vienna - Setup Guide

## Complete Setup Instructions

This guide will walk you through setting up the Hotel House of Vienna Shift Manager app from scratch.

---

## 1. Supabase Setup

### Database Tables

The following tables are already created via migrations:
- `employees` - Employee profiles
- `shifts` - Shift schedules
- `sick_leave_certificates` - Sick leave documentation

### Storage Bucket Setup

**IMPORTANT**: You must create the storage bucket manually in Supabase Dashboard:

1. Go to https://app.supabase.com
2. Select your project: `ymhpedaffxxdknroefnk`
3. Navigate to **Storage** in the left sidebar
4. Click **New Bucket**
5. Configure the bucket:
   - **Name**: `sick-leave-certificates`
   - **Public**: OFF (unchecked)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/png, application/pdf`
6. Click **Create Bucket**

### Storage Policies

After creating the bucket, add these policies:

1. Go to **Storage** > **Policies** > **sick-leave-certificates**
2. Click **New Policy**

**Policy 1: Employees can upload**
```sql
CREATE POLICY "Employees can upload their own certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sick-leave-certificates' AND
  auth.uid() IN (
    SELECT user_id FROM public.employees
  )
);
```

**Policy 2: Employees can view their own**
```sql
CREATE POLICY "Employees can view their own certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'sick-leave-certificates' AND
  auth.uid() IN (
    SELECT user_id FROM public.employees
  )
);
```

**Policy 3: Admins can view all**
```sql
CREATE POLICY "Admins can view all certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'sick-leave-certificates' AND
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## 2. Push Notifications Setup

### iOS (Apple Push Notification Service)

1. **Apple Developer Account**:
   - Go to https://developer.apple.com
   - Navigate to **Certificates, Identifiers & Profiles**
   - Create an **App ID** with Push Notifications enabled
   - Create a **Push Notification Certificate**

2. **Expo Configuration**:
   ```bash
   eas credentials
   ```
   - Select iOS
   - Select Push Notifications
   - Upload your .p8 key file

### Android (Firebase Cloud Messaging)

1. **Firebase Console**:
   - Go to https://console.firebase.google.com
   - Create a new project or select existing
   - Add an Android app
   - Download `google-services.json`

2. **Expo Configuration**:
   ```bash
   eas credentials
   ```
   - Select Android
   - Select Push Notifications
   - Upload your `google-services.json`

---

## 3. Initial Data Setup

### Create Admin Users

Run this SQL in Supabase SQL Editor:

```sql
-- Create admin user for Breakfast category
INSERT INTO public.employees (
  email, first_name, last_name, role, category, department
) VALUES (
  'breakfast-admin@hotel.com',
  'Maria',
  'Schmidt',
  'admin',
  'breakfast',
  'Breakfast'
);

-- Create admin user for Housekeeping category
INSERT INTO public.employees (
  email, first_name, last_name, role, category, department
) VALUES (
  'housekeeping-admin@hotel.com',
  'Hans',
  'Müller',
  'admin',
  'housekeeping',
  'Housekeeping'
);

-- Create admin user for Front Desk category
INSERT INTO public.employees (
  email, first_name, last_name, role, category, department
) VALUES (
  'frontdesk-admin@hotel.com',
  'Anna',
  'Weber',
  'admin',
  'frontdesk',
  'Front Desk'
);

-- Create a test employee
INSERT INTO public.employees (
  email, first_name, last_name, role, category, department
) VALUES (
  'employee@hotel.com',
  'Peter',
  'Fischer',
  'employee',
  'breakfast',
  'Breakfast'
);
```

### Register Users in Supabase Auth

For each employee created above, you need to register them in Supabase Auth:

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. **IMPORTANT**: Link the auth user to the employee record:

```sql
-- Update employee with auth user_id
UPDATE public.employees
SET user_id = 'auth-user-id-from-dashboard'
WHERE email = 'breakfast-admin@hotel.com';
```

Repeat for all users.

---

## 4. Testing the App

### Demo Credentials

After setup, you can login with:

**Breakfast Admin:**
- Email: `breakfast-admin@hotel.com`
- Password: (set during auth user creation)

**Housekeeping Admin:**
- Email: `housekeeping-admin@hotel.com`
- Password: (set during auth user creation)

**Front Desk Admin:**
- Email: `frontdesk-admin@hotel.com`
- Password: (set during auth user creation)

**Employee:**
- Email: `employee@hotel.com`
- Password: (set during auth user creation)

### Test Checklist

- [ ] Login with each user type
- [ ] View home screen with category-specific layout
- [ ] Create a shift (admin only)
- [ ] View shifts in schedule
- [ ] Book availability
- [ ] Clock in/out with GPS
- [ ] Upload sick leave certificate
- [ ] View notifications
- [ ] Generate monthly report
- [ ] Update profile

---

## 5. Environment Configuration

### Development

```bash
# Start development server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Production

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

---

## 6. Troubleshooting

### Common Issues

**Issue: "Storage bucket not found"**
- Solution: Create the `sick-leave-certificates` bucket in Supabase Dashboard

**Issue: "Permission denied" when uploading certificates**
- Solution: Verify storage policies are created correctly

**Issue: "User not found" after login**
- Solution: Ensure employee record has correct `user_id` linked to auth user

**Issue: GPS not working**
- Solution: Check location permissions in device settings

**Issue: Push notifications not received**
- Solution: Verify push notification credentials are configured in EAS

### Debug Mode

Enable debug logging:

```typescript
// In app/_layout.tsx
console.log('Debug mode enabled');
```

Check logs:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

---

## 7. Security Checklist

- [ ] All RLS policies enabled and tested
- [ ] Storage bucket is private (not public)
- [ ] API keys are not exposed in client code
- [ ] HTTPS only for all API calls
- [ ] Biometric authentication enabled
- [ ] Session timeout configured
- [ ] Password requirements enforced
- [ ] Rate limiting enabled on Supabase

---

## 8. Performance Optimization

### Database Indexes

All necessary indexes are created via migrations:
- `idx_employees_user_id`
- `idx_employees_role`
- `idx_employees_category`
- `idx_shifts_employee_id`
- `idx_shifts_date`
- `idx_shifts_status`
- `idx_sick_leave_employee_id`
- `idx_sick_leave_status`
- `idx_sick_leave_reviewed_by`

### App Optimization

- Images are optimized and compressed
- Lazy loading for heavy components
- Efficient re-rendering with React.memo
- AsyncStorage for offline functionality

---

## 9. Monitoring & Analytics

### Recommended Tools

1. **Sentry** - Error tracking
   ```bash
   npm install @sentry/react-native
   ```

2. **Mixpanel** - User analytics
   ```bash
   npm install mixpanel-react-native
   ```

3. **Supabase Logs** - Database monitoring
   - Available in Supabase Dashboard

---

## 10. Backup & Recovery

### Database Backups

Supabase automatically backs up your database daily. To create manual backup:

1. Go to **Database** > **Backups** in Supabase Dashboard
2. Click **Create Backup**
3. Download backup file

### Restore Procedure

1. Go to **Database** > **Backups**
2. Select backup to restore
3. Click **Restore**

---

## Support

For technical support:
- Email: developer@hotelhousevienna.com
- Documentation: See DEPLOYMENT.md
- Supabase Support: https://supabase.com/support

---

## Next Steps

1. Complete Supabase setup (storage bucket)
2. Create initial admin users
3. Test all features
4. Configure push notifications
5. Prepare app store assets
6. Submit for review

Good luck with your launch! 🚀
