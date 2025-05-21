import React, { useEffect, useState } from "react";
import "./PromptAnimator.css";
import HeroTitle from "./HeroTitle";

interface Props {
  onGetStarted: () => void;
}

export default function PromptAnimator({ onGetStarted }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Create standalone button element in the DOM
  useEffect(() => {
    // Remove any previous button if it exists
    const existingButton = document.getElementById('standalone-get-started-btn');
    if (existingButton) {
      document.body.removeChild(existingButton);
    }
    
    // Create a completely separate button that will overlay on top of everything
    const standaloneButton = document.createElement('button');
    standaloneButton.id = 'standalone-get-started-btn';
    standaloneButton.textContent = 'Get Started';
    standaloneButton.style.position = 'absolute';
    standaloneButton.style.zIndex = '9999';
    standaloneButton.style.top = '403px'; // Positioned to match the original button
    standaloneButton.style.left = '50%';
    standaloneButton.style.transform = 'translateX(-50%)';
    standaloneButton.style.padding = '0.875rem 2.5rem';
    standaloneButton.style.borderRadius = '50px';
    standaloneButton.style.backgroundColor = '#3b82f6';
    standaloneButton.style.backgroundImage = 'linear-gradient(90deg, #3b82f6, #2563eb)';
    standaloneButton.style.color = 'white';
    standaloneButton.style.fontWeight = '600';
    standaloneButton.style.fontSize = '1.25rem';
    standaloneButton.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.5)';
    standaloneButton.style.border = 'none';
    standaloneButton.style.cursor = 'pointer';
    standaloneButton.style.minWidth = '180px';
    standaloneButton.style.fontFamily = 'inherit';
    
    standaloneButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      standaloneButton.style.transform = 'translateX(-50%) scale(0.95)';
      setTimeout(() => {
        onGetStarted();
        // Remove the button after starting
        document.body.removeChild(standaloneButton);
      }, 100);
    });
    
    // Add hover effects
    standaloneButton.addEventListener('mouseover', () => {
      standaloneButton.style.transform = 'translateX(-50%) translateY(-3px)';
      standaloneButton.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.6)';
    });
    
    standaloneButton.addEventListener('mouseout', () => {
      standaloneButton.style.transform = 'translateX(-50%)';
      standaloneButton.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.5)';
    });
    
    document.body.appendChild(standaloneButton);
    
    return () => {
      // Clean up when component unmounts
      if (document.body.contains(standaloneButton)) {
        document.body.removeChild(standaloneButton);
      }
    };
  }, [onGetStarted]);
  
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

  // This function is now a backup - our standalone button is the primary action
  const handleGetStartedClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onGetStarted();
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
              onTouchStart={handleGetStartedClick}
              aria-label="Get started with AI LaTeX Generator"
              style={{
                fontSize: '1.25rem',
                padding: '0.875rem 2.5rem',
                minWidth: '180px',
                position: 'relative',
                zIndex: 100,
                cursor: 'pointer',
                background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                color: 'white',
                fontWeight: 600,
                borderRadius: '50px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.5)';
              }}
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

