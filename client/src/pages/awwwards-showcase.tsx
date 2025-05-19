import React from 'react';
import SiteLayout from '@/components/layout/site-layout';
import StarfieldBackground from '@/components/visuals/StarfieldBackground';
import CustomCursor from '@/components/visuals/CustomCursor';
import SmoothScrollContainer from '@/components/visuals/SmoothScrollContainer';

export default function AwwwardsShowcase() {
  return (
    <SiteLayout fullHeight={false} seoTitle="Awwwards Visual Showcase" hideFooter={false}>
      <StarfieldBackground />
      <CustomCursor />
      <SmoothScrollContainer>
        <section data-scroll-section className="min-h-screen flex items-center justify-center bg-transparent">
          <h1 data-reveal className="text-5xl font-bold">Awwwards Visual Showcase</h1>
        </section>
        <section data-scroll-section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
          <h2 data-reveal className="text-white text-3xl">Scroll Down to Explore</h2>
        </section>
        <section data-scroll-section className="min-h-screen flex items-center justify-center bg-white">
          <p data-reveal className="text-xl text-gray-800 max-w-prose px-4 text-center">
            This demo combines Three.js, GSAP, and Locomotive Scroll to create smooth transitions and subtle micro‑animations.
          </p>
        </section>
      </SmoothScrollContainer>
    </SiteLayout>
  );
}
