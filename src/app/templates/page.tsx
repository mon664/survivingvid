'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  titleColor: string;
  preview: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: 'black-default',
    name: 'Black Default',
    description: '검은 배경에 노란색 제목 - 클래식하고 세련된 디자인',
    backgroundColor: '#000000',
    titleColor: '#FFFF00',
    preview: 'bg-black text-yellow-400',
    features: ['높은 가독성', '명확한 가독성', '유튜브 최적화']
  },
  {
    id: 'white-default',
    name: 'White Default',
    description: '흰색 배경에 파란색 제목 - 깔끔하고 전문적인 느낌',
    backgroundColor: '#FFFFFF',
    titleColor: '#0000FF',
    preview: 'bg-white text-blue-600',
    features: ['깔끔한 디자인', '다목적 호환성', '가독성 높음']
  },
  {
    id: 'storycard-beige-brown',
    name: 'StoryCard BeigeBrown',
    description: '베이지 배경에 갈색 액센트 - 따뜻하고 감성적인 분위기',
    backgroundColor: '#F5F5DC',
    titleColor: '#8B4513',
    preview: 'bg-amber-50 text-amber-800',
    features: ['감성적 디자인', '스토리텔링 최적', '따뜻한 느낌']
  },
  {
    id: 'storycard-beige-red',
    name: 'StoryCard BeigeRed',
    description: '베이지 배경에 붉은색 액센트 - 강렬하고 흥미로운 느낌',
    backgroundColor: '#FAEBD7',
    titleColor: '#DC143C',
    preview: 'bg-orange-50 text-red-600',
    features: ['강렬한 강조', '시선 집중', '주목 끌기']
  },
  {
    id: 'storycard-black-pink',
    name: 'StoryCard BlackPink',
    description: '검은 배경에 핑크색 액센트 - 세련되고 매력적인 디자인',
    backgroundColor: '#000000',
    titleColor: '#FF69B4',
    preview: 'bg-black text-pink-400',
    features: ['모던한 느낌', '젊은 층 타겟', '트렌디한 디자인']
  },
  {
    id: 'storycard-white-blue',
    name: 'StoryCard WhiteBlue',
    description: '흰색 배경에 파란색 액센트 - 신뢰성 있고 안정적인 느낌',
    backgroundColor: '#FFFFFF',
    titleColor: '#1E90FF',
    preview: 'bg-white text-blue-500',
    features: ['신뢰감 전달', '안정적인 디자인', '전문적 느낌']
  },
  {
    id: 'storycard-white-green',
    name: 'StoryCard WhiteGreen',
    description: '흰색 배경에 녹색 액센트 - 자연스럽고 편안한 느낌',
    backgroundColor: '#FFFFFF',
    titleColor: '#228B22',
    preview: 'bg-white text-green-600',
    features: ['자연스러움', '편안한 느낌', '시각적 안정감']
  },
  {
    id: 'storycard-white-red',
    name: 'StoryCard WhiteRed',
    description: '흰색 배경에 붉은색 액센트 - 강렬하고 명확한 전달',
    backgroundColor: '#FFFFFF',
    titleColor: '#FF0000',
    preview: 'bg-white text-red-600',
    features: ['강렬한 시각', '명확한 전달', '주목도 극대화']
  }
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">비디오 템플릿</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            전문가급 비디오 템플릿으로 콘텐츠 제작 시간을 단축하세요.
            각 템플릿은 다양한 분야와 스타일에 최적화되어 있습니다.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Preview */}
              <div className={`h-32 ${template.preview} flex items-center justify-center`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2`}>
                    제목 예시
                  </div>
                  <div className="text-sm opacity-75">
                    여기는 비디오 내용입니다
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Color Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span>배경:</span>
                    <div
                      className="w-4 h-4 ml-1 rounded border border-gray-300"
                      style={{ backgroundColor: template.backgroundColor }}
                    />
                    <code className="ml-1">{template.backgroundColor}</code>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <div className="flex items-center">
                    <span>제목:</span>
                    <div
                      className="w-4 h-4 ml-1 rounded border border-gray-300"
                      style={{ backgroundColor: template.titleColor }}
                    />
                    <code className="ml-1">{template.titleColor}</code>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Here you would integrate with your video generation API
                    alert(`템플릿 "${template.name}" 선택됨. API 연동 예정입니다.`);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  선택하기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              선택된 템플릿: {templates.find(t => t.id === selectedTemplate)?.name}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Template Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">미리보기</h3>
                <div
                  className={`rounded-lg p-8 h-48 ${templates.find(t => t.id === selectedTemplate)?.preview}`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-4">
                      선택된 템플릿 제목
                    </div>
                    <div className="text-lg opacity-90">
                      이것은 실제 비디오에서 어떻게 보일지에 대한 예시입니다.
                      템플릿의 색상과 스타일이 적용된 것을 볼 수 있습니다.
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">템플릿 정보</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">특징</h4>
                    <ul className="mt-2 space-y-1">
                      {templates.find(t => t.id === selectedTemplate)?.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">사용 사례</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      이 템플릿은 뉴스, 교육, 엔터테인먼트, 마케팅 등 다양한 분야에서
                      활용될 수 있습니다. 전문적인 결과물을 원하는 경우에 특히 추천됩니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">커스터마이징</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      제목 텍스트, 글꼴, 위치 등을 필요에 맞게 조정할 수 있습니다.
                      단, 템플릿의 기본 디자인을 유지하는 것을 권장합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                선택 취소
              </button>
              <button
                onClick={() => {
                  // Here you would integrate with video generation API
                  alert('비디오 생성 API 연동 예정입니다.');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                이 템플릿으로 비디오 생성
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">템플릿 사용 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. 템플릿 선택</h3>
              <p className="text-sm text-gray-600">
                비디오의 목적과 스타일에 맞는 템플릿을 선택하세요.
                미리보기를 통해 실제 모습을 확인할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. 콘텐츠 준비</h3>
              <p className="text-sm text-gray-600">
                스크립트나 키워드를 준비하세요.
                템플릿에 맞는 콘텐츠가 결과물의 품질을 높여줍니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. 생성 및 다운로드</h3>
              <p className="text-sm text-gray-600">
                AI가 자동으로 비디오를 생성하고, 완성된 결과물을 다운로드할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}