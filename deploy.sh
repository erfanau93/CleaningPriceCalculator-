#!/bin/bash

# Deployment script for Cleaning Price Calculator
echo "🚀 Starting deployment preparation..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your DATABASE_URL"
    echo "   You can copy from .env.example as a starting point"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your app is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Follow the instructions in DEPLOYMENT.md"
    echo "3. Set up your database on Neon"
    echo "4. Deploy on Render"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 