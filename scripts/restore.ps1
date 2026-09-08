param([Parameter(Mandatory=$true)][string]$DatabaseDump,[Parameter(Mandatory=$true)][string]$MediaArchive)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $DatabaseDump) -or -not (Test-Path -LiteralPath $MediaArchive)) { throw 'Backup files do not exist.' }
Write-Warning 'Restore is intended for a new or isolated environment. Existing data may be replaced.'
Get-Content -AsByteStream -Raw -LiteralPath $DatabaseDump | docker compose exec -T postgres pg_restore -U nha -d nha_dpams --clean --if-exists
Expand-Archive -LiteralPath $MediaArchive -DestinationPath (Join-Path $PSScriptRoot '..\storage') -Force
