#!/bin/bash

# PLS Travels DMS Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 PLS Travels DMS Deployment Script"
echo "====================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with the following variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "NEXT_PUBLIC_APP_NAME=PLS Travels"
    exit 1
fi

# Function to build the application
build_app() {
    echo "📦 Building application..."
    npm run build
    echo "✅ Build completed successfully!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "☁️ Deploying to Vercel..."
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    vercel --prod
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    docker build -t pls-travels-dms .
    docker run -d -p 3000:3000 \
        --env-file .env.local \
        --name pls-travels-dms \
        pls-travels-dms
    echo "✅ Docker container started on port 3000"
}

# Function to deploy with Docker Compose
deploy_compose() {
    echo "🐳 Deploying with Docker Compose..."
    docker-compose up -d
    echo "✅ Application deployed with Docker Compose"
}

# Function to start production server
start_production() {
    echo "🚀 Starting production server..."
    npm run start
}

# Main deployment logic
case "${1:-help}" in
    "build")
        build_app
        ;;
    "vercel")
        build_app
        deploy_vercel
        ;;
    "docker")
        build_app
        deploy_docker
        ;;
    "compose")
        build_app
        deploy_compose
        ;;
    "start")
        start_production
        ;;
    "all")
        build_app
        deploy_compose
        ;;
    "help"|*)
        echo "Usage: $0 [build|vercel|docker|compose|start|all]"
        echo ""
        echo "Commands:"
        echo "  build   - Build the application"
        echo "  vercel  - Deploy to Vercel"
        echo "  docker  - Deploy with Docker"
        echo "  compose - Deploy with Docker Compose"
        echo "  start   - Start production server"
        echo "  all     - Build and deploy with Docker Compose"
        echo ""
        echo "Environment Setup:"
        echo "  Make sure .env.local exists with required variables"
        echo "  Required variables:"
        echo "    NEXT_PUBLIC_SUPABASE_URL"
        echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "    NEXT_PUBLIC_APP_NAME"
        ;;
esac
