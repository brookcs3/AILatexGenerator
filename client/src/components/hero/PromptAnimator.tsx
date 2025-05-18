import React from "react";

interface PromptAnimatorProps {
  onGetStarted: () => void;
}

const PromptAnimator: React.FC<PromptAnimatorProps> = ({ onGetStarted }) => (
  <>
    <div className="prompt-container">
      <span className="prompt-text"></span>
      <span className="prompt-cursor">|</span>
    </div>
    <div className="cta-button-container">
      <button
        className="cta-button"
        onClick={onGetStarted}
        aria-label="Get started with AI LaTeX Generator"
      >
        Get Started
      </button>
    </div>
    <div className="latex-reveal">
      <div className="latex-code" id="latex-code-container">
        <div id="download-pdf-button" className="download-pdf-button">
          <button
            id="pdf-download-btn"
            className="pdf-download-button"
          >
            <span>Download PDF</span>
          </button>
        </div>
        <pre>{`\\documentclass{article}
\\usepackage{amsmath}
\\begin{document}
\\title{AI Generated Document}
\\author{AI LaTeX Generator}
\\maketitle
\\begin{equation}
  E = mc^2
\\end{equation}
\\end{document}`}</pre>
      </div>
    </div>
  </>
);

export default PromptAnimator;
