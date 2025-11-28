'use client';

import React, { useState, useEffect } from 'react';
import { IconTemplate, IconLoader } from '@tabler/icons-react';
import Card, { CardBody } from '../ui/Card';

interface Template {
  id: string;
  name: string;
  directory: string;
  backgroundColor: string;
  isDefault: boolean;
  topHeightPercent: number;
  bottomHeightPercent: number;
  hasStickers: boolean;
  hasShapes: boolean;
  textCount: number;
}

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: Template) => void;
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load templates');
      }

      if (data.success && data.templates) {
        setTemplates(data.templates);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="Select Template">
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <IconLoader className="animate-spin mr-2 h-5 w-5" />
            Loading templates...
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Select Template">
        <CardBody>
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadTemplates}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      title="Select Template"
      description="Choose a template for your video style"
    >
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => onTemplateSelect(template)}
              data-testid={`template-${template.directory}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className="w-12 h-16 rounded border-2 border-gray-300 flex items-center justify-center"
                    style={{ backgroundColor: template.backgroundColor }}
                  >
                    <IconTemplate className="h-6 w-6" style={{
                      color: template.backgroundColor === '#000000' ? '#FFFFFF' : '#000000'
                    }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {template.textCount} text elements
                    {template.hasShapes && ' • Shapes'}
                    {template.hasStickers && ' • Stickers'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <IconTemplate className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first template.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}