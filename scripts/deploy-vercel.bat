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
echo    - NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
echo    - NEXT_PUBLIC_APP_NAME={{APP_NAME}}
echo 4. Deploy!

echo.
echo Your app will be available at: https://your-app-name.vercel.app

echo.
pause
