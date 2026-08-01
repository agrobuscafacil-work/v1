$logFile = "$env:TEMP\backend-log.txt"
$process = Start-Process -NoNewWindow -FilePath "node.exe" -ArgumentList "dist/src/main" -WorkingDirectory "C:\Users\jefer\OneDrive\Documentos\Default Project\AgroBuscaFacil_v2\backend" -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru
Write-Output "Backend started with PID $($process.Id)"
