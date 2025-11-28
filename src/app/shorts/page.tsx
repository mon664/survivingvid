'use client';

import { useState, useEffect, useRef } from 'react';

interface ShortsResult {
  success: boolean;
  script: string;
  scenes: Array<{
    id: string;
    description: string;
    duration: number;
    imagePrompt: string;
    audioText: string;
    imageUrl?: string;
  }>;
  audioUrl?: string;
  totalDuration: number;
  sessionId: string;
  webdavPaths?: string[];
}

const availableFonts = [
  'Arial',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Malgun Gothic',
  'Apple SD Gothic Neo',
  'Nanum Gothic',
];

const imageStyles = [
  'photorealistic',
  'cinematic',
  'anime',
  'cartoon',
  'artistic',
  'vintage'
];

const ttsVoices = [
  { id: 'ko-KR-Neural2-A', name: '여성 1 (부드러움)' },
  { id: 'ko-KR-Neural2-B', name: '남성 1 (차분함)' },
  { id: 'ko-KR-Neural2-C', name: '여성 2 (밝음)' },
  { id: 'ko-KR-Neural2-D', name: '남성 2 (힘참)' },
];

export default function ShortsPage() {
  const [mode, setMode] = useState<'keyword' | 'prompt'>('keyword');
  const [keyword, setKeyword] = useState('');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [sceneCount, setSceneCount] = useState(5);
  const [imageStyle, setImageStyle] = useState('photorealistic');
  const [protagonistImage, setProtagonistImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<ShortsResult | null>(null);
  const [error, setError] = useState('');

  // TTS Settings
  const [ttsVoice, setTtsVoice] = useState('ko-KR-Neural2-A');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setProtagonistImage(file);
    }
  };

  const handleGenerate = async () => {
    const input = mode === 'keyword' ? keyword : prompt;

    if (!input) {
      alert(mode === 'keyword' ? '키워드를 입력해주세요.' : '프롬프트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setProgress('초기화 중...');
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('input', input);
      formData.append('duration', duration.toString());
      formData.append('sceneCount', sceneCount.toString());
      formData.append('imageStyle', imageStyle);
      formData.append('ttsVoice', ttsVoice);
      formData.append('ttsSpeed', ttsSpeed.toString());
      formData.append('ttsPitch', ttsPitch.toString());

      if (protagonistImage) {
        formData.append('protagonistImageFile', protagonistImage);
      }

      setProgress('스크립트 생성 중...');

      const response = await fetch('/api/shorts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '생성 실패');
      }

      setProgress('최종 처리 중...');
      const data: ShortsResult = await response.json();

      setResult(data);
      setProgress('');

    } catch (err) {
      console.error('Shorts generation error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const downloadAssets = async () => {
    if (!result) return;

    // Create zip file with all assets
    // For now, just download script
    const blob = new Blob([result.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shorts_script_${result.sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">쇼츠 생성기</h1>
          <p className="text-gray-600">AI로 바이럴 쇼츠 영상을 손쉽게 만들어보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생성 모드
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('keyword')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      mode === 'keyword'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    키워드
                  </button>
                  <button
                    onClick={() => setMode('prompt')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      mode === 'prompt'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    프롬프트
                  </button>
                </div>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'keyword' ? '키워드' : '프롬프트'}
                </label>
                {mode === 'keyword' ? (
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="예: AI 기술 혁신"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="쇼츠에 대한 상세한 설명을 입력해주세요..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  영상 길이: {duration}초
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Scene Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장면 수: {sceneCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Image Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 스타일
                </label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {imageStyles.map(style => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Protagonist Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주인공 이미지 (선택사항)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {protagonistImage ? '이미지 변경' : '이미지 선택'}
                </button>
                {protagonistImage && (
                  <p className="mt-2 text-sm text-gray-600">
                    선택됨: {protagonistImage.name}
                  </p>
                )}
              </div>

              {/* TTS Settings */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">음성 설정</h3>

                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">목소리</label>
                  <select
                    value={ttsVoice}
                    onChange={(e) => setTtsVoice(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ttsVoices.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    속도: {ttsSpeed.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    음높이: {ttsPitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? '생성 중...' : '쇼츠 생성'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-700">{progress}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Script */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">생성된 스크립트</h2>
                    <button
                      onClick={downloadAssets}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      다운로드
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {result.script}
                    </pre>
                  </div>
                </div>

                {/* Scenes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    생성된 장면 ({result.scenes.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.scenes.map((scene, index) => (
                      <div key={scene.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          {scene.imageUrl ? (
                            <img
                              src={scene.imageUrl}
                              alt={`Scene ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-500">장면 {index + 1}</span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          장면 {index + 1} ({scene.duration}초)
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{scene.description}</p>
                        <p className="text-xs text-gray-500 italic">{scene.audioText}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Player */}
                {result.audioUrl && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">생성된 오디오</h2>
                    <audio controls className="w-full">
                      <source src={result.audioUrl} type="audio/mpeg" />
                      브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                  </div>
                )}

                {/* Session Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">세션 정보</h3>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>세션 ID: {result.sessionId}</p>
                    <p>총 재생시간: {result.totalDuration}초</p>
                    <p>WebDAV 업로드: {result.webdavPaths?.length || 0}개 파일</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}