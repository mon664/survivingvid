$apiKey = "AIzaSyCNtAw24x9ku6LssRakV70R3XmgH5Qu1fU"
$uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Say hello in Korean"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    Write-Host "✓ API 테스트 성공!" -ForegroundColor Green
    Write-Host "응답: $($response.candidates[0].content.parts[0].text)"
} catch {
    Write-Host "✗ API 테스트 실패!" -ForegroundColor Red
    Write-Host "상태 코드: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "오류 메시지: $($_.Exception.Message)"
}
