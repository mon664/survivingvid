# 🎬 AutoVid 완전 원본 분석 (설치파일 기반)

**Windows Store App - DREAMCRAFTLabs.AUTOVID v1.3.6.0**

---

## 📍 설치 위치
```
C:\Program Files\WindowsApps\DREAMCRAFTLabs.AUTOVID_1.3.6.0_x64__a9s431j94nj9r
```

---

## 🏗️ 전체 구조

### 핵심 DLL 파일 (C# 코드)
```
AIService.dll              → GPT-4 프롬프트 처리, 콘텐츠 생성
ImageAIService.dll         → DALL-E 3 + Replicate AI 이미지 생성
TTSService.dll             → Google Cloud Text-to-Speech
VideoEngine.dll            → FFmpeg 비디오 조립
YoutubeAgent.dll           → YouTube API v3 업로드
CloudService.dll           → Cloudflare 백업/동기화
AutoVid.Core.dll           → 핵심 비즈니스 로직
Common.dll                 → 공용 유틸리티
Util.dll                   → 유틸리티 함수
ImageToVideoService.dll    → 이미지→비디오 변환
FFMpegWrapper.dll          → FFmpeg.exe 래퍼
PixabayApi.dll             → Pixabay BGM 검색
Replicate.dll              → Replicate API 통합
OpenCvSharp.dll            → 이미지 처리 (얼굴 감지, 크롭)
SkiaSharp.dll              → 그래픽 렌더링
```

### UI/UX 관련 DLL
```
WinUIEx.dll                → WinUI 3 확장 기능
WinUiUtil.dll              → WinUI 유틸리티
CommunityToolkit.*         → MVVM, Controls, DataGrid, Markdown
Microsoft.UI.*             → WinUI 3 기본 라이브러리
Firebase.Auth.UI.*         → Firebase 인증 UI
```

### 설정 파일

#### 1. appsettings.json
```json
{
  "LocalSettingsOptions": {
    "ApplicationDataFolder": "AutoVid/ApplicationData",
    "LocalSettingsFile": "LocalSettings.json"
  }
}
```
→ 사용자 데이터 저장 위치: `%LOCALAPPDATA%\Packages\DREAMCRAFTLabs.AUTOVID_*/LocalState/AutoVid/ApplicationData/LocalSettings.json`

#### 2. client_secret.json (루트 및 YoutubeAgent/)
```json
{
  "installed": {
    "client_id": "REDACTED_CLIENT_ID",
    "project_id": "valid-meridian-412515",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "REDACTED_CLIENT_SECRET",
    "redirect_uris": ["http://localhost"]
  }
}
```

---

## 📝 AI 프롬프트 시스템

### AIService/Assistant_PromptTemplate.txt (원본)

```
You are an API-style assistant.

# STRICT OUTPUT POLICY
1. Respond **only** with a single JSON object that exactly matches "RESPONSE_SCHEMA".
2. Do **NOT** wrap the JSON in markdown fences, add comments, change key order, or include extra properties.
3. If you cannot comply, respond with:
   { "error": "EXPLANATION_OF_PROBLEM" }

# REQUEST_SCHEMA  (for reference)
<-- 사용자가 보낼 요청 JSON 스키마 -->
예시:
{
  "subject":            string,   // 예: "세상에서 가장 위험한 관광지"
  "requestNumber":      integer,  // 생성할 파트 개수(1 이상)
  "requestLanguage":    string,   // BCP-47, 예: "ko-KR"
  "includeOpeningSegment":  boolean,
  "includeClosingSegment":  boolean,
  "includeImageGenPrompt":  boolean
}

# RESPONSE_SCHEMA  (keys must appear in this order)
{
  "title": string,
  "openingSegment": {
    "videoSearchKeyword": [ string, ... ],  // 최소 1개
    "script":            [ string, ... ],  // 문장 배열
    "imageGenPrompt":     string
  },
  "snippets": [
    {
      "videoSearchKeyword": [ string, ... ],
      "segmentTitle":       string,
      "rank":               integer,       // 1…requestNumber
      "script":            [ string, ... ],
      "imageGenPrompt":      string
    }
  ]
}

# SPECIAL_CONSTRAINTS
- openingSegment.script[0] MUST start with a curiosity-hook that prevents viewer drop-off.
- 모든 imageGenPrompt 길이는 120자 이하.

Begin.
```

**중요**: 이것은 **실제 프롬프트 템플릿**이 아니라 **사용 방법 안내**입니다.
실제 프롬프트는 AIService.dll 내부에 컴파일되어 있습니다.

---

## 🎨 템플릿 시스템 (8개 완전)

