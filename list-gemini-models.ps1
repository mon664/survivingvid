$apiKey = "AIzaSyCNtAw24x9ku6LssRakV70R3XmgH5Qu1fU"
$uri = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get
    Write-Host "사용 가능한 모델 목록:" -ForegroundColor Green
    foreach ($model in $response.models) {
        Write-Host "  - $($model.name)"
    }
} catch {
    Write-Host "모델 목록 조회 실패!" -ForegroundColor Red
    Write-Host "오류: $($_.Exception.Message)"
}
