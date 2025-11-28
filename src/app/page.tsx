import Link from 'next/link';
import { Play, Sparkles, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI로 비디오를
              <span className="block text-yellow-300">쉽게 만들어보세요</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              전문가급 비디오 제작을 이제 누구나 할 수 있습니다.
              쇼츠, 스토리, 마케팅 영상을 AI가 자동으로 생성해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shorts"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                쇼츠 생성 시작하기
              </Link>
              <Link
                href="/story"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                스토리 생성 시작하기
              </Link>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 SurvivingVid 인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI 기술로 비디오 제작의 모든 과정을 자동화하여 시간과 비용을 절약하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shorts Generator */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">쇼츠 생성기</h3>
              <p className="text-gray-600 mb-6">
                키워드나 프롬프트만 입력하면 30초짜리 바이럴 쇼츠 영상을 자동으로 제작합니다.
                주인공 이미지 업로드, TTS 음성, 다양한 스타일 지원
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span>3-10개 장면, 15-60초 길이 조절</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span>한국어 TTS 음성 생성 (4가지 목소리)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span>6가지 이미지 스타일 지원</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">✓</span>
                  <span>WebDAV 클라우드 저장</span>
                </li>
              </ul>
              <Link
                href="/shorts"
                className="mt-6 inline-flex items-center text-orange-600 font-semibold hover:text-orange-700"
              >
                쇼츠 생성하기 →
              </Link>
            </div>

            {/* Story Generator */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">스토리 생성기</h3>
              <p className="text-gray-600 mb-6">
                얼굴 사진을 분석하여 개인화된 스토리 콘텐츠를 생성합니다.
                캐릭터 일관성을 유지하며 전문적인 결과물을 만들어보세요.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Gemini Vision 얼굴 분석</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>캐릭터 일관성 유지</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>3가지 화면 비율 지원 (16:9, 9:16, 1:1)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>5-15개 장면 자동 생성</span>
                </li>
              </ul>
              <Link
                href="/story"
                className="mt-6 inline-flex items-center text-purple-600 font-semibold hover:text-purple-700"
              >
                스토리 생성하기 →
              </Link>
            </div>

            {/* Professional Video */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">전문 비디오</h3>
              <p className="text-gray-600 mb-6">
                완전한 비디오 제작 파이프라인을 제공합니다.
                스크립트부터 이미지, 자막, 오디오까지 모든 과정을 자동화합니다.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Vertex AI 이미지 생성</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>ASS 자막 형식 지원</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>8가지 전문 템플릿</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>WebDAV 클라우드 통합</span>
                </li>
              </ul>
              <Link
                href="/templates"
                className="mt-6 inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
              >
                템플릿 보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3단계로 비디오 완성
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 비디오 제작 과정을 AI가 간단화합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">아이디어 입력</h3>
              <p className="text-gray-600">
                키워드, 프롬프트, 또는 이미지를 입력하세요.
                AI가 최적의 콘텐츠를 생성합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 생성</h3>
              <p className="text-gray-600">
                Gemini AI와 Vertex AI가 스크립트, 이미지,
                오디오를 자동으로 생성합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">다운로드</h3>
              <p className="text-gray-600">
                완성된 비디오를 다운로드하거나
                클라우드에 바로 저장하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              최신 AI 기술 탑재
            </h2>
            <p className="text-xl text-gray-600">
              Google의 최고 수준 AI 기술로 전문가급 결과물을 보장합니다
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">G</span>
              </div>
              <h4 className="font-semibold text-gray-900">Gemini AI</h4>
              <p className="text-sm text-gray-600">자연어 처리</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">V</span>
              </div>
              <h4 className="font-semibold text-gray-900">Vertex AI</h4>
              <p className="text-sm text-gray-600">이미지 생성</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">C</span>
              </div>
              <h4 className="font-semibold text-gray-900">Google Cloud</h4>
              <p className="text-sm text-gray-600">TTS 음성 합성</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">W</span>
              </div>
              <h4 className="font-semibold text-gray-900">WebDAV</h4>
              <p className="text-sm text-gray-600">클라우드 저장</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            가입 없이 바로 사용할 수 있습니다. AI로 비디오 제작의 미래를 경험해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shorts"
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              무료로 쇼츠 만들기
            </Link>
            <Link
              href="/story"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              무료로 스토리 만들기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}