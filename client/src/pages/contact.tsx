import { useState, useEffect } from "react";
import SiteLayout from "@/components/layout/site-layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Contact Us - AI LaTeX Generator";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Get in touch with the AI LaTeX Generator team."
      );
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Message Sent", description: "We'll reply soon." });
        setForm({ name: "", email: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout seoTitle="Contact Us">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} />
          <Input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
          />
          <Textarea
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            value={form.message}
            onChange={handleChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
