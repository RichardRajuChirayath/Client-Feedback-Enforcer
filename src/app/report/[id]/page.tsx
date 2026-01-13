"use client";

import { useEffect, useState, use } from "react";
import {
    Loader2, CheckCircle2, XCircle, AlertCircle,
    ShieldCheck, Activity, Target
} from "lucide-react";

interface PublicReport {
    id: string;
    revisionNumber: number;
    status: string;
    createdAt: string;
    revisionSummary: string | null;
    project: {
        name: string;
        clientName: string | null;
    };
    feedbackItems: {
        id: string;
        content: string;
        status: string;
        priority: string;
    }[];
}

export default function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [report, setReport] = useState<PublicReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/report/${resolvedParams.id}`);
                if (res.ok) setReport(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [resolvedParams.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-2xl font-bold">Report Not Found</h1>
                <p className="text-slate-400">This link may be invalid or expired.</p>
            </div>
        );
    }

    const completed = report.feedbackItems.filter(i => i.status === 'ADDRESSED').length;
    const total = report.feedbackItems.length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
            {/* Header */}
            <div className="bg-indigo-950/10 border-b border-white/5 py-12 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase border border-indigo-500/30">
                                Official Compliance Report
                            </span>
                            <span className="text-slate-500 text-sm">
                                {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                            {report.project.name}
                        </h1>
                        <p className="text-xl text-slate-400 font-medium">
                            Revision Round #{report.revisionNumber} • {report.project.clientName || "Client Review"}
                        </p>
                    </div>

                    {/* Score Card */}
                    <div className="bg-[#0A0A0B] p-6 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-6">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path
                                    className={`${score === 100 ? 'text-emerald-500' : 'text-indigo-500'} transition-all duration-1000`}
                                    strokeDasharray={`${score}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <span className="absolute text-xl font-black">{score}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-400 uppercase tracking-wider font-bold">Compliance Score</span>
                            <span className={`text-lg font-bold ${score === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                {score === 100 ? 'Fully Compliant' : `${completed}/${total} Items Solved`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                {/* Summary Section */}
                {report.revisionSummary && (
                    <div className="bg-[#0A0A0B] rounded-2xl border border-white/10 p-8">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-200">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            Revision Summary
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            {report.revisionSummary}
                        </p>
                    </div>
                )}

                {/* Items List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Target className="w-6 h-6 text-emerald-400" />
                            Action Items Status
                        </h3>
                    </div>

                    <div className="grid gap-4">
                        {report.feedbackItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-6 rounded-xl border flex items-start gap-4 transition-all ${item.status === 'ADDRESSED'
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-[#0A0A0B] border-white/10'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.status === 'ADDRESSED'
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-white/10 text-slate-400'
                                    }`}>
                                    {item.status === 'ADDRESSED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-lg font-medium leading-relaxed ${item.status === 'ADDRESSED' ? 'text-slate-200' : 'text-slate-300'
                                        }`}>
                                        {item.content}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${item.status === 'ADDRESSED'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {item.status === 'ADDRESSED' ? 'Addressed' : 'Pending'}
                                        </span>
                                        {item.priority === 'HIGH' && (
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-red-500/20 text-red-400 uppercase tracking-wider">
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-12 border-t border-white/5">
                    <div className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified by Feedback Enforcer</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
