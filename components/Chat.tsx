"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data);
    };
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userInput = input;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        assistantContent += decoder.decode(value);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.role !== "assistant"),
          {
            id: Date.now().toString(),
            content: assistantContent,
            role: "assistant",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Área de mensajes - Mejorada */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-full md:max-w-3xl lg:max-w-4xl rounded-2xl p-4 transition-all duration-200 ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/30 dark:to-blue-800/40 text-blue-900 dark:text-blue-100 ml-4 shadow-lg"
                  : "bg-gray-50/80 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 mr-4 shadow-md backdrop-blur-sm"
              }`}
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                {/* Renderizamos el contenido con ReactMarkdown */}
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              <div className="mt-2 text-xs opacity-60 dark:opacity-50 font-mono">
                {new Date(message.created_at).toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-2 items-center text-blue-500 dark:text-blue-400">
              <div className="h-3 w-3 bg-current rounded-full animate-bounce delay-0"></div>
              <div className="h-3 w-3 bg-current rounded-full animate-bounce delay-100"></div>
              <div className="h-3 w-3 bg-current rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Área de entrada mejorada */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent backdrop-blur-sm pt-4 px-4 md:px-6 lg:px-8"
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta legal..."
            className="w-full p-4 pr-16 rounded-2xl border-2 border-gray-200/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300/30 dark:focus:ring-blue-600/30 focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-200 shadow-lg"
            disabled={loading}
            aria-label="Mensaje"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 h-12 w-12 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transform transition-transform hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13.5h2v-3H3v3zm16 0h2v-3h-2v3zm-8.03-2.809l.474-.423 6.086 6.728-.474.423-6.086-6.728zm-.945-1.035l.85-.523 3.627 5.896-.85.523-3.627-5.896zM12 4.5c-3.26 0-6.327.77-9 2.12v12.74c2.673-1.35 5.74-2.12 9-2.12s6.327.77 9 2.12V6.62c-2.673-1.35-5.74-2.12-9-2.12z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 mb-4">
          Presiona{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
            Enter
          </kbd>{" "}
          para enviar
        </p>
      </form>
    </div>
  );
}
