"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Check, X, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { api, type QuizPublic, type QuizResult } from "@/lib/api";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

export default function QuizPage() {
  return (
    <AppShell>
      <QuizInner />
    </AppShell>
  );
}

function QuizInner() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [num, setNum] = useState(5);
  const [generating, setGenerating] = useState(false);

  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function generate() {
    if (!topic.trim()) {
      toast.error("Pick a topic first");
      return;
    }
    setGenerating(true);
    setResult(null);
    setAnswers({});
    try {
      const q = await api.generateQuiz(topic, difficulty, num);
      setQuiz(q);
    } catch {
      toast.error("Couldn't generate quiz");
    } finally {
      setGenerating(false);
    }
  }

  async function submit() {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Answer every question first");
      return;
    }
    setSubmitting(true);
    try {
      const r = await api.submitQuiz(quiz.id, answers);
      setResult(r);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setQuiz(null);
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="px-6 lg:px-12 py-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Practice"
        title="AI-generated quizzes"
        description="Pick a topic, choose difficulty, and test yourself. Instant explanations on every answer."
      />

      {!quiz && (
        <div className="card">
          <div className="grid lg:grid-cols-[2fr_1fr_1fr] gap-4 items-end">
            <div>
              <label className="label">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input"
                placeholder="e.g. Photosynthesis, French Revolution, Binary Search"
              />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.02]">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "rounded-lg py-2 text-xs font-medium capitalize transition",
                      difficulty === d
                        ? "bg-accent text-ink-950"
                        : "text-ink-300 hover:text-ink-100",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label"># Questions</label>
              <input
                type="number"
                min={3}
                max={20}
                value={num}
                onChange={(e) => setNum(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          <button onClick={generate} disabled={generating} className="btn-primary mt-6">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate quiz"}
          </button>
        </div>
      )}

      {quiz && !result && (
        <div className="space-y-4">
          <div className="card flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-accent">Quiz</div>
              <h2 className="font-display text-xl text-ink-50">{quiz.topic}</h2>
              <div className="mt-1 text-xs text-ink-400 capitalize">
                {quiz.difficulty} · {quiz.questions.length} questions
              </div>
            </div>
            <button onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Start over
            </button>
          </div>

          {quiz.questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="shrink-0 h-7 w-7 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-xs font-medium text-accent">
                  {i + 1}
                </div>
                <h3 className="text-ink-50">{q.prompt}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.choices.map((c, idx) => {
                  const selected = answers[q.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                      className={cn(
                        "text-left rounded-xl border px-4 py-3 text-sm transition",
                        selected
                          ? "border-accent/50 bg-accent/10 text-ink-50"
                          : "border-white/[0.06] bg-white/[0.02] text-ink-200 hover:border-white/15 hover:bg-white/[0.04]",
                      )}
                    >
                      <span className="text-xs uppercase tracking-wider text-ink-400 mr-2">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {c}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          <button onClick={submit} disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Grading..." : "Submit answers"}
          </button>
        </div>
      )}

      {quiz && result && (
        <ResultsView quiz={quiz} result={result} userAnswers={answers} onReset={reset} />
      )}
    </div>
  );
}

function ResultsView({
  quiz,
  result,
  userAnswers,
  onReset,
}: {
  quiz: QuizPublic;
  result: QuizResult;
  userAnswers: Record<number, number>;
  onReset: () => void;
}) {
  const correct = result.results.filter((r) => r.correct).length;
  const tone =
    result.score >= 80 ? "good" : result.score >= 60 ? "warn" : "bad";
  const toneClass =
    tone === "good"
      ? "from-signal-good/20 to-transparent border-signal-good/30 text-signal-good"
      : tone === "warn"
      ? "from-signal-warn/20 to-transparent border-signal-warn/30 text-signal-warn"
      : "from-signal-bad/20 to-transparent border-signal-bad/30 text-signal-bad";

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("card bg-gradient-to-br border", toneClass)}
      >
        <div className="text-xs uppercase tracking-wider mb-2">Your score</div>
        <div className="font-display text-6xl tracking-tight">{result.score}%</div>
        <p className="mt-2 text-sm text-ink-200">
          {correct} of {quiz.questions.length} correct ·{" "}
          {result.score >= 80
            ? "Excellent — you have this topic down."
            : result.score >= 60
            ? "Solid, with room to tighten up. Review the misses below."
            : "This topic needs another pass. Don't worry — that's what practice is for."}
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onReset} className="btn-primary">
            <Sparkles className="h-4 w-4" /> Try another topic
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {quiz.questions.map((q, i) => {
          const r = result.results.find((x) => x.question_id === q.id);
          if (!r) return null;
          const userIdx = userAnswers[q.id];
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
            >
              <div className="mb-3 flex items-start gap-3">
                <div
                  className={cn(
                    "shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
                    r.correct ? "bg-signal-good/15 text-signal-good" : "bg-signal-bad/15 text-signal-bad",
                  )}
                >
                  {r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <h3 className="text-ink-50 flex-1">{q.prompt}</h3>
              </div>

              <div className="space-y-1.5 mb-3 ml-10">
                {q.choices.map((c, idx) => {
                  const isCorrect = idx === r.correct_index;
                  const isUser = idx === userIdx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm border",
                        isCorrect
                          ? "border-signal-good/40 bg-signal-good/10 text-signal-good"
                          : isUser
                          ? "border-signal-bad/30 bg-signal-bad/5 text-ink-200"
                          : "border-transparent text-ink-400",
                      )}
                    >
                      <span className="text-xs uppercase mr-2 opacity-60">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {c}
                      {isCorrect && <span className="ml-2 text-xs">· correct</span>}
                      {isUser && !isCorrect && <span className="ml-2 text-xs">· your answer</span>}
                    </div>
                  );
                })}
              </div>

              {r.explanation && (
                <div className="ml-10 rounded-lg bg-white/[0.02] border border-white/[0.06] px-3 py-2">
                  <div className="text-xs uppercase tracking-wider text-accent mb-1">Why</div>
                  <p className="text-sm text-ink-200">{r.explanation}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
