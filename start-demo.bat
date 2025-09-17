@echo off
echo 🚀 Starting Pramaan Demo Environment...
echo.

echo Step 1: Checking if contract is deployed...
cd blockchain
if not exist "deployments\mumbai.json" (
    echo ❌ Contract not deployed yet!
    echo Please run: npm run deploy:mumbai
    pause
    exit /b 1
)

echo ✅ Contract deployment found
echo.

echo Step 2: Starting AI Service...
start "Pramaan AI" cmd /k "cd /d %~dp0ai && python app.py"
timeout /t 3 /nobreak >nul

echo Step 3: Starting Backend Service...
start "Pramaan Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Step 4: Starting Frontend Service...
start "Pramaan Frontend" cmd /k "cd /d %~dp0frontend-app && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo 🎉 All services starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:4000  
echo 🤖 AI API:   http://localhost:5001
echo.
echo 💡 Tip: Wait 10-15 seconds for all services to fully start
echo.

choice /c YN /m "Open browser to frontend"
if errorlevel 2 goto :end
start http://localhost:5173

:end
echo.
echo 🏆 Ready for hackathon demo!
echo 📖 Check DEPLOYMENT_GUIDE.md for demo flow
pause
