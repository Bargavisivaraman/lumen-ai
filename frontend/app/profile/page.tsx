"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Calendar, Loader2, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileInner />
    </AppShell>
  );
}

function ProfileInner() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setBio(user.bio ?? "");
      setAvatarUrl(user.avatar_url ?? "");
    }
  }, [user]);

  if (!user) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateMe({ full_name: fullName, bio, avatar_url: avatarUrl });
      await refresh();
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 lg:px-12 py-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        description="Edit how you appear in the app."
      />

      <div className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-accent to-plasma flex items-center justify-center text-ink-950 font-display text-3xl shrink-0 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user.full_name[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink-50">{user.full_name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.created_at)}
              </span>
              <span className="chip capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="card space-y-5">
        <h3 className="font-display text-lg text-ink-50">Edit profile</h3>
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label">Avatar URL (optional)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input"
            placeholder="A line or two about what you're studying."
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
