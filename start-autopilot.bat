@echo off
REM Project Autopilot Windows Launcher
REM This script checks dependencies and starts Project Autopilot

setlocal enabledelayedexpansion

echo.
echo ============================================
echo  PROJECT AUTOPILOT LAUNCHER
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check Node version
for /f "tokens=*" %%A in ('node --version') do set NODE_VERSION=%%A
echo Node version: %NODE_VERSION%

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    echo.
    pause
    exit /b 1
)

echo.
echo Checking Project Autopilot installation...
echo.

REM Run doctor checks
call npm run doctor
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup required. Running setup...
    echo.
    call npm run setup
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Setup failed
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Starting Project Autopilot...
echo.

REM Start the application
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start Project Autopilot
    echo.
    pause
    exit /b 1
)
