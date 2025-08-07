@echo off
REM PLS Travels DMS Deployment Script for Windows
REM This script helps deploy the application to various platforms

echo 🚀 PLS Travels DMS Deployment Script
echo =====================================

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ Error: .env.local file not found!
    echo Please create .env.local with the following variables:
    echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo NEXT_PUBLIC_APP_NAME=PLS Travels
    pause
    exit /b 1
)

REM Function to build the application
:build
if "%1"=="build" goto :build_app
if "%1"=="all" goto :build_app
goto :main

:build_app
echo 📦 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
if "%1"=="build" goto :end
goto :deploy_compose

REM Function to deploy to Vercel
:deploy_vercel
echo ☁️ Deploying to Vercel...
call npm install -g vercel
call vercel --prod
goto :end

REM Function to deploy with Docker
:deploy_docker
echo 🐳 Deploying with Docker...
docker build -t pls-travels-dms .
docker run -d -p 3000:3000 --env-file .env.local --name pls-travels-dms pls-travels-dms
echo ✅ Docker container started on port 3000
goto :end

REM Function to deploy with Docker Compose
:deploy_compose
echo 🐳 Deploying with Docker Compose...
docker-compose up -d
echo ✅ Application deployed with Docker Compose
goto :end

REM Function to start production server
:start_production
echo 🚀 Starting production server...
call npm run start
goto :end

REM Main deployment logic
:main
if "%1"=="vercel" goto :deploy_vercel
if "%1"=="docker" goto :deploy_docker
if "%1"=="compose" goto :deploy_compose
if "%1"=="start" goto :start_production
if "%1"=="all" goto :build_app
goto :help

:help
echo Usage: %0 [build^|vercel^|docker^|compose^|start^|all]
echo.
echo Commands:
echo   build   - Build the application
echo   vercel  - Deploy to Vercel
echo   docker  - Deploy with Docker
echo   compose - Deploy with Docker Compose
echo   start   - Start production server
echo   all     - Build and deploy with Docker Compose
echo.
echo Environment Setup:
echo   Make sure .env.local exists with required variables
echo   Required variables:
echo     NEXT_PUBLIC_SUPABASE_URL
echo     NEXT_PUBLIC_SUPABASE_ANON_KEY
echo     NEXT_PUBLIC_APP_NAME
goto :end

:end
pause
