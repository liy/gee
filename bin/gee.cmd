@echo off
setlocal
set ELECTRON_NO_ATTACH_CONSOLE=1
"%~dp0..\..\gee.exe" %*
endlocal
