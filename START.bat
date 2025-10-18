@echo off
set NODE_OPTIONS=--openssl-legacy-provider


rem Rulăm npm run dev într-o fereastră nouă de comandă
start %windir%\system32\cmd.exe /k yarn dev
rem Verificăm dacă există deja o fereastră activă de comandă pentru PM2



rem Așteptăm câteva secunde (adjust the timeout value if needed)
timeout /t 10

rem Deschidem Chrome cu URL-ul specificat
start chrome http://localhost:3000/

rem Așteptăm o secundă pentru a se asigura că celelalte ferestre s-au deschis complet
timeout /t 1

rem Închidem ferestrele cmd care nu au procese deschise
tasklist | find /i "cmd.exe" | find /i /v "tasklist.exe" | find /i /v "pm2 start" | find /i /v "pm2 monit" | find /i /v "npm run dev" | find /i /v "find.exe" | find /i /v "timeout.exe" | find /i /v "start.exe" > nul
if %errorlevel% equ 0 (
    taskkill /f /im cmd.exe
)