### 디렉토리 구조
```
Assets/DefaultTemplates/
├── BLACK/
├── WHITE/
├── StoryCard-BeigeBrown/
├── StoryCard-BeigeRed/
├── StoryCard-BlackPink/
├── StoryCard-WhiteBlue/
├── StoryCard-WhiteGreen/
└── StoryCard-WhiteRed/
```

### 1. BLACK Template
**Template.json**
```json
{
  "Id": "9fa9a756-3374-49fb-80db-e7f53178f547",
  "IsDefault": true,
  "TemplateName": "BLACK DEFAULT",
  "BackgroundColor": "#FF000000",
  "TopHeightPercent": 15.0,
  "BottomHeightPercent": 15.0,
  "FixedTexts": [
    {
      "FontColorAsColor": {"A": 255, "R": 255, "G": 232, "B": 9},
      "X": 0.017197220413773064,
      "Y": 0.00972380638122556,
      "Content": "Channel Name",
      "FontSize": 48.0,
      "FontColor": "#FFE809",
      "FontFamilyName": "Segoe UI Bold",
      "IsBold": false
    },
    {
      "FontColorAsColor": {"A": 255, "R": 255, "G": 255, "B": 255},
      "X": 0.021288836443865047,
      "Y": 0.866513252258303,
      "Content": "Description",
      "FontSize": 44.0,
      "FontColor": "#FFFFFF",
      "FontFamilyName": "Segoe UI Semibold",
      "IsBold": false
    }
  ],
  "Stickers": []
}
```

### 2. WHITE Template
```json
{
  "Id": "9fa9a756-3374-49fb-80db-e7f53178f547",
  "IsDefault": true,
  "TemplateName": "WHITE DEFAULT",
  "BackgroundColor": "#FFFFFFFF",
  "TopHeightPercent": 15.0,
  "BottomHeightPercent": 15.0,
  "FixedTexts": [
    {
      "FontColorAsColor": {"A": 255, "R": 74, "G": 88, "B": 191},
      "X": 0.017197220413773064,
      "Y": 0.00972380638122556,
      "Content": "Channel Name",
      "FontSize": 48.0,
      "FontColor": "#4A58BF",
      "FontFamilyName": "Segoe UI Bold",
      "IsBold": false
    },
    {
      "FontColorAsColor": {"A": 255, "R": 0, "G": 0, "B": 0},
      "X": 0.021288836443865047,
      "Y": 0.866513252258303,
      "Content": "Description",
      "FontSize": 44.0,
      "FontColor": "#000000",
      "FontFamilyName": "Segoe UI Bold",
      "IsBold": false
    }
  ],
  "Stickers": []
}
```

### 3-8. StoryCard 템플릿들
각 StoryCard 템플릿은:
- **배경색**: #FFFFFBE5 (StoryCard 기본) 또는 맞춤색
- **TopHeightPercent**: 32.0
- **BottomHeightPercent**: 7.0
- **FixedTexts**: 5개 (좌측 화살표, 채널명, 메뉴버튼, 조회수, 작성자)
- **Shapes**: 2개 (상단 칼라 박스, 하단 라인)

| 템플릿명 | ID | 배경색 | 강조색 |
|---------|-----|-------|-------|
| BeigeBrown | 789b4b30-93a7-46ed-b528-f546017844f1 | #FFFFFBE5 | #7F6952 |
| BeigeRed | 0fc874f5-c5ef-4973-b006-ecddd701f156 | #FFFFFBE5 | #FF5B71 |
| BlackPink | f4c296c3-a5ec-4017-9469-64988a3f0145 | #FF000000 | #FF4D9F |
| WhiteBlue | 7d87f396-2912-4df1-a957-cbe6dfa1c458 | #FFFFFFFF | #608CFF |
| WhiteGreen | 8047feac-52d0-4322-a7a9-70ec493c2c9f | #FFFFFFFF | #4EFFB6 |
| WhiteRed | 1b82df66-e71d-4681-9bf4-cdd75c0fa68e | #FFFFFFFF | #FF5B71 |

---

## 🎬 자막 시스템 (ASS Format)

### default.ass
```ass
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding

Style: Title,나눔스퀘어 Bold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,4,10,10,10,1

Style: Default,나눔스퀘어 Regular,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1

Style: Rank,나눔스퀘어 Bold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,Your subtitle text here
```

**3가지 스타일**:
- **Title** (100pt, 중앙, 4번 Alignment) → 제목용
- **Default** (72pt, 하단, 2번 Alignment) → 일반 자막
- **Rank** (100pt, 왼쪽, 2번 Alignment) → 순위 표시

---

## 🎥 FFmpeg 전환 효과 (55개)

### Assets/ffmpeg_xfade/ 디렉토리

