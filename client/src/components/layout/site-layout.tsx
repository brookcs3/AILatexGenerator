import Header from "./header";
import Footer from "./footer";
import { ReactNode } from "react";
import { VisuallyHiddenHeading } from "@/components/seo/visually-hidden-heading";
import CanonicalLink from "@/components/seo/canonical-link";
import MobileDisclaimer from "@/components/dialogs/mobile-disclaimer";
import CustomCursor from "@/components/visuals/CustomCursor";

interface SiteLayoutProps {
  children: ReactNode;
  fullHeight?: boolean;
  seoTitle?: string;
  hideFooter?: boolean;
}

export default function SiteLayout({ 
  children, 
  fullHeight = true, 
  seoTitle = "AI LaTeX Generator for Students",
  hideFooter = true
}: SiteLayoutProps) {
  return (
    <div className={`flex flex-col ${fullHeight ? 'h-screen' : 'min-h-screen'}`}>
      <Header />
      {/* Dynamically update canonical URL for each route */}
      <CanonicalLink />
      <main className={fullHeight ? "flex-1 overflow-y-auto" : "flex-1"}>
        {/* Visually hidden H1 for SEO purposes */}
        <VisuallyHiddenHeading>{seoTitle}</VisuallyHiddenHeading>
        {children}
      </main>
      {!hideFooter && <Footer />}
      
      {/* Mobile disclaimer popup - enable by setting VITE_SHOW_MOBILE_DISCLAIMER=true */}
      <MobileDisclaimer />
      
      {/* Custom cursor effect applied to all pages */}
      <CustomCursor />
    </div>
  );
}
