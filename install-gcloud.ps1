# Google Cloud SDK 설치 스크립트

Write-Host "=== Google Cloud SDK 설치 중 ===" -ForegroundColor Cyan

# 다운로드 URL
$installerUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = "$env:TEMP\GoogleCloudSDKInstaller.exe"

try {
    # 다운로드
    Write-Host "1. Installer 다운로드 중..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    
    # 설치 실행
    Write-Host "2. 설치 시작..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host "✓ 설치 완료!" -ForegroundColor Green
    Write-Host ""
    Write-Host "다음 명령어를 실행하여 인증하세요:" -ForegroundColor Cyan
    Write-Host "gcloud auth login" -ForegroundColor Yellow
    Write-Host "gcloud config set project zicpan" -ForegroundColor Yellow
    
} catch {
    Write-Host "✗ 설치 실패: $($_.Exception.Message)" -ForegroundColor Red
}
