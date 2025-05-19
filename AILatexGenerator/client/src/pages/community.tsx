import { useEffect, useState } from "react";
import SiteLayout from "@/components/layout/site-layout";

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  username: string;
  upvotes: number;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    document.title = "Community Forum - AI LaTeX Generator";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Join the AI LaTeX Generator community to ask questions and share ideas.'
      );
    }
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Fetch posts error', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts([...posts, { ...newPost, username: 'You', upvotes: 0 }]);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      const res = await fetch(`/api/posts/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SiteLayout seoTitle="Community Forum">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Community Forum</h1>
        <p className="mb-8 text-gray-700 dark:text-gray-300">
          This is a lightweight space for users to discuss features and share feedback.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2 mb-8">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Share your question or tip"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Post
          </button>
        </form>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded p-4">
              <p className="font-semibold">{post.username}</p>
              <h2 className="font-bold">{post.title}</h2>
              <p className="mb-2 whitespace-pre-wrap">{post.content}</p>
              <button
                onClick={() => handleUpvote(post.id)}
                className="text-sm text-blue-600"
              >
                Upvote ({post.upvotes})
              </button>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
