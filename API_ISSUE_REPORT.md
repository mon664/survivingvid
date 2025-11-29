SurvivingVid Gemini API 문제 해결 보고서
==========================================

## 현재 상태
✅ 코드 수정 완료
✅ Git Push 완료 (커밋: a71e1c3)
❌ API 키 권한 문제 발견

## 수정 내역
1. 모델 업데이트: gemini-1.5-flash → gemini-2.5-flash
2. 인증 방식 변경: 헤더(x-goog-api-key) → Query Parameter(?key=)

## 발견된 문제
상태 코드: 403 Forbidden
원인: API 키 권한 부족 또는 잘못된 키

## 해결 방법

### 옵션 1: Google Cloud Console에서 새 API 키 생성
1. https://console.cloud.google.com/apis/credentials?project=zicpan 접속
2. "Create Credentials" → "API Key" 클릭
3. 생성된 키 복사
4. (선택) API restrictions에서 "Generative Language API" 제한 설정

### 옵션 2: 기존 API 키 권한 확인
1. https://console.cloud.google.com/apis/credentials?project=zicpan 접속
2. API Key 목록에서 AIzaSyCNtAw24x9ku6LssRakV70R3XmgH5Qu1fU 찾기
3. Edit → API restrictions 확인
4. "Generative Language API" 활성화 확인

### 옵션 3: Generative Language API 활성화 확인
1. https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=zicpan
2. "ENABLE" 버튼 클릭 (이미 활성화되어 있으면 "MANAGE" 표시됨)

## 다음 단계
1. Google Cloud Console에서 API 키 확인/재생성
2. .env.local 업데이트
3. Vercel 환경변수 업데이트:
   - https://vercel.com/mon664/survivingvid/settings/environment-variables
   - GEMINI_API_KEY 값 업데이트
4. Vercel 재배포
5. 테스트: https://survivingvid.vercel.app

## 테스트 스크립트
로컬 테스트: .\test-gemini-2.5-flash.ps1
모델 목록: .\list-gemini-models.ps1

## 참고
- 프로젝트: zicpan
- Region: us-central1
- 사용 가능한 크레딧: 약 $300
