import { useState } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { rewriteText } from "@/lib/undetectable";

export default function UndetectableTest() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await rewriteText(input);
      setOutput(res.text);
    } catch (err) {
      console.error(err);
      setOutput("Error generating text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout seoTitle="Undetectable Text Test">
      <div className="h-full flex flex-col md:flex-row bg-gradient-soft">
        <div className="w-full md:w-1/2 h-full relative">
          <div className="absolute inset-4 glass rounded-lg shadow-lg overflow-hidden depth-3d p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Input</h2>
            <textarea
              className="flex-1 rounded-md border border-gray-300 p-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleRewrite} disabled={loading || input.trim().length === 0}>
              {loading ? "Rewriting..." : "Rewrite"}
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
