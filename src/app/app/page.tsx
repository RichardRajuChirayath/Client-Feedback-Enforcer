"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ClipboardPaste,
    Brain,
    FileText,
    Search,
    Loader2,
    Zap,
    Layout,
    MessageSquare,
    RefreshCcw,
    Target,
    ChevronRight,
} from "lucide-react";

// Types
interface FeedbackItem {
    id: string;
    content: string;
    category: "DESIGN" | "COPY" | "UX" | "TECHNICAL" | "GENERAL";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    requiredAction: string;
    status: "PENDING" | "ADDRESSED" | "MISSED" | "NEEDS_CLARIFICATION";
}

interface ComplianceResult {
    addressed: FeedbackItem[];
    missed: FeedbackItem[];
    needsClarification: { item: FeedbackItem; question: string }[];
    score: number;
}

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-center gap-4 mb-16">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border-2 ${i + 1 === currentStep
                            ? "bg-primary border-primary text-white scale-110 shadow-glow rotate-3"
                            : i + 1 < currentStep
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                                : "bg-slate-900 border-white/5 text-slate-600"
                            }`}
                    >
                        {i + 1 < currentStep ? <CheckCircle className="w-6 h-6" /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                        <div
                            className={`w-10 h-0.5 mx-2 rounded-full transition-all duration-700 ${i + 1 < currentStep ? "bg-emerald-500" : "bg-white/5"
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// Badge components
function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        DESIGN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        COPY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        UX: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        TECHNICAL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        GENERAL: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border uppercase ${colors[category] || colors.GENERAL}`}>
            {category}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const colors: Record<string, string> = {
        CRITICAL: "bg-rose-500 text-white shadow-lg shadow-rose-500/30",
        HIGH: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
        MEDIUM: "bg-blue-500/20 text-blue-500 border border-blue-500/30",
        LOW: "bg-slate-800 text-slate-400",
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase ${colors[priority] || colors.MEDIUM}`}>
            {priority}
        </span>
    );
}

