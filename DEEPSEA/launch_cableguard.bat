@echo off
echo 🔌 CableGuard AI - Windows Launcher
echo ================================

cd /d "%~dp0cursor"
if not exist "main.py" (
    echo ❌ Error: main.py not found in cursor directory
    echo Please ensure this script is in the DEEPSEA folder
    pause
    exit /b 1
)

echo 📁 Current directory: %CD%
echo 🚀 Launching CableGuard AI...
python main.py

pause 