import { useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";

export default function FAQ() {
  useEffect(() => {
    document.title = "FAQ - AI LaTeX Generator";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Frequently asked questions about the AI LaTeX Generator service.'
      );
    }
  }, []);

  const faqs = [
    {
      q: "How can I quickly generate LaTeX for academic papers?",
      a: "Enter your requirements and select the Article template. The AI generates formatted LaTeX with citations and equations."
    },
    {
      q: "Is there a free tier?",
      a: "Yes, you can generate up to three documents per month at no cost."
    },
    {
      q: "Can I use my own LaTeX templates?",
      a: "Absolutely. Upload a custom template and the AI will fill in the content sections for you."
    },
    {
      q: "Do you offer team or enterprise plans?",
      a: "We provide multi-seat licenses for universities and businesses. Contact support for details."
    }
  ];

  return (
    <SiteLayout seoTitle="FAQ - AI LaTeX Generator">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{item.q}</h2>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
