@echo off
REM ============================================================
REM  Hotel del Golfo - Sito Web - avvio in locale
REM  Lancia "npm run dev" (next dev --webpack) sulla porta 3000
REM ============================================================

cd /d "%~dp0"

echo.
echo === Hotel del Golfo - Sito Web (locale) ===
echo Cartella: %CD%
echo.

REM Verifica che esista .env.local (variabili Sanity/Stripe/ecc.)
if not exist ".env.local" (
    echo [ATTENZIONE] File .env.local non trovato.
    echo Copialo da .env.local.example e compila le variabili prima di continuare.
    echo.
    pause
    exit /b 1
)

REM Installa le dipendenze solo se manca node_modules
if not exist "node_modules" (
    echo node_modules non trovato: eseguo "npm install"...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERRORE] npm install fallito.
        pause
        exit /b 1
    )
)

echo Avvio del server di sviluppo su http://localhost:3000
echo (Sanity Studio: http://localhost:3000/studio)
echo Premi CTRL+C per fermare il server.
echo.

REM Apre il browser dopo qualche secondo, senza bloccare l'avvio del server
start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:3000"

call npm run dev

echo.
echo === Server sito fermato ===
pause
