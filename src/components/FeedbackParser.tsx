"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Copy, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
    tasks: string[];
    questions: string[];
    sentiment: string;
    tone: string;
    summary: string;
}

export default function FeedbackParser() {
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;

        setIsAnalyzing(true);
        // Reset result slightly to re-trigger animations if needed
        setResult(null);

        try {
            const res = await fetch("/api/analyze-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full glass-panel rounded-3xl p-1 overflow-hidden">
            <div className="bg-slate-950/50 p-6 md:p-8 rounded-[20px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Feedback Parser</h2>
                        <p className="text-slate-400 text-sm">Paste client email or Slack dump here</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Side */}
                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Example: 'Hey guys, love the direction but can we make the logo bigger and change the blue to a darker navy? Also when will the staging site be ready? Thanks!'"
                                className="w-full h-64 bg-slate-900/80 border border-white/10 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all relative z-10 font-medium text-base leading-relaxed"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !input.trim()}
                            className="premium-button h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Extract Tasks</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Side */}
                    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-1 relative min-h-[300px]">
                        {!result ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-4">
                                <Terminal className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-medium">Waiting for input...</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-6"
                            >
                                {/* Summary */}
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Summary</h4>
                                    <p className="text-white font-medium leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* Metadata Badges */}
                                <div className="flex gap-3">
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${result.sentiment === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                            result.sentiment === 'negative' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                                result.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                                    'bg-slate-700/50 text-slate-300 border border-white/10'
                                        }`}>
                                        {result.sentiment}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                        Tone: {result.tone}
                                    </div>
                                </div>

                                {/* Tasks */}
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        Tasks Detected <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">{result.tasks.length}</span>
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.tasks.map((task, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-default"
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-slate-200 text-sm leading-relaxed">{task}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Questions */}
                                {result.questions.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            Questions <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px]">{result.questions.length}</span>
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.questions.map((q, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                    <span className="text-slate-200 text-sm leading-relaxed">{q}</span>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
