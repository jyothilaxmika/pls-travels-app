@echo off
echo ========================================
echo PLS Travels DMS - Database Setup Guide
echo ========================================

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
echo STEP 3: Test the Application
echo - Open http://localhost:3000
echo - Create your first account
echo - Test all features
echo.
echo ========================================
echo Your application is running at:
echo http://localhost:3000
echo ========================================
echo.
pause
