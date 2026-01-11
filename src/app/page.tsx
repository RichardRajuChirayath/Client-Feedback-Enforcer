"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Loader2, AlertCircle, Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_token") {
      setError("This magic link has expired or is invalid. Please request a new one.");
    } else if (errorParam === "missing_token") {
      setError("Invalid link. Please request a new magic link.");
    } else if (errorParam === "verification_failed") {
      setError("Verification failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) router.push("/dashboard");
        }
      } catch { }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Create Magic Link Error (Raw Response):", text);
        throw new Error(`Server error (${res.status}): Check console for details`);
      }

      if (!res.ok) throw new Error(data.error || "Failed to send magic link");

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030712] flex items-center justify-center p-6">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-950/40 via-purple-950/30 to-black animate-slow-pulse" />

      {/* Floating glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-gradient-to-tl from-purple-700/20 to-pink-600/10 rounded-full blur-3xl animate-float-slow-delayed" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-float-fast" />
      </div>

      {/* Subtle animated particles (optional – can be removed for performance) */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:30px_30px] opacity-30 animate-drift" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo + Title with sparkle */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-[32px] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <CheckCircle className="w-14 h-14 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300/70 animate-pulse" />
            </div>
          </div>

          <h1 className="mt-10 text-5xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-300 leading-none">
            Feedback
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Enforcer</span>
          </h1>

          <p className="mt-5 text-lg text-slate-400 font-medium tracking-wide">
            Never miss a single client insight again
          </p>
        </div>

        {/* Glass Card – deeper glassmorphism */}
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] p-10 sm:p-12 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(99,102,241,0.4)]">
          {!isSent ? (
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, enforcer</h2>
                <p className="mt-3 text-slate-400">Sign in with magic link – no passwords needed</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-900/30 border border-red-500/30 text-red-300 animate-shake">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300 tracking-wide ml-1">
                    YOUR EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      required
                      placeholder="name@company.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-20 pr-6 py-5 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300 text-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 p-[3px] focus:outline-none disabled:opacity-50"
                >
                  <div className="relative flex h-16 items-center justify-center gap-3 rounded-2xl bg-black/70 px-8 text-lg font-bold text-white transition-all duration-500 group-hover:bg-black/40 group-active:scale-98">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span>Sending Magic Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Magic Link</span>
                        <Mail className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Security trust badge */}
              <div className="flex justify-center pt-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Secure • Passwordless • Magic Link
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-pulse-slow">
                <Mail className="w-12 h-12 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Magic link sent!</h2>
                <p className="mt-4 text-slate-300 text-lg">
                  Check <span className="font-bold text-white">{email}</span>
                  <br />
                  <span className="text-sm text-slate-500 mt-2 block">The link expires in 15 minutes</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail("");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Try a different email →
              </button>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-xs text-slate-600 font-bold tracking-widest opacity-50 uppercase">
          © 2026 Feedback Enforcer — All rights reserved
        </p>
      </div>
    </div>
  );
}