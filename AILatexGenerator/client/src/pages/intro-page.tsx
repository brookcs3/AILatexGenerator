import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import HyperIntro from "@/components/hero/HyperIntro";
import DistortionBackground from "@/components/background/DistortionBackground";
import "./intro-page.css";

/**
 * Intro page with animated storytelling experience
 * Features:
 * - Ultra-modern animations using GSAP, Three.js, Splitting.js
 * - Interactive particle system with CRT TV effects
 * - Smooth transitions with scan lines and distortion
 * - Skip button for users who want to directly access the app
 */
const IntroPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDistortionOnly, setShowDistortionOnly] = useState(false);

  // Ensure we start at the top of the page when the component loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show skip button and toggle button after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 1500); // Show after 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Handle completion of the intro animation
  const handleIntroComplete = () => {
    setIsCompleting(true);

    // Add the fade-out class to container
    const container = document.querySelector(".intro-page-container");
    if (container) {
      container.classList.add("fade-out");
    }

    // Navigate to main app after fade animation completes
    setTimeout(() => {
      navigate("/app");
    }, 1000);
  };

  // Handle skip button click with improved mobile support
  const handleSkip = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default to help with mobile
    e.stopPropagation(); // Stop event propagation
    console.log("Skip button clicked");
    handleIntroComplete();
  };

  // Toggle between full intro and just distortion background
  const toggleDistortionOnly = () => {
    setShowDistortionOnly(!showDistortionOnly);
  };

  return (
    <div className={`intro-page-container ${isCompleting ? "fade-out" : ""} ${showDistortionOnly ? "distortion-only" : ""}`}>
      {/* Distortion background effect */}
      <div className="distortion-container">
        <DistortionBackground />
      </div>
      
      {/* Main intro animation component - only show if not in distortion-only mode */}
      {!showDistortionOnly && <HyperIntro onComplete={handleIntroComplete} />}
      
      {/* Explanation text when in distortion-only mode */}
      {showDistortionOnly && (
        <div className="distortion-explanation">
          <h2>TV Distortion Effects</h2>
          <p>This screen demonstrates our CRT TV effects with scan lines, static, and glitch animations.</p>
          <p>These visual effects provide the retro-futuristic aesthetic for the LaTeX generator application.</p>
          <button 
            className="return-button"
            onClick={() => setShowDistortionOnly(false)}
          >
            Return to Full Intro
          </button>
        </div>
      )}
    </div>
  );
};

export default IntroPage;
