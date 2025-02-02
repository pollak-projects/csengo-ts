@echo off

echo Shutting down Docker Compose...
docker-compose -f docker-compose.dev.v2.yml down --rmi all -v
echo Docker Compose shut down.

echo You can safely close this window now.
pause