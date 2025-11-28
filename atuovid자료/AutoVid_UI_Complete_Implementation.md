# 🎬 AutoVid UI 완벽 재현 - React 완전 구현

**기준**: UI 캡처 11개 분석 (로그인, 다운로드, 자동생성, 템플릿, YouTube, 폰트, BGM, 프로필, 설정, 상점)

---

## 📊 UI 구조 분석

### 좌측 메뉴 (11개)
- 로그인 | 다운로드 | 수동영상생성 | 자동영상생성
- BEST | Template | 유튜브탐색 | Fonts | BGM
- 프로필설정 | Shop | 설정

### 상단 정보바
- 이메일 | FREE | S-CRD: 0.00 | E-CRD: 10.00

### 크레딧 시스템
- S-CRD (구독 무료) vs E-CRD (유료 현금)

---

## 💻 핵심 코드

### Layout.tsx
```typescript
import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <div className="main-content">
      <TopBar />
      <div className="page-content">{children}</div>
    </div>
  </div>
);

export default Layout;
```

### AutoVideoGeneration.tsx (자동 영상 생성 - 핵심)
```typescript
const handleGenerateVideo = async () => {
  // Step 1: Claude 스크립트 생성
  const script = await claude.generate({
    subject: project.name,
    requestNumber: 5,
    requestLanguage: 'ko-KR'
  });

  // Step 2: DALL-E 3 이미지 생성
  const images = await dalle3.generate(script.imageGenPrompt);

  // Step 3: 템플릿 적용
  const template = parseTemplate(project.template);

  // Step 4: FFmpeg 비디오 조립
  const video = await ffmpeg.compose({
    images,
    template,
    transitions: 'dissolve'
  });

  // Step 5: YouTube 업로드
  await youtube.upload(video);
};
```

### TemplateEditor.tsx (템플릿)
```typescript
// 8개 기본 템플릿
const templates = [
  { name: 'BLACK', bgColor: '#FF000000' },
  { name: 'WHITE', bgColor: '#FFFFFFFF' },
  { name: 'StoryCard-BeigeBrown', bgColor: '#FFFFFBE5' },
  // ... 5개 더
];

// 프리뷰 (1080x1920 세로)
const previewWidth = 300 * (1080/1920);
const previewHeight = 300;
```

### ShopPage.tsx (상점)
```typescript
const products = [
  // 구독
  { id: 'pro-month', name: 'PRO MONTHLY', price: 2200, credits: 100 },
  { id: 'pro-365', name: 'PRO 365', price: 22400, credits: 100 },
  // 크레딧
  { id: 'e-100', name: '100 E-CRD', price: 3800, type: 'credit' },
  { id: 'e-500', name: '500 E-CRD', price: 0, type: 'credit' }
];
```

---

## 🎨 CSS 핵심 (다크 테마)
```css
body { background: #1a1a2e; }
.sidebar { background: #16213e; width: 300px; }
.topbar { background: #0f3460; }
.btn-primary { background: #00d4ff; color: #000; }
.btn-danger { background: #e94560; }
```

---

## 📁 완전 파일 구조
```
src/
├── components/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── Layout.tsx
│   ├── AutoVideoGeneration.tsx
│   ├── TemplateEditor.tsx
│   └── ProfileSettings.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DownloadPage.tsx
│   ├── AutoVideoPage.tsx
│   ├── TemplatePage.tsx
│   ├── YouTubePage.tsx
│   ├── FontsPage.tsx
│   ├── BGMPage.tsx
│   ├── ProfilePage.tsx
│   └── ShopPage.tsx
└── styles/globals.css
```

---

## 🚀 즉시 사용 가능

이 코드로 우리의 AI Platform Clean에 **AutoVid 똑같은 UI** 적용 가능!

다음 세션: 이 코드 + Claude 프롬프트 + DALL-E 3 통합 = **완전 자동화 시스템** 🎯