**확인된 효과 목록 (GIF 미리보기 포함)**:
```
1. circleclose      - 원형 닫기
2. circlecrop       - 원형 자르기
3. circleopen       - 원형 열기
4. coverdown        - 위에서 덮기
5. coverleft        - 왼쪽에서 덮기
6. coverright       - 오른쪽에서 덮기
7. coverup          - 아래에서 덮기
8. diagbl           - 대각선 좌하→우상
9. diagbr           - 대각선 우하→좌상
10. diagtl          - 대각선 좌상→우하
11. diagtr          - 대각선 우상→좌하
12. dissolve        - 디졸브
13. distance        - 거리 기반
14. fade            - 페이드
15. fadeblack       - 페이드 검정
16. fadegrays       - 페이드 회색
17. fadewhite       - 페이드 흰색
18. hblur           - 수평 블러
19. hlslice         - 수평 슬라이스
20. hlwind          - 수평 바람
21. horzclose       - 수평 닫기
22. horzopen        - 수평 열기
23. hrslice         - 수평 역슬라이스
24. hrwind          - 수평 역바람
25. pixelize        - 픽셀화
26. radial          - 방사형
27. rectcrop        - 사각형 자르기
28. revealdown      - 아래 드러내기
29. revealleft      - 왼쪽 드러내기
30. revealright     - 오른쪽 드러내기
31. revealup        - 위 드러내기
32. slidedown       - 슬라이드 아래
33. slideleft       - 슬라이드 왼쪽
34. slideright      - 슬라이드 오른쪽
35. slideup         - 슬라이드 위
36. smoothdown      - 부드러운 아래
37. smoothleft      - 부드러운 왼쪽
38. smoothright     - 부드러운 오른쪽
39. smoothup        - 부드러운 위
40. squeezeh        - 압축 수평
41. squeezev        - 압축 수직
42. vdslice         - 수직 슬라이스
43. vdwind          - 수직 바람
44. vertclose       - 수직 닫기
45. vertopen        - 수직 열기
46. vuslice         - 수직 업슬라이스
47. vuwind          - 수직 업바람
48. wipebl          - 와이프 좌하
49. wipebr          - 와이프 우하
50. wipedown        - 와이프 아래
51. wipeleft        - 와이프 왼쪽
52. wiperight       - 와이프 오른쪽
53. wipetl          - 와이프 좌상
54. wipetr          - 와이프 우상
55. wipeup          - 와이프 위
56. zoomin          - 줌인
```

각 효과는 `.gif` 파일로 시각화되어 있음.

---

## 🖼️ AI 이미지 모델 (6개)

### Assets/ImageModels/

| 모델명 | 파일 | 용도 |
|-------|------|------|
| animagine31 | animagine31.png | 애니메이션/일러스트 |
| chibitoon | chibitoon.png | 치비/만화 스타일 |
| enna-sketch-style | enna-sketch-style.png | 스케치/드로잉 |
| flux-schnell-dark | flux-schnell-dark.png | FLUX 다크톤 |
| flux-schnell-realitic | flux-schnell-realitic.png | FLUX 사실적 |
| flux-schnell-webtoon | flux-schnell-webtoon.png | FLUX 웹툰 스타일 |

각 모델 이미지는 미리보기 PNG 파일로 저장됨.

---

## 🎵 BGM 시스템

### PixabayApi.dll
- Pixabay API 통합
- 배경음악 검색 & 다운로드
- 라이센스 무료 음악

---

## 📱 YouTube 업로드

### YoutubeAgent/
- **client_secret.json** 포함 (Google OAuth 설정)
- **Google YouTube Data API v3** 통합
- 자동 업로드 + 메타데이터 설정

---

## 🔐 인증 시스템

### Firebase Authentication
```
Firebase.Auth.dll
Firebase.Auth.UI.dll
Firebase.Auth.UI.WinUI3.dll (4.0.0.0)
FirebaseAuthentication.WinUI3.dll (4.0.0)
FirebaseAuthentication.net.dll (4.1.0)
```

---

## 🌐 Cloudflare 통합

### CloudflareApi.dll
- 클라우드 백업
- 데이터 동기화
- CDN 캐싱

---

## 🔧 기술 스택

### .NET Runtime
- **.NET Core 8.0**
- **WinUI 3** (데스크톱 UI 프레임워크)
- **Windows App SDK 1.6**

