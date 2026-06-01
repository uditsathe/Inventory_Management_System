@echo off
cd /d "%~dp0"
echo Building backend...
docker compose -f docker-compose.yml -f docker-compose.dev.yml build backend
if errorlevel 1 exit /b 1
echo Building frontend...
docker compose -f docker-compose.yml -f docker-compose.dev.yml build frontend
if errorlevel 1 exit /b 1
echo Starting services...
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
