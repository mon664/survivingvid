# 🎬 AutoVid 완전 분석 - 실제 파일 기반

**분석 날짜**: 2025-01-18  
**버전**: 1.3.6.0  
**설치 위치**: `C:\Program Files\WindowsApps\DREAMCRAFTLabs.AUTOVID_1.3.6.0_x64__a9s431j94nj9r`

---

## 📂 전체 파일 구조

### 핵심 실행 파일
- **AUTOVID.exe** - 메인 실행 파일
- **AUTOVID.dll** - 주요 로직 DLL
- **AutoVid.Core.dll** - 코어 라이브러리

### AI 관련 DLL (5개)
1. **AIService.dll** - OpenAI GPT-4 연동
2. **ImageAIService.dll** - DALL-E 3 + Replicate 이미지 생성
3. **TTSService.dll** - Google Cloud TTS
4. **VideoEngine.dll** - FFmpeg 비디오 처리
5. **YoutubeAgent.dll** - YouTube 업로드

### 추가 서비스 DLL
- **CloudService.dll** - 클라우드 동기화
- **CloudflareApi.dll** - Cloudflare 연동
- **PixabayApi.dll** - Pixabay 음악 API
- **Replicate.dll** - Replicate AI 이미지
- **FFMpegWrapper.dll** - FFmpeg 래퍼

### 외부 라이브러리
- **Firebase.Auth.dll** - Firebase 인증
- **Google.Apis.YouTube.v3.dll** - YouTube API
- **Google.Cloud.TextToSpeech.V1Beta1.dll** - Google TTS
- **OpenAI.dll** - OpenAI API
- **SkiaSharp.dll** - 그래픽 처리
- **OpenCvSharp.dll** - 컴퓨터 비전
- **Newtonsoft.Json.dll** - JSON 처리
- **ffmpeg.exe** - 비디오 인코더

---

## 🤖 AI Assistant 프롬프트 (완전판)

### 파일: `AIService\Assistant_PromptTemplate.txt`

```
You are an API-style assistant.

# STRICT OUTPUT POLICY
1. Respond **only** with a single JSON object that exactly matches "RESPONSE_SCHEMA".
2. Do **NOT** wrap the JSON in markdown fences, add comments, change key order, or include extra properties.
3. If you cannot comply, respond with:
   { "error": "EXPLANATION_OF_PROBLEM" }

# REQUEST_SCHEMA  (for reference)
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
      "script":             [ string, ... ],
      "imageGenPrompt":      string
    }
  ]
}

# SPECIAL_CONSTRAINTS
- openingSegment.script[0] MUST start with a curiosity-hook that prevents viewer drop-off.
- 모든 imageGenPrompt 길이는 120자 이하.

Begin.
```

---

## 🎬 자막 시스템 (ASS 형식)

### 파일: `default.ass` 및 `VideoEngine\default.ass`

```ass
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,나눔스퀘어 Bold, 100, &H00FFFFFF, &H00FFFFFF, &H00000000, &H80000000, 0, 0, 0, 0, 100, 100, 0, 0, 1, 1, 0, 4, 10, 10, 10, 1
Style: Default,나눔스퀘어 Regular,72,&H00FFFFFF, &H00FFFFFF, &H00000000, &H80000000, 0, 0, 0, 0, 100, 100, 0, 0, 1, 1, 0, 2, 10, 10, 10, 1
Style: Rank,나눔스퀘어 Bold,100,&H00FFFFFF, &H00FFFFFF, &H00000000, &H80000000, 0, 0, 0, 0, 100, 100, 0, 0, 1, 1, 0, 2, 0, 0, 0, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,Your subtitle text here
```

**3가지 스타일**:
1. **Title**: 100pt, 중앙 정렬 (Alignment 4)
2. **Default**: 72pt, 하단 중앙 (Alignment 2)
3. **Rank**: 100pt, 하단 좌측 (Alignment 2)

**색상 코드**:
- `&H00FFFFFF` - 흰색 (Primary)
- `&H00000000` - 검정 테두리 (Outline)
- `&H80000000` - 반투명 검정 배경 (BackColour)

---

## 📄 템플릿 시스템 (8개 전체)

