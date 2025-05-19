import { useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";

const samplePosts = [
  { author: 'Alice', message: 'Welcome to the community forum!' },
  { author: 'Bob', message: 'Feel free to share LaTeX tips and tricks.' }
];

export default function Community() {
  useEffect(() => {
    document.title = "Community Forum - AI LaTeX Generator";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Join the AI LaTeX Generator community to ask questions and share ideas.'
      );
    }
  }, []);

  return (
    <SiteLayout seoTitle="Community Forum">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Community Forum</h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          This is a lightweight space for users to discuss features and share feedback.
        </p>
        <div className="space-y-4">
          {samplePosts.map((post, idx) => (
            <div key={idx} className="border rounded p-4">
              <p className="font-semibold">{post.author}</p>
              <p>{post.message}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-gray-500">Full forum functionality coming soon.</p>
      </div>
    </SiteLayout>
  );
}