export default function AppPage() {
    const [step, setStep] = useState(1);
    const [rawFeedback, setRawFeedback] = useState("");
    const [structuredFeedback, setStructuredFeedback] = useState<FeedbackItem[]>([]);
    const [revisionSummary, setRevisionSummary] = useState("");
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-focus textarea on step changes
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (step === 1 || step === 3) {
            textareaRef.current?.focus();
        }
    }, [step]);

    const parseFeedback = async () => {
        setIsLoading(true);
        // Simulate AI delay for drama
        await new Promise(r => setTimeout(r, 1500));
        try {
            const response = await fetch("/api/feedback/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback: rawFeedback }),
            });
            const data = await response.json();
            setStructuredFeedback(data.items);
            setStep(3);
        } catch (error) {
            console.error("Error parsing feedback:", error);
            setStep(3);
        } finally {
            setIsLoading(false);
        }
    };

    const checkCompliance = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        try {
            const response = await fetch("/api/feedback/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    feedback: structuredFeedback,
                    revision: revisionSummary,
                }),
            });
            const data = await response.json();
            setComplianceResult(data);
            setStep(5);
        } catch (error) {
            console.error("Error checking compliance:", error);
            setStep(5);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setRawFeedback("");
        setStructuredFeedback([]);
        setRevisionSummary("");
        setComplianceResult(null);
    };

    return (
        <div className="min-h-screen selection:bg-primary/30 selection:text-primary overflow-x-hidden">
            <div className="bg-mesh" />
            <div className="bg-dots" />

            {/* Modern Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 px-6">
                <div className="max-w-6xl mx-auto h-20 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 group-hover:text-white transition-colors">Exit Workspace</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black tracking-tighter text-lg uppercase">Compliance <span className="text-primary">Terminal</span></span>
                    </div>

                    <button
                        onClick={reset}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" /> Reset Flow
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16 relative">
                <StepIndicator currentStep={step} totalSteps={5} />

                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Input */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                        <Target className="w-3.5 h-3.5" /> Stage 01: Data Ingestion
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Drop the <span className="gradient-text">Chaos</span> Here.</h2>
                                    <p className="text-slate-400 font-medium text-lg">Paste raw client comments. AI will clean the mess.</p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
                                    <div className="relative glass-card rounded-3xl overflow-hidden">
                                        <div className="absolute top-4 right-4 text-slate-700 animate-pulse">
                                            <ClipboardPaste className="w-6 h-6" />
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={rawFeedback}
                                            onChange={(e) => setRawFeedback(e.target.value)}
                                            placeholder={`Paste client feedback here...\n\n- "CTA button is too small, make it pop"\n- "Use more vibrant colors in the hero"\n- "Copy feels a bit too corporate in section 3"`}
                                            className="w-full h-80 p-10 bg-slate-950/50 text-white placeholder:text-slate-700 focus:outline-none font-mono text-lg leading-relaxed resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => rawFeedback.trim() && setStep(2)}
                                        disabled={!rawFeedback.trim()}
                                        className="premium-button px-10 py-5 rounded-2xl text-white font-black text-xl flex items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all shadow-glow"
                                    >
                                        Ingest Feedback <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: AI Loading */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-12"
                            >
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-3xl bg-primary/20 border border-primary/50 animate-pulse-glow flex items-center justify-center relative z-10">
                                        <Brain className="w-16 h-16 text-primary animate-float" />
                                    </div>
                                    <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black tracking-tight animate-pulse">Neural <span className="gradient-text">Structuring</span> In Progress...</h2>
                                    <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Parsing entities, detecting categories, and auto-prioritizing.</p>
                                </div>

                                <div className="glass-card p-6 rounded-2xl w-full max-w-md bg-slate-900/50 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Processing Pipeline</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="h-full bg-gradient-to-r from-primary to-accent"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                                            <span>Scanning Tokens</span>
                                            <span>Mapping Categories</span>
                                            <span>Finalizing Export</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={parseFeedback}
                                    className="px-8 py-4 rounded-xl border-2 border-primary/30 text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                >
                                    Accelerate Engine
                                </button>
                            </motion.div>
                        )}

                        {/* Step 3: Revision Summary */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                        <Layout className="w-3.5 h-3.5" /> Stage 03: Performance Audit
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">What did you <span className="gradient-text">Execute?</span></h2>
                                    <p className="text-slate-400 font-medium text-lg">The AI has mapped {structuredFeedback.length} feedback items. Describe your responses.</p>
                                </div>

                                {/* Structured Feed Table with SaaS aesthetics */}
                                <div className="glass-card rounded-[32px] overflow-hidden">
                                    <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Target Feedback Manifest</span>
                                        <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded-md">ID-V2.1</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {structuredFeedback.map((item, i) => (
                                            <div key={item.id} className="p-8 flex gap-6 group hover:bg-white/[0.02] transition-colors">
                                                <div className="w-6 text-[10px] font-black text-slate-700 mt-1">{String(i + 1).padStart(2, '0')}</div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex gap-2">
                                                        <CategoryBadge category={item.category} />
                                                        <PriorityBadge priority={item.priority} />
                                                    </div>
                                                    <p className="text-lg font-black tracking-tight text-slate-200">{item.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Designer Execution Log</label>
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-primary/30 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
                                        <textarea
                                            ref={textareaRef}
                                            value={revisionSummary}
                                            onChange={(e) => setRevisionSummary(e.target.value)}
                                            placeholder={`Explain your changes...\n\n- "Increased CTA size and changed color to primary brand indigo"\n- "Updated hero background to use the new photography assets"\n- "Refined copy based on the new voice guidelines..."`}
                                            className="w-full h-48 p-10 bg-slate-950 rounded-3xl text-white placeholder:text-slate-700 focus:outline-none font-bold text-lg leading-relaxed resize-none border border-white/5"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-slate-900/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 rounded-2xl border border-white/10 text-slate-400 font-black uppercase text-xs tracking-widest hover:border-white/20 transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Go Back
                                    </button>
                                    <button
                                        onClick={() => revisionSummary.trim() && setStep(4)}
                                        disabled={!revisionSummary.trim()}
                                        className="premium-button px-10 py-5 rounded-2xl text-white font-black text-xl flex items-center gap-3 disabled:opacity-50 transition-all shadow-glow"
                                    >
                                        Run Compliance Check <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Verification Loading */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-center space-y-12"
                            >
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-primary/30 animate-spin transition-all duration-[5000ms] flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin duration-700" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Search className="w-12 h-12 text-primary animate-pulse" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h2 className="text-5xl font-black tracking-tighter">Cross-Referencing <br /><span className="gradient-text">Compliance Protocol.</span></h2>
                                    <div className="flex gap-1 justify-center">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [12, 24, 12] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-1 bg-primary rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={checkCompliance}
                                    className="px-10 py-5 rounded-3xl bg-slate-900 border-2 border-primary/20 text-primary font-black uppercase tracking-widest hover:scale-110 transition-all"
                                >
                                    Confirm Verification
                                </button>
                            </motion.div>
                        )}

                        {/* Step 5: Master Report */}
                        {step === 5 && complianceResult && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="space-y-12 pb-20"
                            >
                                <div className="text-center relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
                                    <h2 className="text-6xl font-black tracking-tighter mb-4 italic">Verification <span className="gradient-text">Complete.</span></h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Security Clearance: Design-Lead level</p>
                                </div>

                                {/* Cyberpunk Score Hexagon/Card */}
                                <div className="glass-card p-12 rounded-[48px] border-l-8 border-l-primary flex flex-col md:flex-row items-center justify-between gap-12 group">
                                    <div className="space-y-4 text-center md:text-left">
                                        <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">Project Integrity Score</h3>
                                        <p className="text-slate-500 font-medium max-w-sm">Calculated based on semantic overlap between client feedback and designer execution summary.</p>

                                        <div className="flex gap-2">
                                            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{complianceResult.addressed.length} Targets Hit</span>
                                            </div>
                                            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{complianceResult.missed.length} Failed Checks</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative h-48 w-48 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                            <motion.circle
                                                cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                strokeDasharray={502}
                                                initial={{ strokeDashoffset: 502 }}
                                                animate={{ strokeDashoffset: 502 - (502 * complianceResult.score) / 100 }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className="text-primary"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-white">{complianceResult.score}%</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Compliance</span>
                                        </div>
                                    </div>
                                </div>

                                {/* List Container */}
                                <div className="grid gap-6">
                                    {/* Missed - HIGHEST PRIORITY */}
                                    {complianceResult.missed.length > 0 && (
                                        <div className="glass-card rounded-3xl overflow-hidden border-rose-500/20 bg-rose-500/[0.02]">
                                            <div className="px-8 py-5 border-b border-rose-500/10 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-rose-500">
                                                    <XCircle className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Breach Protocol: Missed Requirements</span>
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-8 space-y-4">
                                                {complianceResult.missed.map(item => (
                                                    <div key={item.id} className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 flex gap-5 group items-center">
                                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                            <AlertTriangle className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex gap-2">
                                                                <CategoryBadge category={item.category} />
                                                                <span className="text-[10px] font-black text-rose-500 animate-pulse">ACTION REQUIRED</span>
                                                            </div>
                                                            <p className="text-xl font-black tracking-tight text-slate-100">{item.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Needs Clarification */}
                                    {complianceResult.needsClarification.length > 0 && (
                                        <div className="glass-card rounded-3xl overflow-hidden border-amber-500/20 bg-amber-500/[0.02]">
                                            <div className="px-8 py-5 border-b border-amber-500/10 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-amber-500">
                                                    <MessageSquare className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Semantic Grey Area: Clarification Required</span>
                                                </div>
                                            </div>
                                            <div className="p-4 md:p-8 space-y-4">
                                                {complianceResult.needsClarification.map(({ item, question }) => (
                                                    <div key={item.id} className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 flex gap-5 group items-center">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                                                            <RefreshCcw className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <CategoryBadge category={item.category} />
                                                            <p className="text-xl font-black tracking-tight text-white mb-2">{item.content}</p>
                                                            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/10">
                                                                <p className="text-slate-400 text-sm font-bold indent-4 italic">&quot;{question}&quot;</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Addressed */}
                                    {complianceResult.addressed.length > 0 && (
                                        <details className="group glass-card rounded-3xl overflow-hidden border-white/5">
                                            <summary className="px-8 py-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-2 text-emerald-500/60">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest font-mono">Archive: Successfully Processed ({complianceResult.addressed.length})</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-700 group-open:rotate-90 transition-transform" />
                                            </summary>
                                            <div className="p-8 grid gap-4 bg-slate-950/20 opacity-60">
                                                {complianceResult.addressed.map(item => (
                                                    <div key={item.id} className="flex gap-4 items-center">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500/30" />
                                                        <span className="text-slate-500 font-bold tracking-tight">{item.content}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>

                                {/* Final Actions */}
                                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                                    <button
                                        onClick={reset}
                                        className="premium-button px-10 py-5 rounded-3xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-glow hover:scale-105 transition-all"
                                    >
                                        <Sparkles className="w-6 h-6" /> Start New Audit
                                    </button>
                                    <button className="px-10 py-5 rounded-3xl border border-white/10 bg-slate-900/50 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-white hover:border-white/20 transition-all">
                                        Export Audit PDF
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
