"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2, LogOut, FolderPlus, Sparkles, CheckCircle2,
    MessageCircleQuestion, Send, Folder, ChevronRight,
    Zap, LayoutDashboard, Settings, Plus, Clock, MoreVertical,
    Trash2, Edit2, Save, Search, ArrowUpDown, BarChart3, Layers, Download,
    Chrome, Globe, Wand2, Lightbulb, AlertTriangle
} from "lucide-react";

interface User {
    id: string;
    email: string;
    name: string | null;
}

interface Project {
    id: string;
    name: string;
    clientName: string | null;
    description: string | null;
    updatedAt: string;
    _count: { revisions: number };
}

interface AnalysisResult {
    tasks: string[];
    questions: string[];
    sentiment: string;
    tone: string;
    summary: string;
    patterns: string[];
    confidenceScore: number;
    conflicts?: {
        roundNumber: number;
        originalRequest: string;
        currentRequest: string;
        explanation: string;
    }[];
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackInput, setFeedbackInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha">("newest");

    // Sidebars & Modals
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"parser" | "lab">("parser");

    // Project States
    const [newProject, setNewProject] = useState({ name: "", clientName: "", description: "" });
    const [isCreating, setIsCreating] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Flow States
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [isSavingRevision, setIsSavingRevision] = useState(false);

