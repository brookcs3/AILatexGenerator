import { useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";

export default function Community() {
  useEffect(() => {
    document.title = "Community - AI LaTeX Generator";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Join the AI LaTeX Generator community to share tips and get help."
      );
    }
  }, []);

  return (
    <SiteLayout seoTitle="Community">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">Community Forum</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Connect with other users, share templates, and get advice.
        </p>
        <p>
          Join our discussion on {" "}
          <a
            href="https://github.com/your-repo/discussions"
            className="text-blue-600 hover:underline"
          >
            GitHub Discussions
          </a>{" "}
          or chat with us on {" "}
          <a
            href="https://slack.com"
            className="text-blue-600 hover:underline"
          >
            Slack
          </a>.
        </p>
      </div>
    </SiteLayout>
  );
}
