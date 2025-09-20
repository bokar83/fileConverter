@echo off
echo 🚀 Setting up SnapConvert...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create environment files if they don't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
)

if not exist backend\.env (
    echo 📝 Creating backend\.env file...
    copy backend\env.example backend\.env
)

if not exist frontend\.env (
    echo 📝 Creating frontend\.env file...
    copy frontend\env.example frontend\.env
)

REM Create temp directory
echo 📁 Creating temp directory...
if not exist tmp mkdir tmp

echo ✅ Setup complete!
echo.
echo To start the development servers:
echo   npm run dev
echo.
echo To start with Docker:
echo   docker-compose up --build
echo.
echo Make sure to install system dependencies:
echo   Windows: Download LibreOffice and Poppler from their official websites



