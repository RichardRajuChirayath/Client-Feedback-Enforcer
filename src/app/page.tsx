"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Loader2, AlertCircle, Shield, Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_token") {
      setError("Link expired. Please request a new one.");
    } else if (errorParam === "missing_token") {
      setError("Invalid link.");
    } else if (errorParam === "verification_failed") {
      setError("Verification failed.");
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
    <div className="min-h-screen w-full bg-[#02040a] flex flex-col lg:flex-row">
      {/* LEFT SIDE: Branding & Visuals (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-indigo-950/20 items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#02040a] to-[#02040a]" />
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-12 relative group cursor-default">
            <div className="absolute inset-0 bg-indigo-500/30 rounded-3xl blur-2xl group-hover:bg-indigo-500/50 transition-all duration-700" />
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl border border-white/10 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              <CheckCircle className="w-16 h-16 text-white" />
              <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
          </div>

          <h1 className="text-6xl font-black tracking-tighter text-white mb-6 leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              CLYENTRA
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-md font-medium leading-relaxed">
            Streamline your design agency's feedback loop.
            <br />
            <span className="text-slate-500 mt-2 block text-sm uppercase tracking-widest">Never miss a client insight</span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative bg-[#0B0F19]">
        {/* Subtle Background for Right Side */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-[440px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/20">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">CLYENTRA</h2>
          </div>

          <div className="glass-panel p-8 lg:p-14 rounded-[40px] border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col gap-8 lg:gap-10 w-full max-w-lg mx-auto relative z-20">
            <div className={!isSent ? "" : "text-center"}>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                {!isSent ? (
                  <>
                    Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">back</span>
                  </>
                ) : (
                  "Check your inbox"
                )}
              </h2>
              <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed max-w-sm">
                {!isSent ? "Enter your email to access your dashboard." : `We've sent a magic link to ${email}`}
              </p>
            </div>

            {!isSent ? (
              <>
                {error && (
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-base font-semibold flex items-start gap-3 animate-shake">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
                  <div className="space-y-3 w-full">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <div className="relative group w-full">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 transition-colors group-focus-within:text-indigo-400">
                        <Mail className="w-7 h-7" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        required
                        placeholder="name@company.com"
                        style={{ paddingLeft: '4.5rem' }}
                        className="w-full h-20 bg-slate-900/50 border border-white/10 rounded-2xl !pl-[4.5rem] pr-6 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xl appearance-none hover:bg-slate-900/70"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="premium-button w-full h-20 rounded-2xl text-white font-black text-xl tracking-wide shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group mt-2 shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in with Magic Link</span>
                        <Mail className="w-6 h-6 opacity-80 group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex justify-center w-full pt-4">
                  <div className="flex items-center gap-2.5 text-xs font-extrabold tracking-[0.25em] text-slate-500 uppercase bg-white/5 px-6 py-3 rounded-full hover:bg-white/10 transition-colors cursor-default">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Secure Passwordless Login
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-10 w-full py-4">
                <div className="w-28 h-28 bg-emerald-500/10 rounded-3xl flex items-center justify-center border-2 border-emerald-500/20 animate-pulse-slow shadow-xl shadow-emerald-500/10">
                  <Mail className="w-12 h-12 text-emerald-500" />
                </div>
                <button
                  onClick={() => { setIsSent(false); setEmail(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold text-lg flex items-center gap-2 transition-colors hover:underline underline-offset-4"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center lg:hidden">
          <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">© 2026 Clyentra</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-10 left-10">
        <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase opacity-60">© 2026 Clyentra Inc.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#02040a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}