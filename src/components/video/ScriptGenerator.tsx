'use client';

import React, { useState } from 'react';
import { IconBulb, IconLoader } from '@tabler/icons-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardBody } from '../ui/Card';

interface ScriptData {
  segments: Array<{
    id: number;
    narrative: string;
    imagePrompt: string;
  }>;
  title: string;
  description: string;
}

interface ScriptGeneratorProps {
  onScriptGenerated: (script: ScriptData) => void;
}

export default function ScriptGenerator({ onScriptGenerated }: ScriptGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('educational');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/video/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      if (data.success && data.script) {
        onScriptGenerated(data.script);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Generate Video Script" description="Enter a topic and our AI will create a script for your video">
      <CardBody>
        <div className="space-y-4">
          <Input
            label="Video Topic"
            placeholder="e.g., Climate Change, Digital Marketing, Space Exploration"
            value={topic}
            onChange={setTopic}
            required
            dataTestId="topic-input"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="style-select"
            >
              <option value="educational">Educational</option>
              <option value="entertainment">Entertainment</option>
              <option value="marketing">Marketing</option>
              <option value="documentary">Documentary</option>
              <option value="storytelling">Storytelling</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerateScript}
            loading={loading}
            disabled={!topic.trim() || loading}
            className="w-full"
            dataTestId="generate-script-button"
          >
            {loading ? (
              <>
                <IconLoader className="animate-spin mr-2 h-4 w-4" />
                Generating Script...
              </>
            ) : (
              <>
                <IconBulb className="mr-2 h-4 w-4" />
                Generate Script
              </>
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}