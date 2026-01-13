"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MessageSquarePlus, Sparkles } from "lucide-react";

interface User {
    id: string;
    email: string;
    name: string | null;
}

export default function ClientPortalPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();

                if (!authData.user) {
                    router.push("/");
                    return;
                }
                setUser(authData.user);
            } catch {
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* White/Clean Theme for Clients */}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tight">
                            Client<span className="text-indigo-600">Portal</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">{user?.name || "Guest Client"}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        What's on your mind?
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Share your feedback, ideas, or approval on the latest designs. We'll verify it instantly.
                    </p>
                </div>

                {/* Functionality Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Share Feedback Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                            <MessageSquarePlus className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Feedback</h2>
                        <p className="text-slate-500 leading-relaxed">
                            Have comments on the latest build? Drop them here. Our AI will structure them for the team.
                        </p>
                    </div>

                    {/* View Progress Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-500">
                            <Sparkles className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">View Progress</h2>
                        <p className="text-slate-500 leading-relaxed">
                            Check the status of your requests and see what's been completed.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
