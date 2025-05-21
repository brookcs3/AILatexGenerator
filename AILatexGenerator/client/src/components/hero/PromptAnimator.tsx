import React, { useEffect, useState } from "react";
import VanillaTilt from "vanilla-tilt";
import "./PromptAnimator.css";
import HeroTitle from "./HeroTitle";

interface Props {
  onGetStarted: () => void;
}

export default function PromptAnimator({ onGetStarted }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const btn = document.querySelector('.cta-button') as HTMLElement | null;
    if (btn) {
      VanillaTilt.init(btn, {
        max: 12,
        speed: 400,
        scale: 1.05,
        glare: true,
        "max-glare": 0.3,
      });
    }
    return () => {
      if (btn && (btn as any).vanillaTilt) {
        (btn as any).vanillaTilt.destroy();
      }
    };
  }, []);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        window.innerWidth < 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0);
    };
    
    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Enhanced click handler for better mobile support
  const handleGetStartedClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Create visible feedback for mobile users
    if (isMobile) {
      const button = e.currentTarget as HTMLButtonElement;
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
        onGetStarted();
      }, 150);
    } else {
      onGetStarted();
    }
  };
  
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
              onClick={handleGetStartedClick}
              onTouchEnd={isMobile ? handleGetStartedClick : undefined}
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

