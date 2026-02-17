'use client';
import { useState, useEffect } from 'react';
import {
    Eye, Users, Calculator, MousePointerClick, FileArchive, Merge,
    Scissors, SunMoon, TrendingUp, CalendarDays, ArrowUpRight, Activity
} from 'lucide-react';

const TOOL_META = {
    compress: { icon: FileArchive, label: 'Compress', color: 'text-blue-600', bg: 'bg-blue-50' },
    merge: { icon: Merge, label: 'Merge', color: 'text-violet-600', bg: 'bg-violet-50' },
    split: { icon: Scissors, label: 'Split', color: 'text-amber-600', bg: 'bg-amber-50' },
    invert: { icon: SunMoon, label: 'Invert', color: 'text-rose-600', bg: 'bg-rose-50' },
};

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics?days=30')
            .then((res) => res.json())
            .then((data) => { setAnalytics(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-52 rounded-lg bg-slate-200" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-36 rounded-2xl border border-slate-100 bg-white" />
                    ))}
                </div>
            </div>
        );
    }

    const totals = analytics?.totals || {};

    const stats = [
        { label: 'Page Views', value: totals.pageViews || 0, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-500/10' },
        { label: 'Visitors', value: totals.uniqueVisitors || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-500/10' },
        { label: 'Calculator', value: totals.calculatorUsage || 0, icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-500/10' },
        { label: 'Orders', value: totals.orderClicks || 0, icon: MousePointerClick, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-500/10' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <TrendingUp className="h-6 w-6 text-teal-600" />
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Key metrics for the last 30 days.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                    <CalendarDays size={14} className="text-slate-400" />
                    Last 30 Days
                </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div
                            key={s.label}
                            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className={`rounded-xl p-2.5 ${s.bg} ring-4 ${s.ring}`}>
                                    <Icon size={20} className={s.color} />
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                    <ArrowUpRight size={12} /> +12%
                                </span>
                            </div>
                            <p className="mb-1 text-sm font-medium text-slate-500">{s.label}</p>
                            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                {s.value.toLocaleString()}
                            </p>
                            {/* Decorative bottom gradient on hover */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    );
                })}
            </div>

            {/* Tool Usage + Chart placeholder */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Tool Usage */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
                        <FileArchive className="h-5 w-5 text-slate-400" />
                        Tool Usage
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Object.entries(TOOL_META).map(([key, meta]) => {
                            const Icon = meta.icon;
                            const count = totals.toolsUsage?.[key] || 0;
                            return (
                                <div
                                    key={key}
                                    className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-teal-200 hover:bg-white hover:shadow-sm"
                                >
                                    <div className={`mb-3 rounded-full ${meta.bg} p-3 shadow-sm`}>
                                        <Icon size={22} className={meta.color} />
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        {meta.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart placeholder */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                    <Activity className="mb-3 h-10 w-10 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">Activity Chart</p>
                    <p className="mt-1 text-xs text-slate-300">Coming Soon</p>
                </div>
            </div>

            {/* Recent Traffic Table */}
            {analytics?.analytics?.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="font-semibold text-slate-900">Recent Traffic</h3>
                        <button className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700">
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 text-right font-medium">Page Views</th>
                                    <th className="px-6 py-3 text-right font-medium">Visitors</th>
                                    <th className="px-6 py-3 text-right font-medium">Calc</th>
                                    <th className="px-6 py-3 text-right font-medium">Orders</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.analytics.slice(0, 7).map((day) => (
                                    <tr key={day.date} className="transition-colors hover:bg-slate-50/60">
                                        <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-800">
                                            {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.pageViews}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.uniqueVisitors}</td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                {day.calculatorUsage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                                {day.orderClicks}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