### BLACK Template

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
      "FontColorAsColor": {"A":255, "R":255, "G":232, "B":9},
      "X": 0.017,
      "Y": 0.009,
      "Content": "Channel Name",
      "FontSize": 48.0,
      "FontColor": "#FFE809",
      "FontFamilyName": "Segoe UI Bold",
      "IsBold": false
    },
    {
      "FontColorAsColor": {"A":255, "R":255, "G":255, "B":255},
      "X": 0.021,
      "Y": 0.866,
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

**템플릿 디렉토리 구조**:
```
Assets\DefaultTemplates\
├── BLACK\
│   ├── Template.json
│   └── thumbnail.png
├── WHITE\
│   ├── Template.json
│   └── thumbnail.png
├── StoryCard-BeigeBrown\
│   ├── template.json
│   └── thumbnail.png
├── StoryCard-BeigeRed\
│   ├── template.json
│   └── thumbnail.png
├── StoryCard-BlackPink\
│   ├── template.json
│   └── thumbnail.png
├── StoryCard-WhiteBlue\
│   ├── template.json
│   └── thumbnail.png
├── StoryCard-WhiteGreen\
│   ├── template.json
│   └── thumbnail.png
└── StoryCard-WhiteRed\
    ├── template.json
    └── thumbnail.png
```

**Template.json 구조**:
- `Id` (string) - 고유 GUID
- `IsDefault` (boolean) - 기본 템플릿 여부
- `TemplateName` (string) - 표시 이름
- `BackgroundColor` (string) - ARGB 16진수 (#FFFFFFFF)
- `TopHeightPercent` (float) - 상단 여백 비율 (0-100)
- `BottomHeightPercent` (float) - 하단 여백 비율 (0-100)
- `FixedTexts` (array) - 고정 텍스트 배열
  - `X`, `Y` (float) - 위치 (0.0-1.0 비율)
  - `Content` (string) - 텍스트 내용
  - `FontSize` (float) - 폰트 크기
  - `FontColor` (string) - 색상 코드
  - `FontFamilyName` (string) - 폰트명
  - `IsBold` (boolean) - 볼드 여부
  - `FontColorAsColor` (object) - ARGB 색상 객체
- `Stickers` (array) - 스티커 배열

---

## 🎞️ FFmpeg 전환 효과 (55개 확인됨)

### 파일 위치: `Assets\ffmpeg_xfade\`

**확인된 55개 GIF 파일** (알파벳 순):
1. circleclose
2. circlecrop
3. circleopen
4. coverdown
5. coverleft
6. coverright
7. coverup
8. diagbl
9. diagbr
10. diagtl
11. diagtr
12. dissolve
13. distance
14. fade
15. fadeblack
16. fadegrays
17. fadewhite
18. hblur
19. hlslice
20. hlwind
21. horzclose
22. horzopen
23. hrslice
24. hrwind
25. pixelize
26. radial
27. rectcrop
28. revealdown
29. revealleft
30. revealright
31. revealup
32. slidedown
33. slideleft
34. slideright
35. slideup
36. smoothdown
37. smoothleft
38. smoothright
39. smoothup
40. squeezeh
41. squeezev
42. vdslice
43. vdwind
44. vertclose
45. vertopen
46. vuslice
47. vuwind
48. wipebl
49. wipebr
50. wipedown
51. wipeleft
52. wiperight
53. wipetl
54. wipetr
55. wipeup
56. zoomin

**FFmpeg xfade 필터 사용법**:
```bash
ffmpeg -i video1.mp4 -i video2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=5[v]" \
  -map "[v]" output.mp4
```

---

## 🖼️ AI 이미지 모델 (6개)

### 파일 위치: `Assets\ImageModels\`

**확인된 6개 PNG 파일**:
1. **animagine31.png** - Animagine XL 3.1 (애니메이션 스타일)
2. **chibitoon.png** - Chibi 만화 스타일
3. **enna-sketch-style.png** - 스케치 스타일
4. **flux-schnell-dark.png** - FLUX Schnell Dark
5. **flux-schnell-realitic.png** - FLUX Schnell Realistic
6. **flux-schnell-webtoon.png** - FLUX Schnell Webtoon

**예상 모델 매핑**:
```javascript
const IMAGE_MODELS = {
  "animagine31": "cjwbw/animagine-xl-3.1",
  "chibitoon": "fofr/sdxl-chibi",
  "enna-sketch": "replicate/text-to-image",
  "flux-dark": "black-forest-labs/flux-schnell",
  "flux-realistic": "black-forest-labs/flux-dev",
  "flux-webtoon": "custom/flux-webtoon"
};
```

---

## ⚙️ 설정 시스템

### appsettings.json

```json
{
  "LocalSettingsOptions": {
    "ApplicationDataFolder": "AutoVid/ApplicationData",
    "LocalSettingsFile": "LocalSettings.json"
  }
}
```

**LocalSettings.json 예상 위치**:
- `%LOCALAPPDATA%\Packages\DREAMCRAFTLabs.AUTOVID_*\LocalState\AutoVid\ApplicationData\LocalSettings.json`

**예상 LocalSettings.json 구조**:
```json
{
  "OpenAIApiKey": "",
  "ReplicateApiKey": "",
  "GoogleCloudProjectId": "",
  "YouTubeChannelId": "",
  "DefaultTemplate": "BLACK",
  "DefaultVoice": "ko-KR-Neural2-A",
  "DefaultLanguage": "ko-KR",
  "CreditBalance": {
    "SCrd": 0,
    "ECrd": 10
  }
}
```

---

## 🔐 인증 시스템

### Firebase Auth

**client_secret.json** (GoogleYouTube용):
```json
{
  "installed": {
    "client_id": "...",
    "project_id": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "...",
    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
}
```

**YoutubeAgent/client_secret.json** 동일 구조

---

## 📊 데이터 흐름 (완전판)

### 1. 사용자 요청
```
사용자: "AI 혁명에 대한 60초 영상"
```

### 2. AIService 처리
```csharp
// AIService.dll
public async Task<ScriptResponse> GenerateScript(ScriptRequest request)
{
    var prompt = LoadPromptTemplate();
    prompt = prompt.Replace("REQUEST_SCHEMA", JsonConvert.SerializeObject(request));
    
    var openAI = new OpenAIAPI(apiKey);
    var response = await openAI.Completions.CreateCompletion(new CompletionRequest
    {
        Model = "gpt-4",
        Prompt = prompt,
        MaxTokens = 2000
    });
    
    return JsonConvert.DeserializeObject<ScriptResponse>(response.Choices[0].Text);
}
```

### 3. ImageAIService 처리
```csharp
// ImageAIService.dll
public async Task<List<string>> GenerateImages(List<string> prompts, string model = "flux-realistic")
{
    var replicate = new ReplicateClient(apiKey);
    var images = new List<string>();
    
    foreach (var prompt in prompts)
    {
        var prediction = await replicate.Run(
            model: IMAGE_MODELS[model],
            input: new { prompt = prompt, aspect_ratio = "9:16" }
        );
        images.Add(prediction.output[0]);
    }
    
    return images;
}
```

### 4. TTSService 처리
```csharp
// TTSService.dll
public async Task<byte[]> SynthesizeSpeech(string text, string voice = "ko-KR-Neural2-A")
{
    var client = TextToSpeechClient.Create();
    var input = new SynthesisInput { Text = text };
    var voiceSelection = new VoiceSelectionParams
    {
        LanguageCode = "ko-KR",
        Name = voice
    };
    var audioConfig = new AudioConfig
    {
        AudioEncoding = AudioEncoding.Mp3
    };
    
    var response = await client.SynthesizeSpeechAsync(input, voiceSelection, audioConfig);
    return response.AudioContent.ToByteArray();
}
```

### 5. VideoEngine 처리
```csharp
// VideoEngine.dll
public async Task<string> AssembleVideo(VideoProject project)
{
    var ffmpeg = new FFMpegWrapper.FFMpeg();
    
    // 1. 이미지를 비디오 클립으로 변환
    var clips = new List<string>();
    for (int i = 0; i < project.Images.Count; i++)
    {
        var clipPath = $"clip_{i}.mp4";
        await ffmpeg.ConvertImageToVideo(project.Images[i], clipPath, project.Scenes[i].Duration);
        clips.Add(clipPath);
    }
    
    // 2. 전환 효과 적용
    string current = clips[0];
    for (int i = 1; i < clips.Count; i++)
    {
        var output = $"merged_{i}.mp4";
        await ffmpeg.ApplyTransition(current, clips[i], output, project.Transitions[i-1]);
        current = output;
    }
    
    // 3. 자막 추가
    var subtitles = GenerateSubtitles(project.Script);
    await ffmpeg.BurnSubtitles(current, subtitles, "with_subs.mp4");
    
    // 4. 음성 추가
    await ffmpeg.AddAudio("with_subs.mp4", project.AudioPath, "final.mp4");
    
    return "final.mp4";
}
```

### 6. YoutubeAgent 처리
```csharp
// YoutubeAgent.dll
public async Task<string> UploadVideo(string videoPath, VideoMetadata metadata)
{
    var youtubeService = GetAuthenticatedService();
    
    var video = new Video();
    video.Snippet = new VideoSnippet
    {
        Title = metadata.Title,
        Description = metadata.Description,
        Tags = metadata.Tags,
        CategoryId = "24" // Entertainment
    };
    video.Status = new VideoStatus
    {
        PrivacyStatus = "public"
    };
    
    using (var fileStream = new FileStream(videoPath, FileMode.Open))
    {
        var videosInsertRequest = youtubeService.Videos.Insert(video, "snippet,status", fileStream, "video/*");
        videosInsertRequest.ProgressChanged += (progress) => {
            Console.WriteLine($"Upload: {progress.BytesSent} bytes");
        };
        videosInsertRequest.ResponseReceived += (video) => {
            Console.WriteLine($"Video ID: {video.Id}");
        };
        
        await videosInsertRequest.UploadAsync();
    }
    
    return video.Id;
}
```

---

## 🛠️ 복제를 위한 기술 스택

### 프론트엔드 (WinUI 3 대체)
```
Electron + React + TypeScript
또는
WPF (.NET 6+) + XAML
```

### 백엔드 (C# DLL 대체)
```python
# Python FastAPI
from fastapi import FastAPI
from typing import List
import openai
import replicate
from google.cloud import texttospeech
import ffmpeg

app = FastAPI()

@app.post("/api/generate-script")
async def generate_script(request: ScriptRequest):
    # AIService.dll 대체
    pass

@app.post("/api/generate-images")
async def generate_images(prompts: List[str]):
    # ImageAIService.dll 대체
    pass

@app.post("/api/synthesize-speech")
async def synthesize_speech(text: str):
    # TTSService.dll 대체
    pass

@app.post("/api/assemble-video")
async def assemble_video(project: VideoProject):
    # VideoEngine.dll 대체
    pass

@app.post("/api/upload-youtube")
async def upload_youtube(video_path: str):
    # YoutubeAgent.dll 대체
    pass
```

---

## 📋 완전 복제 체크리스트

### Phase 1: 핵심 기능
- [ ] AIService - GPT-4 스크립트 생성
- [ ] ImageAIService - 6개 모델 이미지 생성
- [ ] TTSService - Google TTS 음성 합성
- [ ] VideoEngine - FFmpeg 55개 전환 효과
- [ ] YoutubeAgent - YouTube 업로드

### Phase 2: UI/UX
- [ ] 로그인 시스템 (Firebase)
- [ ] 크레딧 시스템 (S-CRD, E-CRD)
- [ ] 12개 메뉴 구현
- [ ] 템플릿 에디터
- [ ] 실시간 미리보기

### Phase 3: 추가 기능
- [ ] 다운로드 (yt-dlp)
- [ ] BGM (Pixabay)
- [ ] Fonts (Google Fonts)
- [ ] YouTube 탐색 (WebView)
- [ ] Shop (결제)

### Phase 4: 데이터베이스
- [ ] LocalSettings.json 구조
- [ ] 템플릿 저장/불러오기
- [ ] 프로젝트 관리
- [ ] 크레딧 동기화

---

## 🎯 핵심 파일 요약

| 카테고리 | 파일명 | 역할 |
|---|---|---|
| **프롬프트** | AIService\Assistant_PromptTemplate.txt | GPT 스크립트 생성 프롬프트 |
| **자막** | default.ass | ASS 형식 자막 템플릿 |
| **설정** | appsettings.json | 앱 설정 |
| **템플릿** | Assets\DefaultTemplates\*\Template.json | 8개 비디오 템플릿 |
| **전환효과** | Assets\ffmpeg_xfade\*.gif | 55개 전환 효과 |
| **AI모델** | Assets\ImageModels\*.png | 6개 이미지 모델 |
| **인증** | client_secret.json | Google OAuth |
| **실행파일** | AUTOVID.exe | 메인 앱 |

---

**이제 모든 정보가 완비되었습니다. 정확한 복제가 가능합니다!**
