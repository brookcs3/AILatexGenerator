import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./HyperIntro.css";
import HeroTitle from "./HeroTitle";
import PromptAnimator from "./PromptAnimator";
import FeatureCards from "./FeatureCards";

// Modern intro component with professional animation effects

interface HyperIntroProps {
  onComplete?: () => void;
}

const HyperIntro: React.FC<HyperIntroProps> = ({ onComplete }) => {
  // References for DOM elements
  const introContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const gradientBackgroundRef = useRef<HTMLDivElement>(null);
  const waveAnimationRef = useRef<HTMLDivElement>(null);

  // Create gradient background and wave animation
  useEffect(() => {
    try {
      
      // Create beautiful gradient background animation
      if (gradientBackgroundRef.current) {
        const background = gradientBackgroundRef.current;

        // Animate the gradient background with complementary blue theme
        gsap.to(background, {
          background:
            "linear-gradient(135deg, #D2FCF3 0%, #ABF5FF 50%, #93c5fd 70%, #fffff 84%, #e0f2fe 100%)",
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Create particles for background effect
      if (particlesRef.current) {
        const particlesContainer = particlesRef.current;
        particlesContainer.innerHTML = "";
        particlesContainer.style.position = "absolute";
        particlesContainer.style.top = "0";
        particlesContainer.style.left = "0";
        particlesContainer.style.width = "100%";
        particlesContainer.style.height = "100%";
        particlesContainer.style.overflow = "hidden";
        particlesContainer.style.pointerEvents = "none";

        // Create particles with professional colors
        const particleCount = 60;
        const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#7CFFC9", "#ec4899"];

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement("div");
          particle.className = "particle";

          // Random position
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;

          // Random size - keeping these smaller and more subtle
          const size = Math.random() * 3 + 1;

          // Random color from our palette
          const color = colors[Math.floor(Math.random() * colors.length)];

          // Set particle styles
          particle.style.position = "absolute";
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.borderRadius = "50%";
          particle.style.backgroundColor = color;
          particle.style.boxShadow = `0 0 ${size}px ${color}`;
          particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;

          // Add smooth animation with keyframes
          const duration = Math.random() * 20 + 15;
          const delay = Math.random() * 5;

          // Create unique animation name
          const animName = `float-${i}`;

          // Create and append style with keyframes
          const style = document.createElement("style");
          style.innerHTML = `
            @keyframes ${animName} {
              0% {
                transform: translate(0, 0);
              }
              25% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
              }
              50% {
                transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
              }
              75% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
              }
              100% {
                transform: translate(0, 0);
              }
            }
          `;
          document.head.appendChild(style);

          // Apply animation
          particle.style.animation = `${animName} ${duration}s ease-in-out ${delay}s infinite`;

          // Add to container
          particlesContainer.appendChild(particle);
        }
      }

      // Create wave animation effects
      if (waveAnimationRef.current) {
        const waveContainer = waveAnimationRef.current;
        waveContainer.innerHTML = "";

        // Create wave elements
        for (let i = 0; i < 3; i++) {
          const wave = document.createElement("div");
          wave.className = `wave wave-${i + 1}`;
          waveContainer.appendChild(wave);

          // Animate each wave
          gsap.to(wave, {
            y: -10,
            x: i * 5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        }
      }
    } catch (error) {
      console.error("Error creating animations:", error);
    }
  }, []);

  // Text animation sequence with GSAP
  useEffect(() => {
    try {
      if (textContainerRef.current) {
        const timeline = gsap.timeline({
          defaults: { duration: 0.8, ease: "power3.out" },
        });

        // Create text animation for TV screen effect
        const tvContainer = textContainerRef.current.querySelector(
          ".tv-effect-container",
        );
        const title = textContainerRef.current.querySelector(".hero-title");
        const subtitle =
          textContainerRef.current.querySelector(".hero-subtitle");
        const latexCode = textContainerRef.current.querySelector(".latex-code");
        const cta = textContainerRef.current.querySelector(".cta-button");

        if (tvContainer && title && subtitle && latexCode && cta) {
          // First make the TV container visible with a power-on effect
          timeline
            .from(tvContainer, {
              opacity: 0,
              duration: 1.14,
              onStart: () => {
                // Add a TV static noise when it turns on
                const staticSound = new Audio(
                  "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
                );
                staticSound.volume = 0.2;
                staticSound
                  .play()
                  .catch((e) => console.log("Audio play prevented by browser"));
              },
            })
            .from(title, {
              opacity: 0,
              filter: "blur(10px)",
              duration: 0.5,
            })
            .from(
              subtitle,
              {
                opacity: 0,
                y: 20,
                duration: 0.5,
              },
              "-=0.2",
            )
            .to(title, {
              opacity: 0.2,
              yoyo: true,
              repeat: 3,
              duration: 0.1,
              ease: "none",
            })
            .from(
              cta,
              {
                opacity: 0,
                y: 20,
                scale: 0.9,
                duration: 0.6,
              },
              "+=0.5",
            );

          // Add glitch effects to the TV
          gsap.to(tvContainer, {
            scale: 1.01,
            x: 3,
            duration: 0.1,
            repeat: -3,
            yoyo: true,
            ease: "none",
            repeatDelay: 5,
          });

          // Add occasional blur spikes for TV static effect
          const createBlurSpike = () => {
            // Random interval between 3-10 seconds
            const interval = Math.random() * 7000 + 3000;

            // Create the spike effect with random intensity
            setTimeout(() => {
              // Random blur intensity
              const blurAmount = Math.random() * 8 + 2;

              // Apply the autofocus struggle effect with over/under focusing
              // Start with sudden blur
              gsap.to(tvContainer, {
                filter: `blur(${blurAmount}px)`,
                duration: 0.08,
                transform: "scale(1.1)",
                onComplete: () => {
                  // Quick attempt to focus but overshoot (too sharp)
                  gsap.to(tvContainer, {
                    filter: `blur(0px) contrast(1.2)`,
                    duration: 0.12,
                    onComplete: () => {
                      // Overcorrect to blurry again
                      gsap.to(tvContainer, {
                        filter: `blur(${blurAmount * 0.7}px)`,
                        duration: 0.15,
                        onComplete: () => {
                          // Too sharp again
                          gsap.to(tvContainer, {
                            filter: `blur(0px) contrast(1.1)`,
                            duration: 0.15,
                            onComplete: () => {
                              // Subtle blur
                              gsap.to(tvContainer, {
                                filter: `blur(${blurAmount * 4.3}px)`,
                                transform: `scale(1.12)`,
                                duration: 1.15,
                                onComplete: () => {
                                  // Finally settle on proper focus
                                  gsap.to(tvContainer, {
                                    filter: "blur(0px)",
                                    duration: 0.1,
                                    onComplete: createBlurSpike, // Create next spike
                                  });
                                },
                              });
                            },
                          });
                        },
                      });
                    },
                  });
                },
              });
            }, interval - 700);
          };

          // Start the effect
          createBlurSpike();
        }

        // Animate the title with typewriter effect
        if (title) {
          const fullText = "AI  LaTeX   Generator";
          title.textContent = "";

          let charIndex = 0;
          const typeTitle = () => {
            if (charIndex < fullText.length) {
              title.textContent += fullText.charAt(charIndex);
              charIndex++;
              setTimeout(typeTitle, 80); // Speed of typing
            } else {
              // When title is complete, start animating the prompts
              animatePrompts();
            }
          };

          // Start typing after a small delay
          setTimeout(typeTitle, 500);
        }

        // Animate the prompts with typing/deleting effect
        const animatePrompts = () => {
          const promptText = document.querySelector(
            ".prompt-text",
          ) as HTMLElement;
          const latexReveal = document.querySelector(
            ".latex-reveal",
          ) as HTMLElement;

          if (promptText && latexReveal) {
            // Array of prompts to cycle through with corresponding LaTeX templates
            const promptsWithTemplates = [
              {
                prompt: "Create a paper about quantum computing",
                latex: `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{Introduction to Quantum Computing}
\\author{AI LaTeX Generator}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
This paper provides an introduction to quantum computing concepts including quantum bits, superposition, and quantum algorithms.
\\end{abstract}

\\section{Introduction}
Quantum computing is an emerging field that utilizes quantum mechanical phenomena...

\\section{Quantum Bits}
Unlike classical bits, quantum bits (qubits) can exist in superpositions of states...

\\begin{equation}
|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle
\\end{equation}

\\section{Quantum Algorithms}
\\subsection{Shor's Algorithm}
Provides exponential speedup for integer factorization...
\\end{document}`,
                previewImage: "/images/latex-previews/quantum-paper.svg",
              },
              {
                prompt: "Convert my essay into a slideshow",
                latex: `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{dolphin}
\\title{Presentation Title}
\\author{AI LaTeX Generator}
\\date{\\today}

\\begin{document}

\\begin{frame}
\\titlepage
\\end{frame}

\\begin{frame}{Introduction}
\\begin{itemize}
    \\item First major point to introduce your topic
    \\item Second key concept or idea
    \\item Why this topic matters to your audience
\\end{itemize}
\\end{frame}

\\begin{frame}{Main Arguments}
\\begin{enumerate}
    \\item First supporting evidence or argument
    \\item Second key point with more details
    \\item Analysis connecting your points
\\end{enumerate}
\\end{frame}

\\begin{frame}{Visual Data}
\\begin{figure}
    \\centering
    % A placeholder for an image
    \\rule{8cm}{6cm}
    \\caption{Figure Description}
\\end{figure}
\\end{frame}

\\begin{frame}{Conclusion}
\\begin{block}{Summary}
    Your concluding thoughts and final message.
\\end{block}
\\end{frame}

\\end{document}`,
                previewImage: "/images/latex-previews/slideshow.svg",
              },
              {
                prompt: "Generate a mathematical report template",
                latex: `\\documentclass{article}
\\usepackage{amsmath,amsthm,amssymb}
\\usepackage{graphicx}

\\title{Mathematical Analysis Report}
\\author{AI LaTeX Generator}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Problem Statement}
Define the problem and establish notation...

\\section{Methodology}
\\subsection{Assumptions}
The following assumptions are made:
\\begin{enumerate}
    \\item The function $f(x)$ is continuous on $[a,b]$
    \\item The boundary conditions are...
\\end{enumerate}

\\subsection{Derivation}
Starting with the general form:
\\begin{align}
\\frac{d^2y}{dx^2} + p(x)\\frac{dy}{dx} + q(x)y = f(x)
\\end{align}

\\section{Results}
\\begin{figure}[h]
    \\centering
    % Placeholder for graph
    \\caption{Solution behavior as parameters vary}
\\end{figure}

\\section{Conclusion}
The analysis shows that the solution converges when...

\\begin{thebibliography}{9}
\\bibitem{ref1} Author, A. (Year). Title. Journal, Volume(Issue), Pages.
\\end{thebibliography}
\\end{document}`,
                previewImage: "/images/latex-previews/math-report.svg",
              },
              {
                prompt: "Format my research notes into a document",
                latex: `\\documentclass{article}
\\usepackage{blindtext}
\\usepackage{hyperref}
\\usepackage{natbib}

\\title{Research Notes: Topic Exploration}
\\author{AI LaTeX Generator}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Literature Review}
\\subsection{Key Papers}
\\begin{itemize}
    \\item Smith et al. (2023) found that...
    \\item According to Johnson (2022), the primary mechanism is...
    \\item Recent studies indicate a correlation between variables (Wong, 2024).
\\end{itemize}

\\section{Research Questions}
\\begin{enumerate}
    \\item How does factor X influence outcome Y?
    \\item What are the underlying mechanisms of process Z?
    \\item Can the model be improved by incorporating feature W?
\\end{enumerate}

\\section{Methodology Notes}
\\begin{tabular}{|p{3cm}|p{8cm}|}
\\hline
\\textbf{Technique} & \\textbf{Application} \\\\
\\hline
Method A & Suitable for analysis of time series data \\\\
\\hline
Method B & Better for categorical variables \\\\
\\hline
\\end{tabular}

\\section{Next Steps}
\\begin{itemize}
    \\item Collect additional data on...
    \\item Re-analyze using the refined model
    \\item Prepare visualization for key findings
\\end{itemize}

\\end{document}`,
                previewImage: "/images/latex-previews/research-notes.svg",
              },
              {
                prompt: "Create a scientific poster layout",
                latex: `\\documentclass[final]{beamer}
\\usepackage[scale=1.24]{beamerposter}
\\usetheme{confposter}
\\usepackage{graphicx}
\\usepackage{booktabs}

\\title{Scientific Research Poster}
\\author{AI LaTeX Generator}
\\institute{University Department}

\\begin{document}
\\begin{frame}{}
  \\begin{columns}[t]
    \\begin{column}{.32\\linewidth}
      \\begin{block}{Introduction}
        \\begin{itemize}
          \\item Background of the research problem
          \\item Significance and practical implications
          \\item Research objectives and hypotheses
        \\end{itemize}
      \\end{block}
      
      \\begin{block}{Methodology}
        \\begin{itemize}
          \\item Study design
          \\item Sampling procedure
          \\item Data collection methods
          \\item Analytical approach
        \\end{itemize}
      \\end{block}
    \\end{column}
    
    \\begin{column}{.32\\linewidth}
      \\begin{block}{Results}
        % Placeholder for a figure
        \\centering
        Key findings:
        \\begin{itemize}
          \\item Finding 1 with statistical significance
          \\item Finding 2 with implications
          \\item Unexpected observations
        \\end{itemize}
      \\end{block}
    \\end{column}
    
    \\begin{column}{.32\\linewidth}
      \\begin{block}{Discussion}
        \\begin{itemize}
          \\item Interpretation of results
          \\item Comparison with existing literature
          \\item Limitations of the study
          \\item Future research directions
        \\end{itemize}
      \\end{block}
      
      \\begin{block}{Conclusions}
        Summary of the main findings and their implications.
      \\end{block}
      
      \\begin{block}{References}
        Selected key references in the field.
      \\end{block}
    \\end{column}
  \\end{columns}
\\end{frame}
\\end{document}`,
                previewImage: "/images/latex-previews/scientific-poster.svg",
              },
            ];

            // Convert to simple prompts array for animation
            const prompts = promptsWithTemplates.map((item) => item.prompt);

            let currentPromptIndex = 0;
            let currentCharIndex = 0;
            let isDeleting = false;
            let typingSpeed = 80; // milliseconds
            let pauseDuration = 1500; // pause at complete text
            let showingLatex = false;

            // Function to handle the animation cycle
            const animationCycle = () => {
              const currentPrompt = prompts[currentPromptIndex];

              if (showingLatex) {
                // Hide the latex reveal and reset
                gsap.to(latexReveal, {
                  opacity: 0,
                  scale: 0.95,
                  duration: 0.8,
                  onComplete: () => {
                    gsap.set(promptText, { opacity: 1 });
                    showingLatex = false;
                    isDeleting = false;
                    currentCharIndex = 0;
                    currentPromptIndex =
                      (currentPromptIndex + 1) % prompts.length;
                    setTimeout(animationCycle, 500); // Continue with next prompt
                  },
                });
                return;
              }

              if (isDeleting) {
                // Deleting
                promptText.textContent = currentPrompt.substring(
                  0,
                  currentCharIndex - 1,
                );
                currentCharIndex--;
                typingSpeed = 40; // Faster when deleting

                // When completely deleted, start next prompt or show latex
                if (currentCharIndex === 0) {
                  isDeleting = false;

                  // Show the LaTeX code with distortion effect
                  showingLatex = true;

                  // Distortion effect for "processing" prompt
                  const distort = () => {
                    // Create glitch effect on TV
                    const tvGlitch = document.querySelector(
                      ".tv-glitch",
                    ) as HTMLElement;
                    if (tvGlitch) {
                      gsap.to(tvGlitch, {
                        opacity: 0.8,
                        duration: 0.1,
                        repeat: 5,
                        yoyo: true,
                        ease: "none",
                      });
                    }

                    // Update the LaTeX content based on current prompt
                    const latexContainer = document.querySelector(
                      "#latex-code-container pre",
                    ) as HTMLElement;
                    if (latexContainer) {
                      // Use the corresponding LaTeX template for this prompt
                      latexContainer.textContent =
                        promptsWithTemplates[currentPromptIndex].latex;
                    }

                    // Hide prompt text during distortion
                    gsap.to(promptText, {
                      opacity: 0,
                      scale: 1.05,
                      duration: 0.3,
                    });

                    // Add more intense distortion effect
                    const screen = document.querySelector(
                      ".tv-screen",
                    ) as HTMLElement;
                    if (screen) {
                      // Create a distortion effect that stays in the blue/light color range
                      gsap.to(screen, {
                        filter:
                          "hue-rotate(210deg) brightness(1.05) contrast(1.1)",
                        duration: 0.2,
                        repeat: 3,
                        yoyo: true,
                        ease: "power2.inOut",
                        onComplete: () => {
                          gsap.to(screen, {
                            filter:
                              "hue-rotate(0deg) brightness(1) contrast(1)",
                            duration: 0.2,
                          });
                        },
                      });
                    }

                    // Show LaTeX with glitch entrance - faster animation
                    gsap.to(latexReveal, {
                      opacity: 1,
                      scale: 1,
                      duration: 0.5, // Reduced from 1s to 0.5s
                      delay: 0,
                      onComplete: () => {
                        // Get the download button and show it with a delay
                        const downloadButton = document.getElementById("download-pdf-button");
                        if (downloadButton) {
                          // First ensure it's hidden
                          gsap.set(downloadButton, { opacity: 0 });
                          
                          // Then animate it in after a delay
                          gsap.to(downloadButton, {
                            opacity: 1,
                            duration: 0.5,
                            delay: 1, // 1 second delay after LaTeX appears
                            ease: "power2.inOut"
                          });
                        }
                      }
                    });

                    // Schedule hiding the LaTeX after some time
                    setTimeout(() => {
                      animationCycle();
                    }, 5000); // Show LaTeX for 5 seconds
                  };

                  // Start distortion effect
                  setTimeout(distort, 1000); // Reduced from 3000ms to 1000ms (1 second)
                  return;
                }
              } else {
                // Typing
                promptText.textContent = currentPrompt.substring(
                  0,
                  currentCharIndex + 1,
                );
                currentCharIndex++;
                typingSpeed = 80; // Normal typing speed

                // When completed typing the prompt
                if (currentCharIndex === currentPrompt.length) {
                  isDeleting = true;
                  typingSpeed = pauseDuration; // Pause before deleting
                }
              }

              // Continue the animation cycle
              setTimeout(animationCycle, typingSpeed);
            };

            // Start the animation cycle
            animationCycle();
          }
        };

        // Animate content with glitch effects
        const scheduleRandomGlitches = () => {
          const tv = document.querySelector(".tv-screen") as HTMLElement;

          if (tv) {
            // Create a random glitch effect
            const randomGlitch = () => {
              // Only apply glitch if user is still on the page
              if (document.visibilityState === "visible") {
                gsap.to(tv, {
                  filter: "brightness(1.2) contrast(1.2)",
                  x: Math.random() * 4 - 2,
                  skewX: Math.random() * 2 - 1,
                  duration: 0.1,
                  onComplete: () => {
                    gsap.to(tv, {
                      filter: "brightness(1) contrast(1)",
                      x: 0,
                      skewX: 0,
                      duration: 0.2,
                    });
                  },
                });
              }

              // Schedule next random glitch
              setTimeout(randomGlitch, Math.random() * 5000 + 3000);
            };

            // Start the random glitches
            setTimeout(randomGlitch, 2000);
          }
        };

        // Start the random glitches
        scheduleRandomGlitches();

        // Animate feature cards with stagger
        const cards = document.querySelectorAll(".feature-card");
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.4)",
          delay: 1,
        });
      }
    } catch (error) {
      console.error("Error animating text:", error);
    }
  }, []);

  // Page transitions using GSAP
  useEffect(() => {
    try {
      // Create fade-in animation on component mount
      if (introContainerRef.current) {
        gsap.fromTo(
          introContainerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
          },
        );
      }
    } catch (error) {
      console.error("Error with page transitions:", error);
    }

    return () => {
      // Clean up any animations on unmount
      if (introContainerRef.current) {
        gsap.killTweensOf(introContainerRef.current);
      }
    };
  }, []);

  // Handle click on Get Started button
  const handleGetStartedClick = () => {
    if (onComplete && introContainerRef.current) {
      // Create exit animation
      gsap.to(introContainerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        onComplete: onComplete,
      });
    }
  };

  return (
    <div ref={introContainerRef} className="intro-container">
      {/* Gradient background */}
      <div ref={gradientBackgroundRef} className="gradient-background"></div>

      {/* Particles effect */}
      <div ref={particlesRef} className="particles-container"></div>

      {/* Wave animation */}
      <div ref={waveAnimationRef} className="wave-container"></div>

      {/* Main content */}
      <div ref={textContainerRef} className="content-container">
        <div className="hero-section">
          <div className="tv-effect-container">
            <div className="tv-screen">
              <div className="scanlines"></div>
              <div className="tv-content">
                <HeroTitle />
                <PromptAnimator onGetStarted={handleGetStartedClick} />
              </div>
              <div className="tv-glitch"></div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <FeatureCards />
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span>Scroll to Explore</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </div>
    </div>
  );
};

export default HyperIntro;
