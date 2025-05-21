import { useEffect, useState } from "react";
import SiteLayout from "@/components/layout/site-layout";

interface ShowcaseEntry {
  id: number;
  documentId: number;
  title: string | null;
  username: string;
}

export default function Showcase() {
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);

  useEffect(() => {
    document.title = "Showcase - AI LaTeX Generator";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Explore top documents created by the community using AI LaTeX Generator.'
      );
    }
    fetch('/api/showcase')
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <SiteLayout seoTitle="Showcase">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Showcase</h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          The best user-generated documents shared by our community.
        </p>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="border rounded p-4">
              <h2 className="font-semibold">{entry.title || 'Untitled'}</h2>
              <p className="text-sm mb-2">by {entry.username}</p>
              <a
                href={`/?documentId=${entry.documentId}`}
                className="text-blue-600"
              >
                View Document
              </a>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
