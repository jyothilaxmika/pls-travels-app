# 🗄️ Supabase Configuration Guide - PLS Travels DMS

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Supabase account (free tier is sufficient)
- ✅ Your project URL and API keys ready
- ✅ Access to Supabase Dashboard

## 🚀 Step-by-Step Configuration

### **Step 1: Access Your Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in to your account
   - Open your project: `oiizdjzegvkqimbwjzax`

2. **Verify Project Details**
   - Project URL: `https://oiizdjzegvkqimbwjzax.supabase.co`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU`

### **Step 2: Run Database Schema**

1. **Open SQL Editor**
   - In Supabase Dashboard, click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy and Paste Schema**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created**
   Run this query to check:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('drivers', 'trips', 'payments', 'attendance');
   ```

### **Step 3: Create Storage Bucket**

1. **Navigate to Storage**
   - In Supabase Dashboard, click **Storage** in the left sidebar
   - Click **Create bucket**

2. **Configure Bucket**
   - **Name**: `trip-photos`
   - **Public bucket**: ✅ **ON** (important for photo access)
   - Click **Create bucket**

3. **Verify Bucket Created**
   - You should see `trip-photos` in your buckets list
   - Status should show as "Public"

### **Step 4: Configure Authentication**

1. **Go to Authentication Settings**
   - In Supabase Dashboard, click **Authentication** → **Settings**

2. **Configure Email Auth**
   - **Enable Email Auth**: ✅ **ON**
   - **Enable Email Confirmations**: ✅ **OFF** (for magic link)
   - **Enable Magic Link**: ✅ **ON**

3. **Set Redirect URLs**
   - Add your deployment URLs:
     ```
     http://localhost:3000/auth/callback
     https://your-app.vercel.app/auth/callback
     ```

### **Step 5: Configure Row Level Security (RLS)**

1. **Verify RLS is Enabled**
   - The schema script automatically enables RLS
   - Check in **Authentication** → **Policies**

2. **Verify Policies**
   - All tables should have policies for authenticated users
   - Check that policies allow SELECT, INSERT, UPDATE, DELETE

### **Step 6: Test Database Connection**

1. **Run Verification Queries**
   ```sql
   -- Check sample data
   SELECT 'drivers' as table_name, COUNT(*) as row_count FROM drivers
   UNION ALL
   SELECT 'trips' as table_name, COUNT(*) as row_count FROM trips
   UNION ALL
   SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments;
   ```

2. **Expected Results**
   - drivers: 3 rows
   - trips: 6 rows (3 normal + 3 anomalies)
   - payments: 3 rows

### **Step 7: Test Storage Upload**

1. **Test Photo Upload**
   - Go to **Storage** → **trip-photos**
   - Try uploading a test image
   - Verify it's accessible via public URL

2. **Check Storage Policies**
   - Verify policies allow authenticated uploads
   - Verify policies allow public viewing

## 🔧 Advanced Configuration

### **Custom Functions**

The schema includes these helper functions:
- `get_trip_summary()` - Returns dashboard statistics
- `get_driver_rankings()` - Returns driver performance rankings
- `update_updated_at_column()` - Auto-updates timestamps

### **Anomaly Detection**

The system automatically flags trips as anomalies when:
- Distance < 5km or > 300km
- Fuel cost > 30% of trip amount
- Missing photo upload
- Unusual patterns

### **Audit System**

Trips can have these audit statuses:
- `pending` - New trip, not reviewed
- `needs_review` - Flagged as anomaly
- `verified` - Manually approved
- `rejected` - Manually rejected

## 🧪 Testing Checklist

### **Database Tests**
- [ ] Tables created successfully
- [ ] Sample data inserted
- [ ] RLS policies working
- [ ] Functions executing correctly

### **Storage Tests**
- [ ] Bucket created and public
- [ ] Photo upload working
- [ ] Public access working
- [ ] Policies configured correctly

### **Authentication Tests**
- [ ] Magic link login working
- [ ] User sessions persisting
- [ ] Redirect URLs configured
- [ ] Email templates working

### **Application Tests**
- [ ] Dashboard loading data
- [ ] Trip creation with photos
- [ ] Anomaly detection working
- [ ] Audit system functional

## 🚨 Troubleshooting

### **Common Issues**

1. **"Table doesn't exist"**
   - Run the schema script again
   - Check for SQL errors in the editor

2. **"Permission denied"**
   - Verify RLS policies are enabled
   - Check user authentication status

3. **"Photo upload fails"**
   - Verify storage bucket exists
   - Check bucket is public
   - Verify storage policies

4. **"Authentication fails"**
   - Check redirect URLs
   - Verify email settings
   - Test with different email

### **Debug Queries**

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('drivers', 'trips', 'payments', 'attendance');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('drivers', 'trips', 'payments', 'attendance');

-- Check storage buckets
SELECT name, public FROM storage.buckets;
```

## 📊 Monitoring

### **Key Metrics to Watch**
- **Database Connections**: Should be stable
- **Storage Usage**: Monitor photo uploads
- **Authentication Rate**: Track login success
- **Query Performance**: Monitor slow queries

### **Logs to Monitor**
- **Supabase Dashboard** → **Logs**
- **Authentication** → **Users**
- **Database** → **Logs**

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit API keys to git
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **RLS Policies**
   - Always enable RLS on sensitive tables
   - Test policies thoroughly
   - Review policies regularly

3. **Storage Security**
   - Use public buckets only for public content
   - Implement proper file validation
   - Monitor upload patterns

## ✅ Success Criteria

Your Supabase is properly configured when:

- [ ] All tables exist with correct structure
- [ ] Sample data is present
- [ ] Storage bucket is public and accessible
- [ ] Authentication works with magic links
- [ ] RLS policies are active
- [ ] Helper functions execute correctly
- [ ] Photo uploads work
- [ ] Anomaly detection flags trips
- [ ] Dashboard shows real data

## 🎉 Next Steps

Once Supabase is configured:

1. **Test the Application**
   - Run `npm run dev`
   - Visit `http://localhost:3000`
   - Test login and all features

2. **Deploy to Production**
   - Push to GitHub
   - Deploy to Vercel/Railway
   - Update environment variables

3. **Monitor Usage**
   - Check Supabase dashboard regularly
   - Monitor performance metrics
   - Gather user feedback

---

**Need Help?** Check the Supabase documentation or contact support.
