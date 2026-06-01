# Hot-reload dev stack (frontend: http://localhost:3001)
# Build one service at a time to avoid Docker Desktop BuildKit crashes on Windows.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Building backend..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml build backend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building frontend..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml build frontend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting services..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
