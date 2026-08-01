param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AgroBuscaFacil - Dependency Manager" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check outdated packages
Write-Host "[1/3] Checking outdated packages..." -ForegroundColor Yellow

$raw = npm outdated --json 2>$null
if (-not $raw) {
  Write-Host "  All packages are up to date!" -ForegroundColor Green
  if (-not $Apply) { exit 0 }
}
$outdated = $raw | ConvertFrom-Json
$names = $outdated | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name

if ($names.Count -eq 0) {
  Write-Host "  All packages are up to date!" -ForegroundColor Green
  if (-not $Apply) { exit 0 }
}

Write-Host "  Found $($names.Count) outdated package(s):" -ForegroundColor Yellow
Write-Host ""
foreach ($pkg in $names) {
  $info = $outdated.$pkg
  Write-Host ("{0,-30} {1,-15} {2,-15} {3,-15}" -f $pkg, $info.current, $info.wanted, $info.latest)
}
Write-Host ""

if (-not $Apply) {
  Write-Host "NOTE: Run with -Apply to update all dependencies to latest." -ForegroundColor Cyan
  Write-Host "  .\scripts\update-deps.ps1 -Apply" -ForegroundColor Cyan
  exit 0
}

# Step 2: Install and use npm-check-updates
Write-Host "[2/3] Installing npm-check-updates..." -ForegroundColor Yellow
npx -y npm-check-updates@latest --upgrade --packageFile "$projectRoot\package.json" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "  npm-check-updates failed." -ForegroundColor Red
  exit 1
}
Write-Host "  package.json updated." -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Installing updated packages..." -ForegroundColor Yellow
npm install 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "  npm install failed." -ForegroundColor Red
  exit 1
}
Write-Host "  All packages installed." -ForegroundColor Green

# Show remaining outdated
Write-Host ""
$raw2 = npm outdated --json 2>$null
$remNames = @()
if ($raw2) {
  $remaining = $raw2 | ConvertFrom-Json
  $remNames = $remaining | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
}
if ($remNames.Count -gt 0) {
  Write-Host "  Warning: $($remNames.Count) package(s) still outdated (peer dep constraints):" -ForegroundColor Yellow
  foreach ($pkg in $remNames) {
    $info = $remaining.$pkg
    Write-Host "    $pkg ($($info.current) -> $($info.latest))" -ForegroundColor Yellow
  }
} else {
  Write-Host "  All packages are up to date!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Done! Run 'npm run build' to verify." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
