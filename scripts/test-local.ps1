param(
    [Parameter(Mandatory = $true)]
    [string]$SeedPassword,
    [string]$PnpmCommand = 'pnpm'
)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
& (Join-Path $PSScriptRoot 'start-local-postgres.ps1')
$env:DATABASE_URL = 'postgresql://postgres@127.0.0.1:55432/nha_dpams?schema=public'
$env:SEED_USER_PASSWORD = $SeedPassword
$env:STORAGE_PATH = Join-Path $root '.runtime\test-storage'
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:JWT_REFRESH_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:SESSION_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:FRONTEND_URL = 'http://localhost:3000'
$env:NODE_ENV = 'test'
$env:CI = 'true'
if (-not (Get-Command $PnpmCommand -ErrorAction SilentlyContinue)) { throw 'pnpm is not available. Install Node.js 22+ and pnpm 11+, or pass -PnpmCommand with the pnpm executable path.' }
function Invoke-PnpmStep {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  & $PnpmCommand @Arguments
  if ($LASTEXITCODE -ne 0) { throw "pnpm step failed (exit $LASTEXITCODE): $($Arguments -join ' ')" }
}
Set-Location $root
Invoke-PnpmStep prisma:generate
Invoke-PnpmStep --filter '@nha/backend' prisma:migrate
Invoke-PnpmStep --filter '@nha/backend' prisma:seed
Invoke-PnpmStep --filter '@nha/backend' test
Invoke-PnpmStep --filter '@nha/backend' test:e2e
Invoke-PnpmStep --filter '@nha/backend' build
Invoke-PnpmStep --filter '@nha/frontend' build
