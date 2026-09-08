$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$control = Join-Path $root '.runtime\postgresql\pgsql\bin\pg_ctl.exe'
$data = Join-Path $root '.runtime\pgdata'
if ((Test-Path -LiteralPath $control) -and (Test-Path -LiteralPath (Join-Path $data 'postmaster.pid'))) { & $control -D $data stop -m fast }
