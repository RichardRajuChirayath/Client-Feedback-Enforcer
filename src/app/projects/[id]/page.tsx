"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2, ArrowLeft, Plus, Folder, Clock,
    CheckCircle2, MessageCircleQuestion, AlertCircle,
    ChevronRight, Zap, Target, History, Sparkles, Send
} from "lucide-react";

// Types remain same...
// Types remain same...
interface ProjectDetail {
    id: string;
    name: string;
    clientName: string | null;
    description: string | null;
    updatedAt: string;
    revisions: Revision[];
    stats: {
        totalFeedback: number;
        addressed: number;
        pending: number;
        avgResolutionTime: string | null;
    };
}

interface Revision {
    id: string;
    revisionNumber: number;
    status: string;
    createdAt: string;
    revisionSummary: string | null;
    feedbackItems: FeedbackItem[];
    sentiment?: string;
    tone?: string;
    complianceReport?: {
        addressedCount: number;
        missedCount: number;
        overallScore: number;
    };
}

interface FeedbackItem {
    id: string;
    content: string;
    category: string;
    priority: string;
    status: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [emailModalOpen, setEmailModalOpen] = useState({ open: false, revisionId: "" });
    const [email, setEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${resolvedParams.id}`);
            if (!res.ok) throw new Error("Not found");
            setProject(await res.json());
        } catch (err) {
            router.push("/dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSendingEmail(true);

        try {
            const res = await fetch(`/api/report/${emailModalOpen.revisionId}/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientEmail: email }),
            });
            if (res.ok) {
                setEmailModalOpen({ open: false, revisionId: "" });
                setEmail("");
                alert("Email sent successfully!");
            } else {
                alert("Failed to send email. Check API configuration.");
            }
        } catch (e) {
            console.error(e);
            alert("Error sending email.");
        } finally {
            setSendingEmail(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [resolvedParams.id, router]);

    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-200">
            {/* Top Navigation Bar */}
            <div className="border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="p-2 lg:p-3 hover:bg-white/5 rounded-xl transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />
                        <div className="flex flex-col">
                            <span className="caption text-slate-500 hidden lg:block">Project Details</span>
                            <h1 className="text-lg lg:text-2xl font-bold text-white truncate max-w-[200px] lg:max-w-none">{project.name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="btn btn-primary">
                            <Plus className="w-5 h-5" />
                            Add Revision
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 lg:p-12 stack-lg pb-32">
                {/* Project Stats Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
                    <div className="card p-6 lg:p-8 flex items-center gap-6">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Target className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="caption text-muted-foreground">Client Name</span>
                            <span className="text-xl lg:text-2xl font-bold text-white">{project.clientName || "Private Client"}</span>
                        </div>
                    </div>
                    <div className="card p-6 lg:p-8 flex items-center gap-6">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <History className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="caption text-muted-foreground">Total Revisions</span>
                            <span className="text-xl lg:text-2xl font-bold text-white">{project.revisions.length} Rounds</span>
                        </div>
                    </div>
                    <div className="card p-6 lg:p-8 flex items-center gap-6">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-amber-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="caption text-muted-foreground">Avg. Speed</span>
                            <span className="text-xl lg:text-2xl font-bold text-white uppercase">{project.stats.avgResolutionTime || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Revision Timeline / Contents */}
                <div className="grid grid-cols-12 gap-8 lg:gap-12 pt-4">
                    <div className="col-span-12 lg:col-span-8 stack-lg">
                        <div className="flex items-center justify-between">
                            <h2 className="heading-2">Revision History</h2>
                            <p className="body-sm text-muted-foreground hidden lg:block">{project.revisions.length} records found</p>
                        </div>

                        {project.revisions.length === 0 ? (
                            <div className="card p-16 flex flex-col items-center text-center stack-md border-dashed">
                                <Zap className="w-12 h-12 text-muted-foreground/30" />
                                <div className="stack-sm">
                                    <h3 className="heading-4">No Revisions Yet</h3>
                                    <p className="body-base text-muted-foreground max-w-sm">Capture client feedback using the AI Parser to start tracking your project's revision journey.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="stack-md">
                                {project.revisions.map((rev) => (
                                    <RevisionCard
                                        key={rev.id}
                                        revision={rev}
                                        onUpdate={fetchProject}
                                        onEmail={() => setEmailModalOpen({ open: true, revisionId: rev.id })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info (Bottom on mobile) */}
                    <div className="col-span-12 lg:col-span-4 stack-lg">
                        <div className="stack-md">
                            <h3 className="heading-4">About Project</h3>
                            <div className="card p-6 lg:p-8 stack-md">
                                <div className="stack-sm">
                                    <span className="caption text-muted-foreground">Description</span>
                                    <p className="body-sm text-slate-300 leading-relaxed">
                                        {project.description || "No project description provided."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Email Modal */}
            {emailModalOpen.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-md card bg-[#09090b] shadow-2xl p-6 lg:p-8 stack-md">
                        <div className="flex items-center justify-between">
                            <h3 className="heading-4 text-white">Send Report via Email</h3>
                            <button onClick={() => setEmailModalOpen({ open: false, revisionId: "" })} className="text-slate-500 hover:text-white">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSendEmail} className="stack-md">
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground px-1">Client Email Address</label>
                                <input
                                    autoFocus
                                    type="email"
                                    required
                                    placeholder="client@example.com"
                                    className="input w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sendingEmail}
                                className="btn btn-primary w-full justify-center py-3 font-bold"
                            >
                                {sendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Report"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function RevisionCard({ revision, onUpdate, onEmail }: { revision: Revision; onUpdate: () => void; onEmail: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);

    const completedCount = revision.feedbackItems.filter(i => i.status === 'ADDRESSED').length;
    const totalCount = revision.feedbackItems.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleToggleStatus = async (itemId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ADDRESSED' ? 'PENDING' : 'ADDRESSED';
        setUpdatingItems(prev => new Set(prev).add(itemId));
        try { await fetch(`/api/feedback/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) }); onUpdate(); }
        catch (e) { console.error(e); }
        finally { setUpdatingItems(prev => { const next = new Set(prev); next.delete(itemId); return next; }); }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/report/${revision.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`card group transition-all overflow-hidden ${isExpanded ? 'ring-1 ring-indigo-500/50 bg-white/[0.02]' : 'hover:border-indigo-500/20'}`}>
            <div
                className="card-header flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-indigo-400 border border-white/5">
                        #{revision.revisionNumber}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-white">Revision Round {revision.revisionNumber}</span>
                            {revision.sentiment && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${revision.sentiment.toLowerCase() === 'frustrated' || revision.sentiment.toLowerCase() === 'negative'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : revision.sentiment.toLowerCase() === 'neutral'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                    {revision.sentiment}
                                </span>
                            )}
                            {revision.tone && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
                                    {revision.tone}
                                </span>
                            )}
                        </div>
                        <span className="caption text-muted-foreground">{new Date(revision.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 lg:gap-8">
                    {/* Progress Bar - Visible on Mobile too now */}
                    <div className="flex flex-col items-end gap-1 min-w-[120px]">
                        <div className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider">
                            <span className={progress === 100 ? "text-emerald-400" : "text-slate-500"}>{progress}% Done</span>
                            <span className="text-slate-600">{completedCount}/{totalCount}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="card-content bg-black/20 border-t border-white/5 stack-md">
                    {revision.revisionSummary && (
                        <div className="p-4 lg:p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <span className="caption text-indigo-400 block mb-2 font-bold flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> AI Analysis Summary
                            </span>
                            <p className="text-sm text-indigo-200/80 leading-relaxed">{revision.revisionSummary}</p>
                        </div>
                    )}

                    <div className="stack-sm">
                        <h4 className="caption text-muted-foreground uppercase tracking-widest pl-1">Action Items Checklist</h4>
                        <div className="space-y-2">
                            {revision.feedbackItems.map((item) => {
                                const isDone = item.status === 'ADDRESSED';
                                const isUpdating = updatingItems.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => !isUpdating && handleToggleStatus(item.id, item.status)}
                                        className={`group/item flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isDone
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${isDone
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'border-slate-600 group-hover/item:border-indigo-400'
                                            }`}>
                                            {isUpdating ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <p className={`text-sm leading-relaxed transition-colors flex-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                            {item.content}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/5">
                        <button
                            onClick={onEmail}
                            className="btn btn-secondary justify-center text-xs font-bold uppercase tracking-widest gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Email to Client
                        </button>
                        <button
                            onClick={copyLink}
                            className="btn btn-secondary justify-center text-xs font-bold uppercase tracking-widest gap-2 min-w-[140px]"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <a
                            href={`/report/${revision.id}`}
                            target="_blank"
                            className="btn btn-primary justify-center text-xs font-bold uppercase tracking-widest gap-2"
                        >
                            View Report <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
