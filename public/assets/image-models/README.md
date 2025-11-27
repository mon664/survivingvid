# AI 이미지 모델 - Vertex AI Imagen 매핑

## 6개 이미지 모델 설명

### 1. animagine31 (애니메이션 스타일)
- **원본 모델**: Animagine XL 3.1 (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: Japanese animation style, vibrant colors, detailed artwork
- **용도**: 애니메이션, 만화, 일러스트레이션

### 2. chibitoon (치비 만화 스타일)
- **원본 모델**: SDXL Chibi (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: chibi cartoon style, cute characters, simplified features
- **용도**: 귀여운 캐릭터, 치비 스타일

### 3. enna-sketch-style (스케치 스타일)
- **원본 모델**: Text-to-Image (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: pencil sketch, hand-drawn, artistic
- **용도**: 스케치, 드로잉, 예술적 스타일

### 4. flux-schnell-dark (FLUX 다크톤)
- **원본 모델**: FLUX Schnell (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: dark theme, dramatic lighting, high contrast
- **용도**: 어두운 분위기, 드라마틱한 이미지

### 5. flux-schnell-realitic (FLUX 사실적)
- **원본 모델**: FLUX Dev (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: photorealistic, high resolution, professional
- **용도**: 사실적인 이미지, 전문적인 사진 스타일

### 6. flux-schnell-webtoon (FLUX 웹툰)
- **원본 모델**: Custom FLUX Webtoon (Replicate)
- **Vertex AI 모델**: imagen-3.0-generate-001
- **스타일**: webtoon manhwa style, clean lines, digital art
- **용도**: 웹툰, 만화 스타일

## 프롬프트 스타일 가이드

### animagine31
- 키워드: anime style, Japanese animation, vibrant colors, detailed artwork
- 적용 주제: 애니메이션 캐릭터, 판타지, 게임

### chibitoon
- 키워드: chibi, cute, adorable, simplified, cartoon style
- 적용 주제: 귀여운 동물, 캐릭터, 즐거운 분위기

### enna-sketch-style
- 키워드: pencil sketch, hand-drawn, artistic, monochrome, sketch style
- 적용 주제: 예술적 컨셉, 교육 콘텐츠, 전통적 주제

### flux-dark
- 키워드: dark theme, dramatic, moody, high contrast, cinematic
- 적용 주제: 스릴러, 미스터리, 심각한 주제

### flux-realistic
- 키워드: photorealistic, high resolution, professional photography, detailed
- 적용 주제: 실제 장소, 인물, 제품

### flux-webtoon
- 키워드: webtoon style, manhwa, clean lines, colorful, digital art
- 적용 주제: 웹툰, 현대 스토리텔링