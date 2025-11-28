'use client';

import { useState, useRef } from 'react';

interface StoryResult {
  success: boolean;
  title: string;
  script: string;
  scenes: Array<{
    id: string;
    description: string;
    imagePrompt: string;
    audioText: string;
    duration: number;
  }>;
  protagonistAnalysis?: string;
  partnerAnalysis?: string;
  sessionId: string;
  webdavPaths?: string[];
  imageUrls?: string[];
}

const aspectRatios = [
  { id: '16:9', name: '가로 (YouTube)', icon: '🎬' },
  { id: '9:16', name: '세로 (Shorts/Reels)', icon: '📱' },
  { id: '1:1', name: '정사각형 (Instagram)', icon: '📷' },
];

export default function StoryPage() {
  const [protagonist, setProtagonist] = useState<File | null>(null);
  const [partner, setPartner] = useState<File | null>(null);
  const [story, setStory] = useState('');
  const [persona, setPersona] = useState('');
  const [sceneCount, setSceneCount] = useState(8);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<StoryResult | null>(null);
  const [error, setError] = useState('');

  const protagonistFileRef = useRef<HTMLInputElement>(null);
  const partnerFileRef = useRef<HTMLInputElement>(null);

  const handleProtagonistUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      setProtagonist(file);
    }
  };

  const handlePartnerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      setPartner(file);
    }
  };

  const handleGenerate = async () => {
    if (!protagonist || !story) {
      alert('주인공 이미지와 스토리를 입력해주세요.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setProgressText('얼굴 분석 중...');
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('protagonistFile', protagonist);
      if (partner) {
        formData.append('partnerFile', partner);
      }
      formData.append('story', story);
      formData.append('persona', persona);
      formData.append('sceneCount', sceneCount.toString());
      formData.append('aspectRatio', aspectRatio);

      // Simulate progress
      setProgress(20);
      setProgressText('스토리 생성 중...');

      const response = await fetch('/api/story', {
        method: 'POST',
        body: formData,
      });

      setProgress(60);
      setProgressText('이미지 생성 중...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '생성 실패');
      }

      setProgress(90);
      setProgressText('최종 처리 중...');

      const data: StoryResult = await response.json();

      setProgress(100);
      setProgressText('완료!');

      setResult(data);

      setTimeout(() => {
        setProgress(0);
        setProgressText('');
      }, 2000);

    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setProgress(0);
      setProgressText('');
    } finally {
      setLoading(false);
    }
  };

  const downloadAssets = async () => {
    if (!result) return;

    // Download script
    const scriptBlob = new Blob([result.script], { type: 'text/plain' });
    const scriptUrl = URL.createObjectURL(scriptBlob);
    const scriptLink = document.createElement('a');
    scriptLink.href = scriptUrl;
    scriptLink.download = `story_${result.sessionId}.txt`;
    scriptLink.click();
    URL.revokeObjectURL(scriptUrl);
  };

  const removeProtagonist = () => {
    setProtagonist(null);
    if (protagonistFileRef.current) {
      protagonistFileRef.current.value = '';
    }
  };

  const removePartner = () => {
    setPartner(null);
    if (partnerFileRef.current) {
      partnerFileRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">스토리 생성기</h1>
          <p className="text-gray-600">얼굴 이미지로 개인화된 스토리 콘텐츠를 만들어보세요</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Controls */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-4">
              {/* Character Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">캐릭터 이미지</h3>

                {/* Protagonist */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주인공 <span className="text-red-500">*</span>
                  </label>
                  {protagonist ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(protagonist)}
                        alt="주인공"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeProtagonist}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <p className="mt-2 text-xs text-gray-600 truncate">
                        {protagonist.name}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => protagonistFileRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center"
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-1 block">👤</span>
                        <span className="text-sm text-gray-600">주인공 이미지 선택</span>
                      </div>
                    </button>
                  )}
                  <input
                    ref={protagonistFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProtagonistUpload}
                    className="hidden"
                  />
                </div>

                {/* Partner */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파트너 (선택사항)
                  </label>
                  {partner ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(partner)}
                        alt="파트너"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={removePartner}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <p className="mt-2 text-xs text-gray-600 truncate">
                        {partner.name}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => partnerFileRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center"
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-1 block">👥</span>
                        <span className="text-sm text-gray-600">파트너 이미지 선택</span>
                      </div>
                    </button>
                  )}
                  <input
                    ref={partnerFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePartnerUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Story Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  스토리 주제 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="만들고 싶은 스토리의 주제를 상세하게 설명해주세요..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Persona */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  페르소나/스타일
                </label>
                <input
                  type="text"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="예: 로맨틱, 코믹, 스릴러"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Scene Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장면 수: {sceneCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="15"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  화면 비율
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {aspectRatios.map(ratio => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`px-3 py-2 rounded-md text-left transition-colors ${
                        aspectRatio === ratio.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span className="mr-2">{ratio.icon}</span>
                      <span className="text-sm">{ratio.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !protagonist || !story}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? '생성 중...' : '스토리 생성'}
              </button>

              {/* Progress */}
              {loading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{progressText}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="xl:col-span-3">
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
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {result.title}
                      </h2>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>장면: {result.scenes.length}개</span>
                        <span>비율: {aspectRatio}</span>
                        <span>세션: {result.sessionId}</span>
                      </div>
                    </div>
                    <button
                      onClick={downloadAssets}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      다운로드
                    </button>
                  </div>
                </div>

                {/* Analysis */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">얼굴 분석 결과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">주인공</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {result.protagonistAnalysis || '분석 결과가 없습니다.'}
                      </p>
                    </div>
                    {result.partnerAnalysis && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">파트너</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {result.partnerAnalysis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Script */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 스크립트</h3>
                  <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {result.script}
                    </pre>
                  </div>
                </div>

                {/* Scenes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    생성된 장면 ({result.scenes.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.scenes.map((scene, index) => {
                      const aspectRatioClass = {
                        '16:9': 'aspect-video',
                        '9:16': 'aspect-[9/16]',
                        '1:1': 'aspect-square'
                      }[aspectRatio];

                      return (
                        <div key={scene.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className={`bg-gray-100 ${aspectRatioClass} flex items-center justify-center`}>
                            {result.imageUrls?.[index] ? (
                              <img
                                src={result.imageUrls[index]}
                                alt={`Scene ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500">장면 {index + 1}</span>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              장면 {index + 1} ({scene.duration}초)
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">{scene.description}</p>
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-xs text-blue-800 italic">
                                "{scene.audioText}"
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Session Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">생성 정보</h3>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p>세션 ID: {result.sessionId}</p>
                    <p>WebDAV 업로드: {result.webdavPaths?.length || 0}개 파일</p>
                    <p>이미지 생성: {result.imageUrls?.length || 0}개</p>
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