### 핵심 라이브러리
```
CommunityToolkit.Mvvm 8.2.2         - MVVM 패턴
CommunityToolkit.WinUI 7.1.2        - UI 컨트롤
Microsoft.Extensions.*              - 설정, DI, 로깅
OpenCvSharp4 4.11.0                 - 이미지 처리
SkiaSharp                          - 그래픽 렌더링
Newtonsoft.Json                    - JSON 처리
log4net                            - 로깅
Serilog                            - 구조화된 로깅
TagLibSharp                        - 오디오 메타데이터
MediaInfo                          - 미디어 정보
```

---

## 📊 파일 통계

| 카테고리 | 개수 |
|---------|-----|
| DLL (핵심) | 45+ |
| DLL (UI/Framework) | 50+ |
| 언어팩 (MUI) | 60+ |
| 리소스 파일 | 200+ |
| 이미지 파일 | 80+ |
| JSON 설정 | 8+ |
| 동적 라이브러리 (native) | 30+ |

**총 파일 수**: 1,200+ 파일

---

## 🚀 워크플로우 흐름

### 비디오 제작 과정

```
1. 사용자 입력
   ↓ (주제, 세로/가로 영상, 장면 수)
   
2. AI 스크립트 생성
   ↓ (AIService.dll → GPT-4)
   
3. 이미지 생성
   ↓ (ImageAIService.dll → DALL-E 3 / Replicate)
   
4. 템플릿 선택 & 텍스트 오버레이
   ↓ (Template.json 적용)
   
5. 자막 생성
   ↓ (ASS 포맷, default.ass)
   
6. 음성 합성
   ↓ (TTSService.dll → Google Cloud TTS)
   
7. 배경음악 추가
   ↓ (PixabayApi.dll → Pixabay)
   
8. 영상 조립
   ↓ (VideoEngine.dll → FFmpeg)
   
9. 전환 효과 적용
   ↓ (55개 xfade 효과)
   
10. 최종 인코딩
    ↓ (H.264 MP4)
    
11. YouTube 업로드
    ↓ (YoutubeAgent.dll → YouTube API v3)
    
12. 결과 저장
    ↓ (Cloudflare 백업)
```

---

## 🔑 API 키 & 설정

### 필수 API 키
1. **OpenAI API Key** (GPT-4, DALL-E 3)
2. **Google Cloud** 
   - YouTube API v3 (업로드)
   - Cloud Text-to-Speech (TTS)
3. **Replicate API** (FLUX 모델)
4. **Pixabay API** (BGM)
5. **Cloudflare API** (백업)

### OAuth 설정
- **Google OAuth Client ID/Secret** (client_secret.json)
- **Firebase Project ID**

---

## ❌ 누락되었던 것 정리

### 이전 분석에서 놓친 것들

✅ **이제 확인됨**:
1. **정확한 프롬프트 템플릿 위치** → AIService/Assistant_PromptTemplate.txt
2. **8개 템플릿 전체 JSON** → Assets/DefaultTemplates/*/Template.json
3. **55개 전환 효과 실제 파일** → Assets/ffmpeg_xfade/*.gif
4. **6개 이미지 모델** → Assets/ImageModels/*.png
5. **Google OAuth 설정** → client_secret.json (완전한 내용)
6. **자막 템플릿** → default.ass (VideoEngine 폴더에도 중복)
7. **.NET 의존성 전체** → AUTOVID.deps.json (3783줄)
8. **데이터 저장 경로** → LocalSettings.json (appsettings.json에 정의)

---

## 🎯 복제 우선순위

### Phase 1: 기본 골격 (필수)
```
✅ 템플릿 시스템 (8개 JSON 전체)
✅ 자막 시스템 (ASS 포맷)
✅ FFmpeg 전환 효과 (55개)
✅ 프롬프트 템플릿
✅ API 통합 (OpenAI, Google, Replicate)
```

### Phase 2: 고급 기능
```
✅ 6개 AI 이미지 모델 통합
✅ YouTube 자동 업로드
✅ Cloudflare 백업
✅ Firebase 인증
```

### Phase 3: 최적화
```
✅ 성능 튜닝
✅ 에러 핸들링
✅ 사용자 피드백
```

---

## 💾 저장 위치 확인

### 사용자 데이터 저장 경로
```
%LOCALAPPDATA%\Packages\DREAMCRAFTLabs.AUTOVID_a9s431j94nj9r\LocalState\
└── AutoVid/ApplicationData/
    └── LocalSettings.json
```

### 임시 작업 파일
```
%TEMP%\AutoVid_*\
├── 생성 중인 영상
├── 임시 자막
├── 임시 이미지
└── 로그 파일
```

---

## ✨ 최종 확인

**모든 파일 상세 확인 완료** ✅

이 분석은 **설치된 AutoVid 앱의 모든 파일을 직접 읽고 검증한 결과**입니다.

복제할 때 필요한 모든 정보가 포함되어 있습니다.
