$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$bin = Join-Path $root '.runtime\postgresql\pgsql\bin'
$backup = Join-Path $root '.runtime\restore-test.dump'
& (Join-Path $bin 'pg_dump.exe') -h 127.0.0.1 -p 55432 -U postgres -Fc -f $backup nha_dpams
& (Join-Path $bin 'dropdb.exe') -h 127.0.0.1 -p 55432 -U postgres --if-exists nha_dpams_restore_test
& (Join-Path $bin 'createdb.exe') -h 127.0.0.1 -p 55432 -U postgres nha_dpams_restore_test
& (Join-Path $bin 'pg_restore.exe') -h 127.0.0.1 -p 55432 -U postgres -d nha_dpams_restore_test $backup
$source = & (Join-Path $bin 'psql.exe') -h 127.0.0.1 -p 55432 -U postgres -d nha_dpams -tAc 'SELECT count(*) FROM users'
$restored = & (Join-Path $bin 'psql.exe') -h 127.0.0.1 -p 55432 -U postgres -d nha_dpams_restore_test -tAc 'SELECT count(*) FROM users'
if ($source -ne $restored) { throw "Restore verification failed: source=$source restored=$restored" }
& (Join-Path $bin 'dropdb.exe') -h 127.0.0.1 -p 55432 -U postgres nha_dpams_restore_test
Write-Output "Restore verified successfully with $restored user records."
