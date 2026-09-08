$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runtime = Join-Path $root '.runtime'
$archive = Join-Path $runtime 'postgresql-16.15.zip'
$postgres = Join-Path $runtime 'postgresql\pgsql'
$data = Join-Path $runtime 'pgdata'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
if (-not (Test-Path -LiteralPath (Join-Path $postgres 'bin\postgres.exe'))) {
  if (-not (Test-Path -LiteralPath $archive)) { Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-16.15-1-windows-x64-binaries.zip' -OutFile $archive }
  Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $runtime 'postgresql') -Force
}
if (-not (Test-Path -LiteralPath (Join-Path $data 'PG_VERSION'))) { & (Join-Path $postgres 'bin\initdb.exe') -D $data -U postgres -A trust --encoding=UTF8 }
$ready = & (Join-Path $postgres 'bin\pg_isready.exe') -h 127.0.0.1 -p 55432 2>$null
if ($LASTEXITCODE -ne 0) { & (Join-Path $postgres 'bin\pg_ctl.exe') -D $data -l (Join-Path $runtime 'postgres.log') -o '-p 55432 -h 127.0.0.1' start }
& (Join-Path $postgres 'bin\psql.exe') -h 127.0.0.1 -p 55432 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='nha_dpams'" | ForEach-Object { $exists = $_ }
if ($exists -ne '1') { & (Join-Path $postgres 'bin\createdb.exe') -h 127.0.0.1 -p 55432 -U postgres nha_dpams }
Write-Output 'PostgreSQL is ready at postgresql://postgres@127.0.0.1:55432/nha_dpams?schema=public'
