import React from "react";
import "./PromptAnimator.css";
import HeroTitle from "./HeroTitle";

interface Props {
  onGetStarted: () => void;
}

export default function PromptAnimator({ onGetStarted }: Props) {
  const handleDownload = () => {
    const latexCodeContainer = document.getElementById("latex-code-container");
    let latexCode = "";
    if (latexCodeContainer) {
      const preElement = latexCodeContainer.querySelector("pre");
      if (preElement) {
        latexCode = preElement.textContent || "";
      }
    }

    const link = document.createElement("a");
    const currentPromptText = document.querySelector(".prompt-text")?.textContent || "";
    let pdfFile = "";
    if (currentPromptText.includes("quantum computing")) {
      pdfFile = "/quantum_paper.pdf";
    } else if (currentPromptText.includes("slideshow")) {
      pdfFile = "/essay_slideshow.pdf";
    } else if (currentPromptText.includes("mathematical report")) {
      pdfFile = "/math_report.pdf";
    } else if (currentPromptText.includes("research notes")) {
      pdfFile = "/research_notes.pdf";
    } else if (currentPromptText.includes("scientific poster")) {
      pdfFile = "/scientific_poster.pdf";
    } else {
      pdfFile = "/math_report.pdf";
    }
    link.href = pdfFile;
    link.download = pdfFile.substring(1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tv-effect-container">
      <div className="tv-screen">
        <div className="scanlines" />
        <div className="tv-content">
          <HeroTitle />
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
                  onClick={handleDownload}
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
        </div>
        <div className="tv-glitch" />
      </div>
    </div>
  );
}

