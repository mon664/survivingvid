'use client';

import React, { useState } from 'react';
import {
  IconLoader2,
  IconPhoto,
  IconVolume,
  IconVideo,
  IconDownload,
  IconPlayerPlay,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import Card, { CardBody } from '../ui/Card';
import Button from '../ui/Button';

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

interface VideoGeneratorProps {
  script: ScriptData;
  template: Template;
  onComplete?: (videoUrl: string) => void;
}

type GenerationStep = 'idle' | 'images' | 'audio' | 'assembly' | 'completed' | 'error';

interface GenerationProgress {
  current: GenerationStep;
  images: {
    total: number;
    completed: number;
    urls: string[];
  };
  audio: {
    completed: boolean;
    url?: string;
  };
  assembly: {
    completed: boolean;
    progress: number;
    videoUrl?: string;
  };
  error?: {
    message: string;
    step: GenerationStep;
  };
}

export default function VideoGenerator({ script, template, onComplete }: VideoGeneratorProps) {
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 'idle',
    images: {
      total: script.segments.length,
      completed: 0,
      urls: []
    },
    audio: {
      completed: false
    },
    assembly: {
      completed: false,
      progress: 0
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async () => {
    setIsGenerating(true);
    setProgress({
      current: 'images',
      images: {
        total: script.segments.length,
        completed: 0,
        urls: []
      },
      audio: {
        completed: false
      },
      assembly: {
        completed: false,
        progress: 0
      }
    });

    try {
      // Step 1: Generate Images
      await generateImages();

      // Step 2: Generate Audio
      await generateAudio();

      // Step 3: Assemble Video
      await assembleVideo();

      // Complete
      setProgress(prev => ({
        ...prev,
        current: 'completed'
      }));

      setIsGenerating(false);

      if (onComplete && progress.assembly.videoUrl) {
        onComplete(progress.assembly.videoUrl);
      }

    } catch (error) {
      console.error('Video generation failed:', error);
      setProgress(prev => ({
        ...prev,
        current: 'error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          step: prev.current
        }
      }));
      setIsGenerating(false);
    }
  };

  const generateImages = async () => {
    try {
      const imageUrls: string[] = [];

      for (let i = 0; i < script.segments.length; i++) {
        const segment = script.segments[i];

        const response = await fetch('/api/video/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: segment.imagePrompt,
            style: 'realistic',
            count: 1
          })
        });

        if (!response.ok) {
          throw new Error(`Image generation failed for segment ${i + 1}`);
        }

        const data = await response.json();
        imageUrls.push(data.images[0].url);

        setProgress(prev => ({
          ...prev,
          images: {
            ...prev.images,
            completed: i + 1,
            urls: imageUrls
          }
        }));
      }

    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateAudio = async () => {
    try {
      setProgress(prev => ({
        ...prev,
        current: 'audio'
      }));

      // Combine all narratives into one audio
      const fullNarrative = script.segments.map(seg => seg.narrative).join(' ');

      const response = await fetch('/api/video/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullNarrative,
          voice: 'en-US-Wavenet-D',
          language: 'en-US'
        })
      });

      if (!response.ok) {
        throw new Error('Audio generation failed');
      }

      const data = await response.json();

      setProgress(prev => ({
        ...prev,
        current: 'assembly',
        audio: {
          completed: true,
          url: data.audioUrl
        }
      }));

    } catch (error) {
      throw new Error(`Audio generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const assembleVideo = async () => {
    try {
      setProgress(prev => ({
        ...prev,
        current: 'assembly',
        assembly: {
          ...prev.assembly,
          progress: 10
        }
      }));

      const response = await fetch('/api/video/assemble', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          template,
          images: progress.images.urls,
          audioUrl: progress.audio.url
        })
      });

      if (!response.ok) {
        throw new Error('Video assembly failed');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.assembly.progress < 90) {
            return {
              ...prev,
              assembly: {
                ...prev.assembly,
                progress: prev.assembly.progress + 10
              }
            };
          }
          return prev;
        });
      }, 500);

      const data = await response.json();
      clearInterval(progressInterval);

      setProgress(prev => ({
        ...prev,
        assembly: {
          completed: true,
          progress: 100,
          videoUrl: data.videoUrl
        }
      }));

    } catch (error) {
      throw new Error(`Video assembly failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStepStatus = (step: GenerationStep) => {
    const stepOrder: GenerationStep[] = ['images', 'audio', 'assembly'];
    const currentIndex = stepOrder.indexOf(progress.current);
    const stepIndex = stepOrder.indexOf(step);

    if (progress.current === 'error' && step === progress.error?.step) {
      return 'error';
    }

    if (progress.current === 'completed') {
      return 'completed';
    }

    if (currentIndex > stepIndex) {
      return 'completed';
    } else if (currentIndex === stepIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const renderStepIcon = (step: GenerationStep) => {
    const status = getStepStatus(step);

    switch (step) {
      case 'images':
        if (status === 'active') return <IconLoader2 className="w-5 h-5 animate-spin" />;
        if (status === 'completed') return <IconCheck className="w-5 h-5" />;
        if (status === 'error') return <IconAlertCircle className="w-5 h-5" />;
        return <IconPhoto className="w-5 h-5" />;

      case 'audio':
        if (status === 'active') return <IconLoader2 className="w-5 h-5 animate-spin" />;
        if (status === 'completed') return <IconCheck className="w-5 h-5" />;
        if (status === 'error') return <IconAlertCircle className="w-5 h-5" />;
        return <IconVolume className="w-5 h-5" />;

      case 'assembly':
        if (status === 'active') return <IconLoader2 className="w-5 h-5 animate-spin" />;
        if (status === 'completed') return <IconCheck className="w-5 h-5" />;
        if (status === 'error') return <IconAlertCircle className="w-5 h-5" />;
        return <IconVideo className="w-5 h-5" />;

      default:
        return null;
    }
  };

  const getStepColor = (step: GenerationStep) => {
    const status = getStepStatus(step);

    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <Card title={`${script.title} - ${template.name}`}>
        <CardBody>
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            {progress.current === 'completed' && progress.assembly.videoUrl ? (
              <video
                className="w-full h-full rounded-lg"
                controls
                src={progress.assembly.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center">
                <IconVideo className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">
                  {isGenerating ? '비디오 생성 중...' : '"비디오 생성"을 클릭하여 시작'}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Generation Progress */}
      <Card title="생성 진행 상황">
        <CardBody>
          <div className="space-y-4">
            {/* Images Step */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStepColor('images')}`}>
              <div className="flex items-center space-x-3">
                {renderStepIcon('images')}
                <div>
                  <h4 className="font-medium">Generate Images</h4>
                  <p className="text-sm opacity-75">
                    Creating {script.segments.length} images for video segments
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">
                {progress.images.completed}/{progress.images.total}
              </div>
            </div>

            {/* Audio Step */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStepColor('audio')}`}>
              <div className="flex items-center space-x-3">
                {renderStepIcon('audio')}
                <div>
                  <h4 className="font-medium">Generate Audio</h4>
                  <p className="text-sm opacity-75">
                    Converting script to speech
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">
                {progress.audio.completed ? 'Completed' : 'Pending'}
              </div>
            </div>

            {/* Assembly Step */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStepColor('assembly')}`}>
              <div className="flex items-center space-x-3">
                {renderStepIcon('assembly')}
                <div>
                  <h4 className="font-medium">Assemble Video</h4>
                  <p className="text-sm opacity-75">
                    Combining images and audio into final video
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">
                {progress.assembly.progress > 0 ? `${progress.assembly.progress}%` : 'Pending'}
              </div>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mt-6">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((progress.images.completed + (progress.audio.completed ? script.segments.length : 0) + (progress.assembly.progress / 100 * script.segments.length)) / (script.segments.length * 3)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {progress.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <IconAlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800">Generation Failed</h4>
                    <p className="text-sm text-red-600">{progress.error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              {!isGenerating && progress.current !== 'completed' && (
                <Button
                  onClick={generateVideo}
                  className="flex-1"
                  disabled={progress.current !== 'idle'}
                >
                  <IconVideo className="w-4 h-4 mr-2" />
                  비디오 생성
                </Button>
              )}

              {isGenerating && (
                <Button
                  variant="outline"
                  disabled
                  className="flex-1"
                >
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </Button>
              )}

              {progress.current === 'completed' && progress.assembly.videoUrl && (
                <>
                  <Button
                    className="flex-1"
                    onClick={() => window.open(progress.assembly.videoUrl, '_blank')}
                  >
                    <IconPlayerPlay className="w-4 h-4 mr-2" />
                    Play Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = progress.assembly.videoUrl!;
                      link.download = `${script.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
                      link.click();
                    }}
                  >
                    <IconDownload className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}

              {progress.error && (
                <Button
                  onClick={generateVideo}
                  className="flex-1"
                >
                  <IconPlayerPlay className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Script Summary */}
      <Card title="스크립트 요약">
        <CardBody>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">{script.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{script.description}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Segments ({script.segments.length}):</h5>
              <div className="space-y-2">
                {script.segments.map((segment, index) => (
                  <div key={segment.id} className="text-sm">
                    <span className="font-medium">Segment {index + 1}:</span>
                    <span className="text-gray-600 ml-2">{segment.narrative}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}