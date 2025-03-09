@echo off

echo Replacing /data/audio with the current working directory + /assets/audio in initdb_bat_local.sql...
set "current_dir=%cd%"
set "search=/data/audio/"
set "replace=%current_dir:/=\%\assets\audio\"
powershell -Command "(Get-Content assets\initdb_bat.sql) -replace [regex]::Escape('%search%'), '%replace%' | Set-Content assets\initdb_bat_local.sql"

echo Checking if PostgreSQL is installed...
if exist "C:\Program Files\PostgreSQL\16\bin\" (
  echo PostgreSQL found at C:\Program Files\PostgreSQL\16\bin\.
  goto database_setup
)

set installer_url="https://sbp.enterprisedb.com/getfile.jsp?fileid=1259408"
set installer_path="./postgresql-16.8-1-windows-x64.exe"
set exe_name="postgresql-16.8-1-windows-x64.exe"

if not exist %installer_path% (
  echo Downloading postgres installer...
  curl -L -o %installer_path% %installer_url%
) else (
  echo Installer already exists.
)

echo Running the installer...
start /wait %installer_path% %exe_name%
echo Installation completed.

:database_setup


REM start /wait powershell -Command "Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit', '-ExecutionPolicy Bypass', '-File', './install_winget.ps1' -Verb RunAs"

start /wait powershell -ExecutionPolicy Bypass -File "./install_winget.ps1"

echo | set /p dummy="Refreshing environment variables from registry for cmd.exe. Please wait..."

goto main

:: Set one environment variable from registry key
:SetFromReg
    "%WinDir%\System32\Reg" QUERY "%~1" /v "%~2" > "%TEMP%\_envset.tmp" 2>NUL
    for /f "usebackq skip=2 tokens=2,*" %%A IN ("%TEMP%\_envset.tmp") do (
        echo/set "%~3=%%B"
    )
    goto :EOF

:: Get a list of environment variables from registry
:GetRegEnv
    "%WinDir%\System32\Reg" QUERY "%~1" > "%TEMP%\_envget.tmp"
    for /f "usebackq skip=2" %%A IN ("%TEMP%\_envget.tmp") do (
        if /I not "%%~A"=="Path" (
            call :SetFromReg "%~1" "%%~A" "%%~A"
        )
    )
    goto :EOF

:main
    echo/@echo off >"%TEMP%\_env.cmd"

    :: Slowly generating final file
    call :GetRegEnv "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" >> "%TEMP%\_env.cmd"
    call :GetRegEnv "HKCU\Environment">>"%TEMP%\_env.cmd" >> "%TEMP%\_env.cmd"

    :: Special handling for PATH - mix both User and System
    call :SetFromReg "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" Path Path_HKLM >> "%TEMP%\_env.cmd"
    call :SetFromReg "HKCU\Environment" Path Path_HKCU >> "%TEMP%\_env.cmd"

    :: Caution: do not insert space-chars before >> redirection sign
    echo/set "Path=%%Path_HKLM%%;%%Path_HKCU%%" >> "%TEMP%\_env.cmd"

    :: Cleanup
    del /f /q "%TEMP%\_envset.tmp" 2>nul
    del /f /q "%TEMP%\_envget.tmp" 2>nul

    :: capture user / architecture
    SET "OriginalUserName=%USERNAME%"
    SET "OriginalArchitecture=%PROCESSOR_ARCHITECTURE%"

    :: Set these variables
    call "%TEMP%\_env.cmd"

    :: Cleanup
    del /f /q "%TEMP%\_env.cmd" 2>nul

    :: reset user / architecture
    SET "USERNAME=%OriginalUserName%"
    SET "PROCESSOR_ARCHITECTURE=%OriginalArchitecture%"

    echo | set /p dummy="Finished."
    echo .

echo Setting up the database...
setlocal
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin
set PGDATA=C:\Program Files\PostgreSQL\16\data
set PGDATABASE=postgres
set PGUSER=postgres
set PGPASSWORD=csengo
set PGPORT=5582

echo Replacing /data/audio with the current working directory + /assets/audio in initdb_bat_local.sql...
set "current_dir=%cd%"
set "search=/data/audio/"
set "replace=%current_dir:/=\%\assets\audio\"
powershell -Command "(Get-Content assets\initdb_bat.sql) -replace [regex]::Escape('%search%'), '%replace%' | Set-Content assets\initdb_bat_local.sql"

echo Connecting to the PostgreSQL database...
echo Using username: %PGUSER%
echo Using database: %PGDATABASE%

psql --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo psql not found. Please run this file again, and install PostgreSQL.
  pause
  exit
)

psql -U %PGUSER% -d %PGDATABASE% -c "DROP DATABASE IF EXISTS csengo WITH (FORCE);"
psql -U %PGUSER% -d %PGDATABASE% -f assets\initdb_bat_local.sql

echo Done setting up the database.
endlocal

:: echo Starting the client...
:: cd "./csengo-ts-client-v2"
:: echo Setting up .env file...
:: copy .env.example .env
:: echo Installing dependencies...
:: call npm install
:: echo Starting the client in dev mode...
:: npm run dev

start cmd /k "echo Starting the client... & cd ./csengo-ts-client-v2 & echo Setting up .env file... & copy .env.example .env & echo Installing dependencies... & call npm install & echo Starting the client in dev mode... & npm run dev"

:: echo Starting the server...
:: cd "./csengo-ts-server-v2"
:: echo Setting up .env file...
:: copy .env.example .env
:: echo Installing dependencies...
:: call npm install
:: echo Migrating prisma schema...
:: call npm run prisma:update:prod
:: echo Starting the server...
:: npm run start:dev

start cmd /k "echo Starting the server... & cd ./csengo-ts-server-v2 & echo Setting up .env file... & copy .env.example .env & echo Installing dependencies... & call npm install & echo Migrating prisma schema... & call npm run prisma:update:prod & echo Starting the server... & npm run start:dev"

echo The website will be available at http://localhost:3000
echo Swagger UI will be available at http://localhost:3300/swagger
echo The API will be available at http://localhost:3300

echo Waiting 20 seconds for the application to start...

timeout /t 20 >nul
echo Opening the website and Swagger UI in the default browser...
start http://localhost:3300/swagger
timeout /t 1 >nul
start http://localhost:3000

echo You can safely close this window now.
pause
