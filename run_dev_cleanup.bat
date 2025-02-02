@echo off

echo Deleting PostgreSQL...
start /wait "" "C:\Program Files\PostgreSQL\16\uninstall-postgresql.exe"
echo After uninstallation is complete
pause

echo Deleting PostgreSQL data directory...
rmdir /s /q "C:\Program Files\PostgreSQL\16\data"
echo PostgreSQL data directory deleted.

echo You can safely close this window now.
pause

