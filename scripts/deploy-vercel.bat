@echo off
echo ========================================
echo PLS Travels DMS - Vercel Deployment
echo ========================================

echo.
echo 1. Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix the errors above.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo.
echo 2. Checking Git status...
git status

echo.
echo 3. Committing changes...
git add .
git commit -m "Deploy to Vercel - %date% %time%"

echo.
echo 4. Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment initiated!
echo.
echo Next steps:
echo 1. Go to https://vercel.com
echo 2. Connect your GitHub repository
echo 3. Add environment variables:
echo    - NEXT_PUBLIC_SUPABASE_URL=https://xolfpyfftgalzvhpiffh.supabase.co
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_IhKYwioDXaMsX9QqL1jtdg__p1fQbb_
echo    - NEXT_PUBLIC_APP_NAME=PLS Travels
echo 4. Deploy!
echo.
echo Your app will be available at: https://your-app-name.vercel.app
echo.
pause
