#!/bin/bash

# SnapConvert Setup Script
echo "🚀 Setting up SnapConvert..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env file..."
    cp frontend/env.example frontend/.env
fi

# Create temp directory
echo "📁 Creating temp directory..."
mkdir -p tmp

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "To start with Docker:"
echo "  docker-compose up --build"
echo ""
echo "Make sure to install system dependencies:"
echo "  Ubuntu/Debian: sudo apt-get install libreoffice poppler-utils"
echo "  macOS: brew install libreoffice poppler"



