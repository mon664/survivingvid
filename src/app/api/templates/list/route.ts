import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'assets', 'templates');

export async function GET() {
  try {
    // Read templates directory
    const templateDirs = await fs.readdir(TEMPLATES_DIR);

    const templates = [];

    for (const dir of templateDirs) {
      const templatePath = path.join(TEMPLATES_DIR, dir);
      const stat = await fs.stat(templatePath);

      if (stat.isDirectory()) {
        try {
          const templateData = await fs.readFile(
            path.join(templatePath, 'Template.json'),
            'utf-8'
          );

          const template = JSON.parse(templateData);

          // Add template metadata
          templates.push({
            id: template.Id,
            name: template.TemplateName,
            directory: dir,
            backgroundColor: template.BackgroundColor,
            isDefault: template.IsDefault,
            topHeightPercent: template.TopHeightPercent,
            bottomHeightPercent: template.BottomHeightPercent,
            hasStickers: template.Stickers && template.Stickers.length > 0,
            hasShapes: template.Shapes && template.Shapes.length > 0,
            textCount: template.FixedTexts ? template.FixedTexts.length : 0
          });
        } catch (error) {
          console.error(`Error reading template ${dir}:`, error);
          // Skip invalid templates
        }
      }
    }

    // Sort templates: default first, then alphabetically
    templates.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      templates,
      metadata: {
        totalTemplates: templates.length,
        defaultTemplate: templates.find(t => t.isDefault)?.name || null,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Template list error:', error);

    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateName, backgroundColor, customSettings } = await request.json();

    // Validate input
    if (!templateName || typeof templateName !== 'string') {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Create a simple template (you can expand this based on your needs)
    const newTemplate = {
      Id: generateUUID(),
      IsDefault: false,
      TemplateName: templateName,
      BackgroundColor: backgroundColor || '#FFFFFFFF',
      TopHeightPercent: 15.0,
      BottomHeightPercent: 15.0,
      FixedTexts: [
        {
          FontColorAsColor: { A: 255, R: 0, G: 0, B: 0 },
          X: 0.05,
          Y: 0.05,
          Content: "Your Title",
          FontSize: 48.0,
          FontColor: "#000000",
          FontFamilyName: "Segoe UI Bold",
          IsBold: true
        },
        {
          FontColorAsColor: { A: 255, R: 100, G: 100, B: 100 },
          X: 0.05,
          Y: 0.85,
          Content: "Your Description",
          FontSize: 32.0,
          FontColor: "#646464",
          FontFamilyName: "Segoe UI",
          IsBold: false
        }
      ],
      Stickers: [],
      Shapes: []
    };

    // Create directory for new template
    const safeTemplateName = templateName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const templateDir = path.join(TEMPLATES_DIR, safeTemplateName);

    await fs.mkdir(templateDir, { recursive: true });

    // Save template file
    await fs.writeFile(
      path.join(templateDir, 'Template.json'),
      JSON.stringify(newTemplate, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Template creation error:', error);

    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}