@echo off
echo 🔍 Checking all Pramaan services...
echo.

echo Checking AI Service (Port 5001)...
curl -s http://localhost:5001/ai/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ AI Service is running
) else (
    echo ❌ AI Service is not running
)

echo.
echo Checking Backend Service (Port 4000)...
curl -s http://localhost:4000/verify/test >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend Service is running
) else (
    echo ❌ Backend Service is not running
)

echo.
echo Checking Frontend Service (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend Service is running
) else (
    echo ❌ Frontend Service is not running
)

echo.
echo 🌐 Open your browser to: http://localhost:5173
echo 📚 Check deployment guide: DEPLOYMENT_GUIDE.md
pause
