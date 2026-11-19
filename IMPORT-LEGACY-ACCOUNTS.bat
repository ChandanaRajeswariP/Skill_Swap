@echo off
setlocal
if "%~1"=="" (
  echo Drag the old app\server\data\db.json onto this file.
  pause
  exit /b 1
)
cd /d "%~dp0Skill_exchange-backend\backend"
"..\runtime\node\node.exe" --env-file=.env scripts\import-legacy.mjs "%~f1"
set "status=%errorlevel%"
pause
exit /b %status%
