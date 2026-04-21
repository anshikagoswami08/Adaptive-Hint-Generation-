import React, { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import { ChatMessage } from "../types";
import { Send, User, Bot, Sparkles, Loader2 } from "lucide-react";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI learning assistant. Paste a problem or ask me anything you're struggling with.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;

    const userMsg: ChatMessage = {
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(userInput);

      const formattedContent =
        response.type === "ask_solution"
          ? `📘 Problem Registered\n\n${response.response}`
          : response.type === "hint"
            ? `💡 Hint Generated\n\n${response.response}`
            : response.response;

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: formattedContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "⚠️ Server error. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
      <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100">AI Learning Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
                Online
              </span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
          <Sparkles className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-zinc-800"
                  : "bg-indigo-600/20 text-indigo-400"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-zinc-800/50 text-zinc-200 border border-zinc-800/50 rounded-tl-none"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-zinc-800/50 rounded-2xl rounded-tl-none p-4 border border-zinc-800/50 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-6 bg-zinc-950/50 border-t border-zinc-800"
      >
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a hint or paste a problem..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-3 text-center uppercase font-bold tracking-widest">
          AI generated content can be inaccurate. verify for critical learning.
        </p>
      </form>
    </div>
  );
};

export default Chatbot;
