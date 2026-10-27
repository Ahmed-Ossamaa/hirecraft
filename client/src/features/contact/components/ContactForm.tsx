"use client";

import React, { useState } from "react";
import { MdCheckCircle, MdSend, MdMailOutline, MdContentCopy } from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }
    setSubmitted(true);
  };

  const generateMailto = () => {
    const subject = encodeURIComponent(`[Technically Contact - ${topic}] From ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`);
    return `mailto:support@technically.com?subject=${subject}&body=${body}`;
  };

  if (submitted) {
    return (
      <div className="p-6 md:p-8 rounded-xl bg-card border border-border/60 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
          <MdCheckCircle className="text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Message Prepared!</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-foreground">{name}</strong>. If you want to dispatch this directly via your email client, click below:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href={generateMailto()}>
            <Button
              className="cursor-pointer"
              leftIcon={<MdMailOutline className="text-base" />}
            >
              Open in Mail App
            </Button>
          </a>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setSubmitted(false);
              setMessage("");
            }}
          >
            Send Another Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-xl bg-card border border-border/60 space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground">
        Send Us a Message
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium text-foreground">
            Your Name <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Miller"
            className="w-full bg-background border border-border/80 text-foreground text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-foreground">
            Email Address <span className="text-primary">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full bg-background border border-border/80 text-foreground text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="topic" className="text-xs font-medium text-foreground">
          Inquiry Category
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full bg-background border border-border/80 text-foreground text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="general">General Question</option>
          <option value="operator">Operator &amp; Candidate Support</option>
          <option value="employer">Manufacturing Plant &amp; Job Posting</option>
          <option value="billing">Pricing &amp; Subscriptions</option>
          <option value="feedback">Product Feedback &amp; Suggestions</option>
          <option value="complaints">Complaints</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-medium text-foreground">
          Message <span className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className="w-full bg-background border border-border/80 text-foreground text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer"
        rightIcon={<MdSend className="text-sm" />}
      >
        Submit Message
      </Button>
    </form>
  );
}

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      return null;
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      title="Copy email address"
    >
      <MdContentCopy className="text-xs" />
      <span>{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