    // Inspiration Lab States
    const [inspirationUrl, setInspirationUrl] = useState("");
    const [isInhaling, setIsInhaling] = useState(false);
    const [labResult, setLabResult] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchProjects = async () => {
        const projRes = await fetch("/api/projects");
        if (projRes.ok) {
            const data = await projRes.json();
            setProjects(data);
            if (data.length > 0 && !selectedProjectId) setSelectedProjectId(data[0].id);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (!authData.user) { router.push("/"); return; }
                setUser(authData.user);
                await fetchProjects();
            } catch { router.push("/"); }
            finally { setIsLoading(false); }
        };
        init();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.name.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProject),
            });
            if (res.ok) {
                await fetchProjects();
                setIsModalOpen(false);
                setNewProject({ name: "", clientName: "", description: "" });
            }
        } catch (e) { console.error(e); }
        finally { setIsCreating(false); }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;
        try {
            const res = await fetch(`/api/projects/${editingProject.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingProject),
            });
            if (res.ok) {
                await fetchProjects();
                setEditingProject(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) {
                await fetchProjects();
                if (selectedProjectId === id) setSelectedProjectId(projects.find(p => p.id !== id)?.id || "");
            }
        } catch (e) { console.error(e); }
        finally { setIsDeleting(false); }
    };

    const handleAnalyze = async () => {
        if (!feedbackInput.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await fetch("/api/analyze-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: feedbackInput,
                    projectId: selectedProjectId || undefined
                }),
            });
            if (res.ok) setAnalysisResult(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsAnalyzing(false); }
    };

    const handleSaveRevision = async () => {
        if (!analysisResult) return;
        if (!selectedProjectId) {
            alert("No project selected!");
            return;
        }
        setIsSavingRevision(true);
        try {
            const res = await fetch(`/api/projects/${selectedProjectId}/revisions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tasks: analysisResult.tasks,
                    questions: analysisResult.questions,
                    summary: analysisResult.summary,
                    rawFeedback: feedbackInput,
                    sentiment: analysisResult.sentiment,
                    tone: analysisResult.tone
                }),
            });
            if (res.ok) {
                router.push(`/projects/${selectedProjectId}`);
            }
        } catch (e) { console.error(e); }
        finally { setIsSavingRevision(false); }
    };

    const handleAnalyzeInspiration = async () => {
        if (!inspirationUrl.trim()) return;
        setIsInhaling(true);
        setLabResult(null);
        try {
            const res = await fetch("/api/analyze-inspiration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: inspirationUrl }),
            });
            if (res.ok) {
                setLabResult(await res.json());
            } else {
                const error = await res.json();
                alert(`Failed to analyze: ${error.error || 'Unknown error'}`);
                console.error("API Error:", error);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Network error: ${e.message}`);
        }
        finally { setIsInhaling(false); }
    };

    const totalProjects = projects.length;
    const totalRevisions = projects.reduce((acc, curr) => acc + curr._count.revisions, 0);

    const filteredProjects = projects
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())))
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            if (sortBy === "alpha") return a.name.localeCompare(b.name);
            return 0;
        });

    if (!isMounted || isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-200 flex flex-row relative">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#09090b] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between font-black tracking-tight text-white">
                    <div className="flex items-center gap-2">
                        <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                        <span>FEEDBACK<br />ENFORCER</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    <div className="space-y-2">
                        <span className="px-2 text-[10px] font-black text-slate-600 uppercase tracking-widest pl-3">Platform</span>
                        <div className="space-y-1">
                            <button onClick={() => setActiveTab("parser")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'parser' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                                <LayoutDashboard className="w-4 h-4" /> Feedback Parser
                            </button>
                            <button onClick={() => setActiveTab("lab")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lab' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                                <Wand2 className="w-4 h-4" /> Inspiration Lab
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Projects</span>
                            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-1">
                            {projects.map(p => (
                                <button key={p.id} onClick={() => router.push(`/projects/${p.id}`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all truncate">
                                    <Folder className="w-4 h-4 opacity-50" /> {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="bg-indigo-600/5 border border-indigo-600/10 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <Chrome className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Extension</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed font-medium">Extract feedback directly from Gmail or Slack.</p>
                        <button onClick={() => setIsExtensionModalOpen(true)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all">SETUP ASSISTANT</button>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors pl-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto bg-[#09090b]">
                <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-12">
                    {/* Header */}
                    <div className="flex items-end justify-between border-b border-white/5 pb-10">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">{activeTab === 'parser' ? 'FEEDBACK DNA' : 'INSPIRATION LAB'}</h1>
                            <p className="text-slate-500 mt-2 font-medium">{activeTab === 'parser' ? 'Paste client feedback to extract technical items' : 'Analyze competitor designs for strategic insights'}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Efficiency</span>
                                <span className="text-2xl font-black text-white">{totalRevisions} Rounds</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-12">
                        {/* Tool Column */}
                        <div className="col-span-12 lg:col-span-7 space-y-8">
                            {activeTab === 'parser' ? (
                                <div className="space-y-6">
                                    <div className="bg-[#0f0f13] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-50"><Sparkles className="w-12 h-12 text-indigo-500/20" /></div>
                                        <textarea
                                            value={feedbackInput}
                                            onChange={(e) => setFeedbackInput(e.target.value)}
                                            placeholder="Paste the 'Client Talk' here..."
                                            className="w-full h-80 bg-transparent border-none text-xl text-white placeholder:text-slate-700 focus:ring-0 resize-none font-medium leading-relaxed"
                                        />
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !feedbackInput.trim()}
                                            className="w-full h-16 bg-white text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all disabled:opacity-50"
                                        >
                                            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-6 h-6 fill-black" /> EXTRACT SIGNALS</>}
                                        </button>
                                    </div>

                                    {analysisResult && (
                                        <div className="bg-[#0f0f13] border border-emerald-500/10 rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-top-4">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full">Analysis Complete</div>
                                                    <span className="text-sm font-bold text-slate-500">Confidence: {analysisResult.confidenceScore}%</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-full">{analysisResult.sentiment}</span>
                                                    <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-full">{analysisResult.tone}</span>
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-black text-white mb-8">{analysisResult.summary}</h2>

                                            {analysisResult.conflicts && analysisResult.conflicts.length > 0 && (
                                                <div className="mb-10 p-6 bg-red-500/10 border-2 border-red-500/20 rounded-3xl space-y-4 animate-in shake duration-500">
                                                    <div className="flex items-center gap-3 text-red-400">
                                                        <AlertTriangle className="w-6 h-6" />
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">CIRCULAR LOOP DETECTED</h4>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {analysisResult.conflicts.map((conflict, i) => (
                                                            <div key={i} className="p-4 bg-black/40 rounded-2xl border border-red-500/10 space-y-3">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase">Original Round {conflict.roundNumber}</span>
                                                                        <p className="text-xs text-slate-300 italic">"{conflict.originalRequest}"</p>
                                                                    </div>
                                                                    <div className="space-y-1 text-right">
                                                                        <span className="text-[9px] font-black text-red-400 uppercase">New Contradiction</span>
                                                                        <p className="text-xs text-white font-bold">"{conflict.currentRequest}"</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[11px] text-red-300 font-medium pt-2 border-t border-red-500/10">
                                                                    <span className="font-black">DEFENSE STRATEGY:</span> {conflict.explanation}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-8 mb-10">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> Action Items
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {analysisResult.tasks.map((t, i) => <li key={i} className="text-sm text-slate-400 leading-relaxed border-l-2 border-emerald-500/30 pl-4">{t}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <MessageCircleQuestion className="w-4 h-4" /> Critical Gaps
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {analysisResult.questions.map((q, i) => <li key={i} className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-4">{q}</li>)}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Save to Round</p>
                                                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0">
                                                        {projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f0f13]">{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <button onClick={handleSaveRevision} disabled={isSavingRevision} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all">
                                                    {isSavingRevision ? <Loader2 className="w-4 h-4 animate-spin" /> : "COMMIT REVISION"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="bg-[#0f0f13] border border-white/5 rounded-[32px] p-8 space-y-6">
                                        <p className="text-slate-500 font-medium">Drop a URL below. I'll deconstruct the design DNA and give you a strategy.</p>
                                        <div className="flex gap-3">
                                            <input
                                                type="url"
                                                value={inspirationUrl}
                                                onChange={(e) => setInspirationUrl(e.target.value)}
                                                placeholder="https://stripe.com"
                                                className="w-full h-14 bg-white/5 border border-white/5 rounded-xl px-6 text-white font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                            />
                                            <button onClick={handleAnalyzeInspiration} disabled={isInhaling || !inspirationUrl.trim()} className="h-14 px-8 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all">
                                                {isInhaling ? <Loader2 className="w-5 h-5 animate-spin" /> : "INHALA DNA"}
                                            </button>
                                        </div>
                                    </div>

                                    {labResult && (
                                        <div className="bg-[#0f0f13] border border-indigo-500/20 rounded-[32px] p-10 space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                                            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                                                <div className="w-16 h-16 rounded-[24px] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20"><Globe className="w-8 h-8 text-indigo-400" /></div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-white">{labResult.title}</h3>
                                                    <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-sm">{labResult.vibe}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DESIGN PRINCIPLES</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {labResult.designPrinciples.map((p: any) => <span key={p} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300">{p}</span>)}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DOMINANT PALETTE</span>
                                                    <div className="flex gap-2">
                                                        {labResult.colorPalette.map((c: any) => <div key={c} className="w-10 h-10 rounded-xl border border-white/10 shadow-lg" style={{ backgroundColor: c }} title={c} />)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 bg-indigo-600/5 rounded-3xl border border-indigo-600/10">
                                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> CORE STRATEGY</h4>
                                                <p className="text-lg text-slate-300 font-medium leading-relaxed italic">{labResult.uxStrategy}</p>
                                            </div>

                                            <div className="space-y-6">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IMMEDIATE ACTIONS</span>
                                                <div className="grid gap-4">
                                                    {labResult.advice.map((a: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">{i + 1}</div>
                                                            <p className="text-sm text-slate-300 font-bold">{a}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Recent Projects Column */}
                        <div className="col-span-12 lg:col-span-5 space-y-8">
                            <div className="bg-[#0f0f13] border border-white/5 rounded-[32px] p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-white">ACTIVE FILES</h3>
                                    <div className="flex items-center gap-2">
                                        <Search className="w-4 h-4 text-slate-600" />
                                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter..." className="bg-transparent border-none text-xs text-white p-0 focus:ring-0 w-24" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {filteredProjects.map(p => (
                                        <div key={p.id} className="relative group">
                                            <button onClick={() => router.push(`/projects/${p.id}`)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors"><Folder className="w-6 h-6" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate">{p.name}</h4>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.clientName || 'Private'}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                            </button>
                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingProject(p); }} className="p-2 bg-white/5 hover:bg-indigo-600/20 rounded-lg text-slate-500 hover:text-indigo-400 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="p-2 bg-white/5 hover:bg-red-600/20 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {projects.length === 0 && <p className="text-center py-12 text-slate-700 text-sm font-bold">No projects archived yet.</p>}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-20"><Plus className="w-24 h-24 rotate-12" /></div>
                                <h3 className="text-2xl font-black mb-2">Build Proof.</h3>
                                <p className="text-indigo-100 text-sm font-medium mb-6 opacity-80">Stop revisions before they start. Create a new case study project now.</p>
                                <button onClick={() => setIsModalOpen(true)} className="px-6 h-12 bg-white text-indigo-600 font-black rounded-xl hover:scale-105 transition-all active:scale-95 shadow-xl">START NEW PROJECT</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-[#0f0f13] border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-3xl font-black text-white mb-2">New Target.</h2>
                        <p className="text-slate-500 mb-8 font-medium">Define your project parameters to start tracking revisions.</p>
                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                                <input autoFocus required value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Name</label>
                                <input value={newProject.clientName} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                            </div>
                            <button disabled={isCreating} className="w-full h-16 bg-white text-black font-black text-lg rounded-2xl mt-4 flex items-center justify-center">
                                {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "CREATE ARCHIVE"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Extension Setup Modal */}
            {isExtensionModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsExtensionModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-[#0f0f13] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="p-10">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"><Chrome className="w-8 h-8 text-white" /></div>
                                <div>
                                    <h3 className="text-3xl font-black text-white">Browser Force.</h3>
                                    <p className="text-slate-500 font-medium">Deploy the extension to 10x your speed.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <span className="text-2xl font-black text-indigo-500 mb-2 block">01</span>
                                    <p className="text-sm font-bold text-white mb-2">Download Kit</p>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-4">Get the secure ZIP bundle with one click.</p>
                                    <a href="/enforcer-extension.zip" download className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-colors"><Download className="w-3 h-3" /> CLICK TO DOWNLOAD</a>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <span className="text-2xl font-black text-indigo-500 mb-2 block">02</span>
                                    <p className="text-sm font-bold text-white mb-2">Active Dev Mode</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">Visit <code className="text-indigo-300">chrome://extensions</code> and toggle Developer Mode.</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <span className="text-2xl font-black text-indigo-500 mb-2 block">03</span>
                                    <p className="text-sm font-bold text-white mb-2">Load Library</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">Click "Load unpacked" and select your extracted folder.</p>
                                </div>
                                <div className="p-6 bg-indigo-600/10 rounded-3xl border border-indigo-600/20">
                                    <span className="text-2xl font-black text-emerald-500 mb-2 block">04</span>
                                    <p className="text-sm font-bold text-white mb-2">Ready to Enforce</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">Right-click any text in Gmail and hit <span className="text-white font-bold">"Enforce Feedback"</span>.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsExtensionModalOpen(false)} className="w-full h-16 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5">I'LL DO THIS NOW</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
