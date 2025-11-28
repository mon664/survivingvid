'use client';

import React, { useState } from 'react';
import { IconVideo, IconCheck } from '@tabler/icons-react';
import ScriptGenerator from '../components/video/ScriptGenerator';
import TemplateSelector from '../components/video/TemplateSelector';
import VideoGenerator from '../components/video/VideoGenerator';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ScriptData {
  segments: Array<{
    id: number;
    narrative: string;
    imagePrompt: string;
  }>;
  title: string;
  description: string;
}

interface Template {
  id: string;
  name: string;
  directory: string;
  backgroundColor: string;
  isDefault: boolean;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [script, setScript] = useState<ScriptData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleScriptGenerated = (generatedScript: ScriptData) => {
    setScript(generatedScript);
    setCurrentStep(2);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep(3);
  };

  const handleVideoGenerated = (videoUrl: string) => {
    setGeneratedVideoUrl(videoUrl);
  };

  const steps = [
    { id: 1, name: 'Script', description: 'Generate your video script' },
    { id: 2, name: 'Template', description: 'Choose video style' },
    { id: 3, name: 'Generate', description: 'Create your video' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <IconVideo className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SurvivingVid</h1>
            </div>
            <div className="text-sm text-gray-600">
              AI Video Generation Platform
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                    ${currentStep >= step.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <IconCheck className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-4 mr-8">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <ScriptGenerator onScriptGenerated={handleScriptGenerated} />
            )}

            {currentStep === 2 && script && (
              <>
                <Card title="Your Generated Script">
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{script.description}</p>
                      </div>
                      <div className="space-y-3">
                        {script.segments.map((segment, index) => (
                          <div key={segment.id} className="border-l-4 border-blue-500 pl-4">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Segment {index + 1}
                            </div>
                            <div className="text-sm text-gray-700">{segment.narrative}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <TemplateSelector
                  selectedTemplate={selectedTemplate?.id}
                  onTemplateSelect={handleTemplateSelect}
                />
              </>
            )}

            {currentStep === 3 && script && selectedTemplate && (
              <VideoGenerator
                script={script}
                template={selectedTemplate}
                onComplete={handleVideoGenerated}
              />
            )}
          </div>

          {/* Right Column - Preview/Info */}
          <div className="space-y-6">
            <Card title="How It Works">
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Generate Script</h4>
                      <p className="text-sm text-gray-600">
                        Our AI creates a professional script based on your topic
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        2
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Choose Template</h4>
                      <p className="text-sm text-gray-600">
                        Select from our professionally designed video templates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        3
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Generate Video</h4>
                      <p className="text-sm text-gray-600">
                        We'll generate images, audio, and assemble your final video
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* API Status */}
            <Card title="System Status">
              <CardBody>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Script Generation</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Image Generation</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Audio Generation</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}