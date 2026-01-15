"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2, LogOut, FolderPlus, Sparkles, CheckCircle2,
    MessageCircleQuestion, Send, Folder, ChevronRight,
    Zap, LayoutDashboard, Settings, Plus, Clock, MoreVertical,
    Trash2, Edit2, Save, Search, ArrowUpDown, BarChart3, Layers
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

    // Mobile Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Create Project State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", clientName: "", description: "" });
    const [isCreating, setIsCreating] = useState(false);

    // Edit/Delete State
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Save Result to Project State
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [isSavingRevision, setIsSavingRevision] = useState(false);

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

    // Stats Calculation
    const totalProjects = projects.length;
    const totalRevisions = projects.reduce((acc, curr) => acc + curr._count.revisions, 0);

    const filteredProjects = projects
        .filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            if (sortBy === "alpha") return a.name.localeCompare(b.name);
            return 0;
        });

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
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                await fetchProjects();
                if (selectedProjectId === id) setSelectedProjectId(projects.find(p => p.id !== id)?.id || "");
            }
        } catch (e) { console.error(e); }
        finally { setIsDeleting(false); }
    };

    const handleSaveRevision = async () => {
        if (!analysisResult) return;

        if (!selectedProjectId) {
            alert("No project selected! Please create a project first to save this revision.");
            setIsModalOpen(true);
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
                    rawFeedback: feedbackInput
                }),
            });
            if (res.ok) {
                router.push(`/projects/${selectedProjectId}`);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save revision");
            }
        } catch (e) {
            console.error(e);
            alert("An unexpected error occurred while saving.");
        }
        finally { setIsSavingRevision(false); }
    };

    const handleAnalyze = async () => {
        if (!feedbackInput.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await fetch("/api/analyze-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: feedbackInput }),
            });
            if (res.ok) setAnalysisResult(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsAnalyzing(false); }
    };

    if (!isMounted || isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-200 flex flex-row relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#09090b] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="heading-4 text-white tracking-tight">Feedback<br />Enforcer</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-white/10">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 stack-lg">
                    <div className="stack-sm">
                        <span className="px-2 caption text-muted-foreground uppercase tracking-widest pl-3">Platform</span>
                        <nav className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white font-medium">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </nav>
                    </div>

                    <div className="stack-sm">
                        <div className="flex items-center justify-between px-2 pl-3">
                            <span className="caption text-muted-foreground uppercase tracking-widest">Projects</span>
                            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-white/10 rounded transition-colors">
                                <Plus className="w-4 h-4 text-slate-400 hover:text-white" />
                            </button>
                        </div>
                        <nav className="space-y-1" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => router.push(`/projects/${p.id}`)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm group"
                                >
                                    <Folder className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                    <span className="truncate">{p.name}</span>
                                </button>
                            ))}
                            {projects.length === 0 && (
                                <div className="px-3 py-4 text-xs text-slate-600 border border-dashed border-white/5 rounded-lg text-center">
                                    No projects created
                                </div>
                            )}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                    <div className="mt-4 px-3 flex items-center gap-3 pt-4 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.[0] || "U"}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-white truncate">{user?.name || "User"}</span>
                            <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#09090b] sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-slate-400">
                            <LayoutDashboard className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-white">Dashboard</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {user?.name?.[0] || "U"}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-4 lg:p-12 stack-lg pb-32">
                    {/* Header with Stats */}
                    <div className="flex flex-col gap-8 pb-10 border-b border-border">
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="heading-1">Overview</h1>
                                <p className="body-base text-muted-foreground" style={{ marginTop: 'var(--space-2)' }}>Manage feedback and project revisions</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn btn-primary btn-lg"
                            >
                                <Plus className="w-5 h-5" />
                                New Project
                            </button>
                        </div>

                        {/* Dashboard Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="card p-6 flex items-center gap-4 border-l-4 border-l-indigo-500">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="caption text-muted-foreground">Active Projects</p>
                                    <p className="heading-2">{totalProjects}</p>
                                </div>
                            </div>
                            <div className="card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="caption text-muted-foreground">Total Revisions</p>
                                    <p className="heading-2">{totalRevisions}</p>
                                </div>
                            </div>
                            <div className="card p-6 flex items-center gap-4 border-l-4 border-l-amber-500">
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="caption text-muted-foreground">Avg. Revisions</p>
                                    <p className="heading-2">{totalProjects > 0 ? (totalRevisions / totalProjects).toFixed(1) : 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12" style={{ gap: 'var(--space-10)' }}>
                        {/* AI Parser */}
                        <div className="col-span-12 lg:col-span-7 stack-md">
                            <div className="card shadow-2xl">
                                <div className="card-header">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            <span className="caption text-foreground">AI Feedback Parser</span>
                                        </div>
                                        <span className="caption text-muted-foreground">Llama 3.3 Engine</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <textarea
                                        value={feedbackInput}
                                        onChange={(e) => setFeedbackInput(e.target.value)}
                                        placeholder="Paste client feedback here... (emails, Slack messages, meeting notes)"
                                        className="input resize-none"
                                        style={{ height: '16rem', marginBottom: 'var(--space-4)' }}
                                    />
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !feedbackInput.trim()}
                                        className="btn btn-primary btn-lg w-full"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" />Parse Feedback</>}
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            {analysisResult && (
                                <div className="card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="card-content stack-lg">
                                        <div className="stack-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="caption text-primary">Analysis Summary</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="caption text-muted-foreground">Confidence Score:</span>
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${analysisResult.confidenceScore > 80 ? 'bg-emerald-500' : analysisResult.confidenceScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${analysisResult.confidenceScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="caption font-mono text-white">{analysisResult.confidenceScore}%</span>
                                                </div>
                                            </div>
                                            <h3 className="heading-3">{analysisResult.summary}</h3>
                                            <div className="flex gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
                                                <span className={`caption px-3 py-1.5 rounded border flex items-center gap-1.5 ${analysisResult.sentiment === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    analysisResult.sentiment === 'negative' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        analysisResult.sentiment === 'urgent' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                            'bg-white/5 border-white/10 text-muted-foreground'
                                                    }`}>
                                                    {analysisResult.sentiment === 'positive' && '😊'}
                                                    {analysisResult.sentiment === 'neutral' && '😐'}
                                                    {analysisResult.sentiment === 'negative' && '😤'}
                                                    {analysisResult.sentiment === 'urgent' && '🔥'}
                                                    <span className="uppercase">{analysisResult.sentiment}</span>
                                                </span>
                                                <span className="caption px-3 py-1.5 rounded bg-white/5 border border-white/10 text-muted-foreground">Tone: {analysisResult.tone}</span>
                                                {analysisResult.patterns && analysisResult.patterns.map((pattern, i) => (
                                                    <span key={i} className="caption px-3 py-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3" />
                                                        DNA: {pattern}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-border">
                                            <div className="stack-sm">
                                                <h4 className="caption text-emerald-400 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Action Items
                                                </h4>
                                                <ul className="stack-sm">
                                                    {analysisResult.tasks.map((t, i) => (
                                                        <li key={i} className="body-base text-slate-300 bg-white/[0.02] border border-white/5 rounded-lg leading-relaxed" style={{ padding: 'var(--space-4)' }}>{t}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="stack-sm">
                                                <h4 className="caption text-amber-400 flex items-center gap-2">
                                                    <MessageCircleQuestion className="w-4 h-4" /> Pending Questions
                                                </h4>
                                                <ul className="stack-sm">
                                                    {analysisResult.questions.map((q, i) => (
                                                        <li key={i} className="body-base text-slate-300 bg-white/[0.02] border border-white/5 rounded-lg leading-relaxed italic border-l-2 border-l-amber-500/30" style={{ padding: 'var(--space-4)' }}>{q}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-border mt-4">
                                            <div className="card bg-primary/5 border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="stack-sm">
                                                    <h4 className="body-lg font-black text-white">Save to Project</h4>
                                                    <p className="body-sm text-muted-foreground">Convert this analysis into a new revision round.</p>
                                                </div>
                                                {projects.length > 0 ? (
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <select
                                                            value={selectedProjectId}
                                                            onChange={(e) => setSelectedProjectId(e.target.value)}
                                                            className="input py-3 text-sm min-w-[200px]"
                                                        >
                                                            {projects.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={handleSaveRevision}
                                                            disabled={isSavingRevision}
                                                            className="btn btn-primary whitespace-nowrap"
                                                        >
                                                            {isSavingRevision ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Revision</>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                                                        <p className="text-sm font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-lg border border-amber-400/20">
                                                            No projects found. Create one to save this revision.
                                                        </p>
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="btn btn-primary w-full md:w-auto"
                                                        >
                                                            <Plus className="w-4 h-4" /> Create Project
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Projects */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="card shadow-xl flex flex-col" style={{ minHeight: '500px' }}>
                                <div style={{ padding: 'var(--space-6) var(--space-6) var(--space-5)', borderBottom: '1px solid rgb(var(--border) / 0.1)' }}>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="caption text-foreground">Projects List</span>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value as any)}
                                                    className="bg-transparent text-xs text-muted-foreground border-none outline-none cursor-pointer hover:text-white transition-colors text-right"
                                                >
                                                    <option value="newest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                    <option value="alpha">A-Z Name</option>
                                                </select>
                                                <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search projects..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="input w-full pl-9 py-2 text-sm bg-black/20 focus:bg-black/40 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 flex-1">
                                    {projects.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center" style={{ padding: 'var(--space-12)' }}>
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center" style={{ marginBottom: 'var(--space-4)' }}>
                                                <Folder className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <p className="body-base font-bold text-foreground/60" style={{ marginBottom: 'var(--space-2)' }}>No Projects Yet</p>
                                            <p className="body-sm text-muted-foreground max-w-[200px] leading-relaxed">Create your first project to start tracking client feedback</p>
                                        </div>
                                    ) : (
                                        <div className="stack-sm">
                                            {filteredProjects.length === 0 ? (
                                                <div className="py-12 text-center text-muted-foreground">
                                                    <p>No projects match your search.</p>
                                                    <button onClick={() => setSearchQuery("")} className="text-primary hover:underline mt-2 text-sm">Clear search</button>
                                                </div>
                                            ) : (
                                                filteredProjects.map((p) => (
                                                    <div key={p.id} className="relative group">
                                                        <button
                                                            onClick={() => router.push(`/projects/${p.id}`)}
                                                            className="w-full flex items-center gap-4 rounded-xl hover:bg-white/5 transition-all text-left" style={{ padding: 'var(--space-4)' }}
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                                <Folder className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="body-base font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</h4>
                                                                <p className="caption text-muted-foreground" style={{ marginTop: 'var(--space-1)' }}>{p.clientName || 'Private Client'}</p>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all transform group-hover:translate-x-1" />
                                                        </button>
                                                        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingProject(p); }}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: 'var(--space-4)', borderTop: '1px solid rgb(var(--border) / 0.1)' }}>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-2 caption text-muted-foreground hover:text-foreground transition-all"
                                    >
                                        Create New Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20 lg:p-10">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="card-header flex items-center justify-between">
                            <h2 className="heading-3">Create New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <Plus className="w-6 h-6 rotate-45 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="card-content stack-lg">
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Project Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Modern E-commerce Website"
                                />
                            </div>
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Client Name</label>
                                <input
                                    type="text"
                                    value={newProject.clientName}
                                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Description (Optional)</label>
                                <textarea
                                    value={newProject.description || ""}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="input min-h-[120px] resize-none"
                                    placeholder="Short summary of the project goals..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-muted flex-1 text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newProject.name.trim()}
                                    className="btn btn-primary btn-lg flex-1 font-black text-lg"
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20 lg:p-10">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingProject(null)} />
                    <div className="relative w-full max-w-xl card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="card-header flex items-center justify-between">
                            <h2 className="heading-3">Edit Project</h2>
                            <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <Plus className="w-6 h-6 rotate-45 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="card-content stack-lg">
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProject.name}
                                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Client Name</label>
                                <input
                                    type="text"
                                    value={editingProject.clientName || ""}
                                    onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="stack-sm">
                                <label className="caption text-muted-foreground ml-1">Description</label>
                                <textarea
                                    value={editingProject.description || ""}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    className="input min-h-[120px] resize-none"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="btn btn-muted flex-1 text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg flex-1 font-black text-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
