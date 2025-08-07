# 🗄️ Database Quick Setup

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `xolfpyfftgalzvhpiffh`

## Step 2: Run the SQL Schema

1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute the script

## Step 3: Create Storage Bucket

1. In your Supabase Dashboard, click **Storage** in the left sidebar
2. Click **Create bucket**
3. Enter bucket name: `trip-photos`
4. Set **Public bucket** to **ON**
5. Click **Create bucket**

## Step 4: Verify Setup

Run these verification queries in SQL Editor:

```sql
-- Check if tables exist and have data
SELECT 'drivers' as table_name, COUNT(*) as row_count FROM drivers
UNION ALL
SELECT 'trips' as table_name, COUNT(*) as row_count FROM trips
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments
UNION ALL
SELECT 'attendance' as table_name, COUNT(*) as row_count FROM attendance;
```

Expected results:
- drivers: 3 rows
- trips: 6 rows (3 normal + 3 anomalies)
- payments: 3 rows
- attendance: 3 rows

## Step 5: Test Anomaly Detection

```sql
-- Check anomaly trips
SELECT 
  t.id,
  d.name as driver_name,
  t.date,
  t.distance_km,
  t.amount,
  t.anomaly_flag,
  t.audit_status
FROM trips t
JOIN drivers d ON t.driver_id = d.id
WHERE t.anomaly_flag = true
ORDER BY t.date DESC;
```

You should see 3 anomaly trips with `anomaly_flag = true`.

## ✅ Setup Complete!

Your database is now ready. You can:

1. **Test the application locally**: `npm run dev`
2. **Deploy to production**: Follow the deployment guide
3. **Start using the system**: Login and begin managing drivers and trips

## 🚨 Troubleshooting

### If tables don't exist:
- Make sure you ran the entire SQL script
- Check for any error messages in SQL Editor
- Try running the script in smaller chunks

### If no data appears:
- Check that the INSERT statements ran successfully
- Verify RLS policies are not blocking access
- Test with a simple SELECT query

### If photos don't upload:
- Verify the `trip-photos` bucket exists
- Check storage policies are set correctly
- Test with a small image file

## 📞 Need Help?

If you encounter any issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Test the application locally first
4. Review the full documentation in `DATABASE_SETUP.md`

---

**Your PLS Travels DMS is now ready for use! 🎉**
