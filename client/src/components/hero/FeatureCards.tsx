import React, { useEffect } from "react";
import { Scale } from "lucide-react";
import "./FeatureCards.css";
import { initFadeInOnScroll } from "../../lib/fadeInOnScroll";

const FeatureCards: React.FC = () => {
  useEffect(() => {
    initFadeInOnScroll();
  }, []);

  return (
    <div className="features-container flex justify-center flex-wrap gap-8 mt-12 w-full">
      <div className="feature-card js-fade-in bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-[350px] transition-all border border-blue-500/20 shadow-md hover:-translate-y-2 hover:border-blue-500/60 hover:shadow-xl">
        <div className="feature-icon bg-gradient-to-br from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Equation Processing</h3>
        <p className="text-white/80 leading-relaxed">
          Complex mathematical expressions converted to perfect LaTeX syntax with precise formatting
        </p>
      </div>
      <div className="feature-card js-fade-in bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-[350px] transition-all border border-blue-500/20 shadow-md hover:-translate-y-2 hover:border-blue-500/60 hover:shadow-xl">
        <div className="feature-icon bg-gradient-to-br from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Adaptive Intelligence</h3>
        <p className="text-white/80 leading-relaxed">
          Our AI adapts to your research style and preferences to deliver personalized LaTeX documents
        </p>
      </div>
      <div className="feature-card js-fade-in bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-[350px] transition-all border border-blue-500/20 shadow-md hover:-translate-y-2 hover:border-blue-500/60 hover:shadow-xl">
        <div className="feature-icon bg-gradient-to-br from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Instant Compilation</h3>
        <p className="text-white/80 leading-relaxed">
          View and download your compiled documents immediately with live preview and PDF export
        </p>
      </div>
    </div>
  );
};

export default FeatureCards;
