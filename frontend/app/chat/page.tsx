"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  api,
  type ChatMessage,
  type ChatSession,
  type ChatSessionWithMessages,
} from "@/lib/api";
import { useSpeechRecognition, useSpeechSynthesis } from "@/lib/speech";
import { cn, formatTime } from "@/lib/utils";

const STARTERS = [
  "Explain the Pythagorean theorem with a real-world example.",
  "What's the difference between mitosis and meiosis?",
  "Walk me through solving a quadratic equation.",
  "Summarize the causes of World War I in 5 bullet points.",
];

export default function ChatPage() {
  return (
    <AppShell>
      <ChatInner />
    </AppShell>
  );
}

function ChatInner() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [active, setActive] = useState<ChatSessionWithMessages | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stt = useSpeechRecognition();
  const tts = useSpeechSynthesis();

  // Sync transcript -> input
  useEffect(() => {
    if (stt.transcript) setInput(stt.transcript);
  }, [stt.transcript]);

  // Load sessions on mount
  useEffect(() => {
    api.listSessions().then(setSessions).catch(() => {});
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, sending]);

  async function openSession(id: number) {
    try {
      tts.stop();
      const data = await api.getSession(id);
      setActive(data);
    } catch {
      toast.error("Could not load conversation");
    }
  }

  function newSession() {
    tts.stop();
    setActive(null);
    setInput("");
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    stt.reset();

    // Optimistic user bubble
    const tempUser: ChatMessage = {
      id: -1,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setActive((prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, tempUser] }
        : {
            id: 0,
            title: content.slice(0, 60),
            created_at: new Date().toISOString(),
            messages: [tempUser],
          },
    );

    try {
      const reply = await api.sendMessage(content, active?.id || undefined);
      setActive((prev) => ({
        id: reply.session.id,
        title: reply.session.title,
        created_at: reply.session.created_at,
        messages: [
          ...(prev?.messages.filter((m) => m.id !== -1) ?? []),
          reply.user_message,
          reply.assistant_message,
        ],
      }));
      // Refresh session list if it was a new conversation
      if (!active) {
        const list = await api.listSessions();
        setSessions(list);
      }
      if (autoSpeak) tts.speak(reply.assistant_message.content);
    } catch (err) {
      toast.error("Couldn't get a reply — try again");
      // Roll back optimistic bubble
      setActive((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== -1) } : null,
      );
    } finally {
      setSending(false);
    }
  }

  async function deleteSession(id: number) {
    try {
      await api.deleteSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
      if (active?.id === id) setActive(null);
      toast.success("Conversation deleted");
    } catch {
      toast.error("Couldn't delete");
    }
  }

  return (
    <div className="flex h-[calc(100vh-0px)] lg:h-screen">
      {/* History sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-950/40">
        <div className="p-4">
          <button onClick={newSession} className="btn-primary w-full">
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>
        <div className="px-3 pb-3 text-xs uppercase tracking-wider text-ink-400">History</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="px-3 text-xs text-ink-500">No conversations yet.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="group relative">
                <button
                  onClick={() => openSession(s.id)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 text-sm truncate transition",
                    active?.id === s.id
                      ? "bg-white/[0.06] text-ink-50"
                      : "text-ink-300 hover:bg-white/[0.03] hover:text-ink-100",
                  )}
                >
                  {s.title}
                </button>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition"
                >
                  <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-signal-bad" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-xs uppercase tracking-wider text-accent mb-0.5">AI Tutor</div>
            <h1 className="font-display text-lg text-ink-50 truncate">
              {active?.title ?? "New conversation"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpeak((v) => !v)}
              className={cn(
                "p-2 rounded-lg border transition",
                autoSpeak
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/[0.06] text-ink-400 hover:text-ink-100",
              )}
              title="Auto-speak replies"
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {!active || active.messages.length === 0 ? (
            <EmptyChat onPick={send} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {active.messages.map((m) => (
                  <Message key={m.id || `${m.role}-${m.created_at}`} message={m} onSpeak={tts.speak} />
                ))}
              </AnimatePresence>
              {sending && (
                <div className="flex items-center gap-3 text-ink-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span
                      className="h-2 w-2 rounded-full bg-accent animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-accent animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  Tutor is thinking...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-white/[0.06] bg-ink-950/60 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 lg:px-0 py-4">
            <div className="relative glass rounded-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything... or press the mic to speak"
                className="w-full bg-transparent border-0 resize-none px-5 py-4 pr-32 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none max-h-40"
                style={{ minHeight: 56 }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                {stt.supported && (
                  <button
                    onClick={() => (stt.listening ? stt.stop() : stt.start())}
                    className={cn(
                      "p-2 rounded-lg transition",
                      stt.listening
                        ? "bg-signal-bad/15 text-signal-bad"
                        : "text-ink-400 hover:text-ink-100 hover:bg-white/5",
                    )}
                    title={stt.listening ? "Stop recording" : "Start recording"}
                  >
                    {stt.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || sending}
                  className="p-2 rounded-lg bg-accent text-ink-950 hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-ink-500 text-center">
              Enter to send · Shift+Enter for newline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({
  message,
  onSpeak,
}: {
  message: ChatMessage;
  onSpeak: (text: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "justify-end")}
    >
      {!isUser && (
        <div className="shrink-0 mt-1 h-8 w-8 rounded-full bg-gradient-to-br from-accent to-plasma flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-ink-950" />
        </div>
      )}
      <div className={cn("max-w-[80%]", isUser && "max-w-[75%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 prose-chat",
            isUser
              ? "bg-accent text-ink-950 rounded-tr-sm"
              : "bg-white/[0.04] border border-white/[0.06] text-ink-100 rounded-tl-sm",
          )}
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
        </div>
        <div
          className={cn(
            "mt-1 px-1 flex items-center gap-3 text-[11px] text-ink-500",
            isUser && "justify-end",
          )}
        >
          <span>{formatTime(message.created_at)}</span>
          {!isUser && (
            <button
              onClick={() => onSpeak(message.content)}
              className="hover:text-ink-200 transition"
            >
              Listen
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyChat({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto pt-10">
      <div className="text-center mb-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-plasma shadow-glow mb-5">
          <Sparkles className="h-7 w-7 text-ink-950" />
        </div>
        <h2 className="font-display text-3xl text-ink-50 mb-2">What are we learning?</h2>
        <p className="text-ink-300">Ask anything academic — I'll explain it step by step.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left card hover:border-accent/30 hover:bg-white/[0.04] transition group"
          >
            <p className="text-sm text-ink-200 group-hover:text-ink-50">{s}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
