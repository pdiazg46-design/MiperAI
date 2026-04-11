@echo off
title MIPER SaaS Piloto
echo.
echo =======================================================
echo       INICIANDO PLATAFORMA MIPER B2B (Asistente IA)
echo =======================================================
echo.
echo El servidor se esta encendiendo de manera local...
echo Tu navegador se abrira automaticamente en un momento.
echo Si ves una pantalla blanca o un error, dale F5 para recargar.
echo.
start http://localhost:3000
call npm run dev
pause
