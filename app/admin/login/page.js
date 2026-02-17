'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cloud, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/80 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="relative border-b border-slate-700/50 bg-slate-800/50 px-8 pb-8 pt-10 text-center">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500" />
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                            <Cloud className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                        <p className="mt-1 text-sm text-slate-400">Sign in to manage CloudPrint</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <Mail size={14} className="text-slate-500" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    placeholder="admin@cloudprint.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <Lock size={14} className="text-slate-500" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-600 hover:to-emerald-700 hover:shadow-teal-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={14} />
                            Protected by CloudPrint Security
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
