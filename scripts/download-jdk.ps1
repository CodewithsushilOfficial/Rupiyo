$jdksDir = "C:\Users\codew\.jdks"
if (!(Test-Path -Path $jdksDir)) {
    New-Item -ItemType Directory -Path $jdksDir -Force
}

$zipPath = "$jdksDir\jdk21.zip"
$extractPath = "$jdksDir\jdk-21-extract"
$targetPath = "$jdksDir\jdk-21"

Write-Host "Downloading Temurin JDK 21..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
(New-Object System.Net.WebClient).DownloadFile("https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.6_7.zip", $zipPath)

Write-Host "Extracting JDK 21..."
if (Test-Path -Path $extractPath) { Remove-Item -Recurse -Force $extractPath }
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
Remove-Item -Force $zipPath

$innerFolder = Get-ChildItem -Path $extractPath | Select-Object -First 1
if (Test-Path -Path $targetPath) { Remove-Item -Recurse -Force $targetPath }
Move-Item -Path $innerFolder.FullName -Destination $targetPath -Force
Remove-Item -Recurse -Force $extractPath

Write-Host "JDK 21 successfully installed at: $targetPath"
