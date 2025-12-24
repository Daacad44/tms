# Travel Management System - Quick Fix & Setup Script

Write-Host "🔧 TMS Quick Fix & Setup" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Backend Setup
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow

Set-Location -Path "backend"

# Create .env if not exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Green
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created - Please edit with your PostgreSQL credentials`n" -ForegroundColor Green
} else {
    Write-Host ".env already exists`n" -ForegroundColor Gray
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Green
npm install

# Run Prisma setup
Write-Host "`nSetting up database..." -ForegroundColor Green
npx prisma generate
npx prisma migrate dev --name init

# Seed database
Write-Host "`nSeeding database..." -ForegroundColor Green
npm run prisma:seed

Write-Host "`n✅ Backend setup complete!" -ForegroundColor Green

# Move to root
Set-Location -Path ".."

# Frontend Setup
Write-Host "`n📦 Setting up Frontend..." -ForegroundColor Yellow

Set-Location -Path "frontend"

# Remove node_modules and package-lock if they exist
if (Test-Path "node_modules") {
    Write-Host "Cleaning old node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Host "Cleaning old package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json"
}

# Install frontend dependencies with legacy peer deps
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "`n✅ Frontend setup complete!" -ForegroundColor Green

# Move back to root
Set-Location -Path ".."

# Summary
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend/.env with your PostgreSQL credentials" -ForegroundColor White
Write-Host "2. Start backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "`n🔐 Test Credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin@tms.com / Admin@123" -ForegroundColor White
Write-Host "Agent: agent@tms.com / Agent@123" -ForegroundColor White
Write-Host "Customer: customer@example.com / Customer@123`n" -ForegroundColor White
