import { useState } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { generateSummary, generateOutline, generateGlossary, generateFlashcards } from "@/lib/groq-suite";

const modes = [
  { id: "summary", label: "Summary" },
  { id: "outline", label: "Outline" },
  { id: "glossary", label: "Glossary" },
  { id: "flashcards", label: "Flashcards" }
];

export default function GroqSuite() {
  const [mode, setMode] = useState("summary");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      if (mode === "summary") {
        const res = await generateSummary(input);
        setOutput(res.summary);
      } else if (mode === "outline") {
        const res = await generateOutline(input);
        setOutput(res.outline);
      } else if (mode === "glossary") {
        const res = await generateGlossary(input);
        setOutput(res.glossary);
      } else {
        const res = await generateFlashcards(input);
        setOutput(res.flashcards);
      }
    } catch (err) {
      console.error(err);
      setOutput("Error generating output");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout seoTitle="Groq Toolkit">
      <div className="h-full flex flex-col md:flex-row bg-gradient-soft">
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-4 glass rounded-lg shadow-lg overflow-hidden depth-3d p-4 flex flex-col space-y-2">
            <h2 className="text-lg font-semibold">Input</h2>
            <select
              className="border border-gray-300 rounded-md p-2"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <textarea
              className="flex-1 rounded-md border border-gray-300 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleRun} disabled={loading || input.trim().length === 0}>
              {loading ? "Processing..." : "Run"}
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-4 glass rounded-lg shadow-lg overflow-hidden depth-3d p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Output</h2>
            <textarea
              readOnly
              className="flex-1 rounded-md border border-gray-300 p-2 resize-none bg-gray-50"
              value={output}
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

