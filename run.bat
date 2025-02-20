@echo off

echo Checking for Docker Desktop registry key...
REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Docker Inc." >nul 2>&1

if %ERRORLEVEL% EQU 0 (
  echo Docker Desktop registry key found: HKEY_LOCAL_MACHINE\SOFTWARE\Docker Inc.
  echo Checking if Docker Desktop is running...
  echo Starting Docker Desktop...
  start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  echo Docker Desktop started.
) else (
  echo Docker Desktop registry key not found.
  echo Please install Docker Desktop via "https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-win-amd64"
  pause
  exit
  set is_docker_not_installed=true
)

:: set docker_installer_url="https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-win-amd64"
:: set docker_installer_path="./Docker Desktop Installer.exe"
:: set docker_installer_exe="Docker Desktop Installer.exe"
::
:: if defined is_docker_not_installed (
::   if not exist %docker_installer_path% (
::     echo Downloading Docker Desktop installer...
::     curl -L -o %docker_installer_path% %docker_installer_url%
::     pause
::   ) else (
::     echo Docker Desktop installer already exists.
::   )
::
::   echo Running the Docker Desktop installer...
::   start /w %docker_installer_path% %docker_installer_exe% install --accept-license
::   echo Installation completed.
:: )


:wait_for_docker_after_install
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Docker Desktop is not yet running, waiting...
  timeout /t 5 >nul
  goto wait_for_docker_after_install
)
echo Docker Desktop started.

echo Starting Docker Compose and the build process...
docker-compose -f docker-compose.dev.v2.yml up -d

echo Docker Compose started.

echo The website is available at http://localhost:8080
echo Swagger UI is available at http://localhost:3300/swagger
echo The API is available at http://localhost:3300

echo Waiting 6 seconds for the website and Swagger UI to start...

timeout /t 6 >nul
echo Opening the website and Swagger UI in the default browser...
start http://localhost:3300/swagger
timeout /t 1 >nul
start http://localhost:8080

echo You can safely close this window now.
pause