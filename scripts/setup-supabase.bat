@echo off
echo ========================================
echo PLS Travels DMS - Supabase Setup Helper
echo ========================================

echo.
echo Opening Supabase Dashboard pages...
echo.

echo 1. Opening Supabase Dashboard...
start https://supabase.com/dashboard/project/oiizdjzegvkqimbwjzax

echo.
echo 2. Opening SQL Editor...
timeout /t 3 /nobreak >nul
start https://supabase.com/dashboard/project/oiizdjzegvkqimbwjzax/sql

echo.
echo 3. Opening Storage Setup...
timeout /t 3 /nobreak >nul
start https://supabase.com/dashboard/project/oiizdjzegvkqimbwjzax/storage

echo.
echo 4. Opening Authentication Settings...
timeout /t 3 /nobreak >nul
start https://supabase.com/dashboard/project/oiizdjzegvkqimbwjzax/auth/settings

echo.
echo ========================================
echo SETUP INSTRUCTIONS:
echo ========================================
echo.
echo STEP 1: Run Database Schema
echo - Go to SQL Editor (opened above)
echo - Click "New Query"
echo - Copy the contents of supabase-schema.sql
echo - Click "Run"
echo.
echo STEP 2: Create Storage Bucket
echo - Go to Storage (opened above)
echo - Click "Create bucket"
echo - Name: trip-photos
echo - Set Public bucket to ON
echo - Click "Create bucket"
echo.
echo STEP 3: Configure Authentication
echo - Go to Authentication Settings (opened above)
echo - Enable Email Auth: ON
echo - Enable Magic Link: ON
echo - Add redirect URLs for your deployment
echo.
echo STEP 4: Test Configuration
echo - Run verification queries in SQL Editor
echo - Test photo upload in Storage
echo - Test login in your application
echo.
echo ========================================
echo Your Supabase Project Details:
echo ========================================
echo.
echo Project URL: https://oiizdjzegvkqimbwjzax.supabase.co
echo Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU
echo.
echo ========================================
echo Environment Variables for your app:
echo ========================================
echo.
echo NEXT_PUBLIC_SUPABASE_URL=https://oiizdjzegvkqimbwjzax.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU
echo NEXT_PUBLIC_APP_NAME=PLS Travels
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Complete the setup steps above
echo 2. Test your application: npm run dev
echo 3. Deploy to production
echo 4. Monitor usage in Supabase Dashboard
echo.
echo ========================================
pause
