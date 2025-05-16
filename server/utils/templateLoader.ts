import fs from 'fs';
import path from 'path';

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
    const templatePath = path.join(process.cwd(), 'public', 'templates', templateType, 'template.tex');
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
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
\\\usepackage[margin=1in]{geometry}
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
  // This function can be implemented to update system prompts with templates
  // For now, this is a placeholder
  console.log('Templates loaded and ready for use');
}