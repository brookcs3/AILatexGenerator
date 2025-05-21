import { useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";

export default function HowTo() {
  useEffect(() => {
    document.title = "How to Use AI LaTeX Generator";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Step-by-step guide to quickly generate LaTeX documents using the AI LaTeX Generator.'
      );
    }
  }, []);

  const steps = [
    {
      title: "Create an Account",
      description:
        "Register for a free account to keep track of your documents and usage."
    },
    {
      title: "Pick a Template",
      description:
        "Choose from articles, presentations, letters, or upload your own LaTeX template."
    },
    {
      title: "Describe Your Content",
      description:
        "Enter a short description or outline. The AI will turn it into polished LaTeX."
    },
    {
      title: "Review the Output",
      description:
        "Preview the generated PDF and tweak the LaTeX source if needed."
    },
    {
      title: "Download or Share",
      description:
        "Save the PDF, copy the LaTeX code, or share the document with collaborators."
    }
  ];

  return (
    <SiteLayout seoTitle="How to Use AI LaTeX Generator">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">How to Use AI LaTeX Generator</h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          Follow these simple steps to create professional documents in minutes.
        </p>
        <ol className="space-y-6 list-decimal list-inside">
          {steps.map((step, index) => (
            <li key={index} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </SiteLayout>
  );
}
