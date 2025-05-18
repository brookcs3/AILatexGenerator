import { useState } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";

export default function UndetectableTest() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/undetectable/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.text);
      } else {
        setOutput(data.message || "Error");
      }
    } catch {
      setOutput("Error rewriting text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout seoTitle="Undetectable AI Test">
      <div className="h-full flex flex-col md:flex-row bg-gradient-soft">
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-4 glass rounded-lg shadow-lg overflow-hidden depth-3d p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Input</h2>
            <textarea
              className="flex-1 w-full rounded-md border border-gray-300 p-2 glass-card resize-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to rewrite..."
            />
            <Button
              className="mt-2 self-end"
              onClick={handleRewrite}
              disabled={loading || !input.trim()}
            >
              {loading ? "Rewriting..." : "Rewrite"}
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-4 glass rounded-lg shadow-lg overflow-hidden depth-3d p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Output</h2>
            <textarea
              readOnly
              className="flex-1 w-full rounded-md border border-gray-300 p-2 glass-card resize-none text-sm font-mono focus:outline-none"
              value={output}
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
