"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Plus,
  X,
  Loader2,
  Sparkles,
  Trash2,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { api, type Note } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

export default function NotesPage() {
  return (
    <AppShell>
      <NotesInner />
    </AppShell>
  );
}

function NotesInner() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function refresh() {
    const list = await api.listNotes();
    setNotes(list);
    if (active) {
      const found = list.find((n) => n.id === active.id);
      setActive(found ?? null);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function remove(id: number) {
    try {
      await api.deleteNote(id);
      setNotes((n) => n.filter((x) => x.id !== id));
      if (active?.id === id) setActive(null);
      toast.success("Deleted");
    } catch {
      toast.error("Couldn't delete");
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Notes & resources"
        title="Turn raw notes into review material"
        description="Upload a PDF or paste text. Get an AI summary, key points, and flashcards in seconds."
        actions={
          <button onClick={() => setShowCreate((v) => !v)} className="btn-primary">
            {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreate ? "Cancel" : "New note"}
          </button>
        }
      />

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CreateForm
              onCreated={(n) => {
                setNotes((arr) => [n, ...arr]);
                setActive(n);
                setShowCreate(false);
                toast.success("Note created");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {notes.length === 0 && !showCreate ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Upload a PDF of your class notes or paste a long passage. The AI will summarize it and create flashcards."
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add your first note
            </button>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
          {/* List */}
          <div className="space-y-2">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n)}
                className={cn(
                  "w-full text-left card group hover:border-accent/30 transition",
                  active?.id === n.id && "border-accent/40 bg-white/[0.05]",
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-ink-50 font-medium line-clamp-2">{n.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-white/5"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-signal-bad" />
                  </button>
                </div>
                <p className="text-xs text-ink-400 line-clamp-2">{n.summary}</p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-500">
                  <span>{formatDate(n.created_at)}</span>
                  {n.flashcards && <span>{n.flashcards.length} cards</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div>
            {active ? <NoteDetail note={active} /> : (
              <div className="card text-center py-16 text-ink-400">
                Select a note to see its summary and flashcards
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateForm({ onCreated }: { onCreated: (n: Note) => void }) {
  const [tab, setTab] = useState<"text" | "upload">("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    setBusy(true);
    try {
      if (tab === "text") {
        if (text.length < 50) {
          toast.error("Paste at least 50 characters");
          return;
        }
        const note = await api.createNoteFromText(title, text);
        onCreated(note);
      } else {
        if (!file) {
          toast.error("Select a PDF or text file");
          return;
        }
        const note = await api.uploadNote(title, file);
        onCreated(note);
      }
    } catch (err: any) {
      toast.error(err?.message || "Couldn't process");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.02] w-fit mb-5">
        {(["text", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition",
              tab === t ? "bg-accent text-ink-950" : "text-ink-300 hover:text-ink-100",
            )}
          >
            {t === "text" ? "Paste text" : "Upload file"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="e.g. Chapter 4 — Cell Biology"
          />
        </div>

        {tab === "text" ? (
          <div>
            <label className="label">Notes text</label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input font-mono text-[13px]"
              placeholder="Paste your notes here (at least 50 characters)..."
            />
            <p className="mt-1 text-xs text-ink-500">{text.length} chars</p>
          </div>
        ) : (
          <div>
            <label className="label">PDF or text file (max 5 MB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/[0.08] rounded-xl px-6 py-10 text-center cursor-pointer hover:border-accent/40 transition"
            >
              <Upload className="h-6 w-6 text-ink-400 mx-auto mb-3" />
              {file ? (
                <p className="text-sm text-ink-100">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-ink-200">Click to upload</p>
                  <p className="text-xs text-ink-500 mt-1">PDF or .txt</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>
        )}

        <button onClick={submit} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Analyzing..." : "Summarize with AI"}
        </button>
      </div>
    </div>
  );
}

function NoteDetail({ note }: { note: Note }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-display text-2xl text-ink-50 mb-1">{note.title}</h2>
        <p className="text-xs text-ink-400">{formatDate(note.created_at)}</p>
      </div>

      {note.summary && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="font-display text-lg text-ink-50">Summary</h3>
          </div>
          <p className="text-sm text-ink-200 leading-relaxed whitespace-pre-line">{note.summary}</p>
        </div>
      )}

      {note.key_points && note.key_points.length > 0 && (
        <div className="card">
          <h3 className="font-display text-lg text-ink-50 mb-4">Key points</h3>
          <ul className="space-y-2">
            {note.key_points.map((kp, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-200">
                <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{kp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {note.flashcards && note.flashcards.length > 0 && (
        <div className="card">
          <h3 className="font-display text-lg text-ink-50 mb-4">Flashcards · {note.flashcards.length}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {note.flashcards.map((f, i) => (
              <Flashcard key={i} front={f.front} back={f.back} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="relative w-full min-h-[140px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left hover:border-accent/30 transition group"
    >
      <div className="text-xs uppercase tracking-wider text-accent mb-2">
        {flipped ? "Answer" : "Question"}
      </div>
      <p className="text-sm text-ink-100">{flipped ? back : front}</p>
      <div className="absolute right-3 bottom-3 opacity-50 group-hover:opacity-100 transition">
        <RotateCw className="h-3.5 w-3.5 text-ink-400" />
      </div>
    </button>
  );
}
