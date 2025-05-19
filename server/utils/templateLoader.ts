import fs from 'fs';
import path from 'path';
import * as prompts from './prompts';

/**
 * Template types supported by the application
 */
export enum TemplateType {
  BASIC = 'basic',
  SLIDE = 'slide',
  REPORT = 'report',
  LETTER = 'letter',
  BOOK = 'book'
}

/**
 * Loads a LaTeX template from the filesystem
 * @param templateType The type of template to load
 * @returns The template content as a string
 */
export async function loadTemplate(templateType: TemplateType): Promise<string> {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const fileOptions = [
      path.join(templatesDir, templateType, 'template.tex'),
      path.join(templatesDir, `${templateType}-template.tex`),
      path.join(templatesDir, `${templateType}.tex`)
    ];

    for (const file of fileOptions) {
      if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8');
      }
    }

    // Fall back to embedded templates if file doesn't exist
    return getEmbeddedTemplate(templateType);
  } catch (error) {
    console.error(`Error loading template ${templateType}:`, error);
    return getEmbeddedTemplate(templateType);
  }
}

/**
 * Returns embedded templates as a fallback
 * @param templateType The type of template to return
 * @returns Default template for the specified type
 */
function getEmbeddedTemplate(templateType: TemplateType): string {
  // Default templates if none exist on filesystem
  switch (templateType) {
    case TemplateType.BASIC:
      return `\\documentclass{article}
\\usepackage{amsmath}
\\begin{document}
% Basic document
\\end{document}`;

    case TemplateType.SLIDE:
      return `\\documentclass{beamer}
\\usetheme{Madrid}
\\begin{document}
\\begin{frame}
\\frametitle{Slide Title}
\\end{frame}
\\end{document}`;

    case TemplateType.REPORT:
      // Default report template here
      return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=1in]{geometry}
      \\begin{document}
      \\title{Report Title}
      \\author{Author Name}
      \\date{\\today}

\\maketitle
\\section{Introduction}
% Report content
\\end{document}`;

    case TemplateType.LETTER:
      return `\\documentclass{letter}
\\usepackage{hyperref}
\\signature{Sender Name}
\\begin{document}
\\begin{letter}{Recipient\\\\Address Line 1\\\\Address Line 2}
\\opening{Dear Recipient,}
Letter content goes here.
\\closing{Sincerely,}
\\end{letter}
\\end{document}`;

    case TemplateType.BOOK:
      return `\\documentclass{book}
\\usepackage{lipsum}
\\begin{document}
\\title{Book Title}
\\author{Author Name}
\\date{\\today}
\\maketitle
\\chapter{First Chapter}
\\section{Introduction}
% Book content
\\end{document}`;
    
    default:
      return `\\documentclass{article}
\\begin{document}
% Default template
\\end{document}`;
  }
}

/**
 * Updates the system prompts with custom templates
 * This function should be called during server startup
 */
export async function updateSystemPromptsWithTemplates(): Promise<void> {
  // Load each template from the filesystem and merge it into the
  // system prompt so the AI provider has direct access to the text.
  // Any errors fall back to the embedded templates defined above.
  const templates: Record<TemplateType, string> = {} as Record<TemplateType, string>;

  for (const type of Object.values(TemplateType)) {
    templates[type as TemplateType] = await loadTemplate(type as TemplateType);
  }

  // Build a readable section for the system prompt containing all templates
  const templateSections = Object.entries(templates)
    .map(([type, text]) => {
      const title = type.charAt(0).toUpperCase() + type.slice(1);
      return `### ${title} Template\n\`\`\`latex\n${text}\n\`\`\``;
    })
    .join("\n\n");

  // Append the templates to the global system prompt string
  prompts.LATEX_SYSTEM_PROMPT += `\n\n## Document Templates\n${templateSections}`;

  console.log('Templates loaded and merged into system prompt');
}

