$apiKey = "AIzaSyCNtAw24x9ku6LssRakV70R3XmgH5Qu1fU"
$uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey"
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "안녕하세요! 짧게 인사해주세요."
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "=== Gemini 2.5 Flash API 테스트 ===" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    Write-Host "✓ API 테스트 성공!" -ForegroundColor Green
    Write-Host ""
    Write-Host "응답:" -ForegroundColor Yellow
    Write-Host $response.candidates[0].content.parts[0].text
} catch {
    Write-Host "✗ API 테스트 실패!" -ForegroundColor Red
    Write-Host "상태 코드: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "오류 메시지: $($_.Exception.Message)" -ForegroundColor Red
}
