param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
$target = [System.IO.Path]::GetFullPath($Destination)
New-Item -ItemType Directory -Force -Path $target | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
docker compose exec -T postgres pg_dump -U nha -Fc nha_dpams | Set-Content -AsByteStream -LiteralPath (Join-Path $target "database-$stamp.dump")
Compress-Archive -Path (Join-Path $PSScriptRoot '..\storage\photos'),(Join-Path $PSScriptRoot '..\storage\thumbnails'),(Join-Path $PSScriptRoot '..\storage\originals') -DestinationPath (Join-Path $target "media-$stamp.zip")
Write-Output "Backup created at $target"
