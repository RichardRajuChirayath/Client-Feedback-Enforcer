"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, FolderPlus } from "lucide-react";

interface User {
    id: string;
    email: string;
    name: string | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();

                if (!data.user) {
                    router.push("/");
                    return;
                }

                setUser(data.user);
            } catch {
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="bg-mesh" />
            <div className="bg-dots" />

            {/* Header */}
            <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black">
                            <span className="text-primary">✓</span>FCC
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400 font-medium">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">{user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">
                            Welcome back, {user?.name || "there"} 👋
                        </h1>
                        <p className="text-slate-400 text-lg">Ready to refine some work?</p>
                    </div>
                    <button className="premium-button px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" />
                        New Project
                    </button>
                </div>

                {/* Empty State */}
                <div className="glass-card rounded-3xl p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <FolderPlus className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black mb-3">No Projects Yet</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        Create your first project to start tracking client feedback and ensuring nothing gets missed.
                    </p>
                    <button className="premium-button px-8 py-4 rounded-xl text-white font-bold text-lg">
                        Create First Project
                    </button>
                </div>
            </main>
        </div>
    );
}
