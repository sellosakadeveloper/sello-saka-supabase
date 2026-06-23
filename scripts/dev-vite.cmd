@echo off
setlocal

set "PNPM_CJS=%USERPROFILE%\AppData\Local\node\corepack\v1\pnpm\10.11.1\bin\pnpm.cjs"

if not exist "%PNPM_CJS%" (
  echo pnpm runtime not found at "%PNPM_CJS%"
  exit /b 1
)

node "%PNPM_CJS%" dev:vite
