'use client';
import { useState, useEffect } from 'react';
import { BarChart3, Eye, Users, Calculator, MousePointerClick, FileArchive, Merge, Scissors, SunMoon } from 'lucide-react';

const TOOL_META = {
    compress: { icon: FileArchive, label: 'Compress', color: 'text-blue-600', bg: 'bg-blue-50' },
    merge: { icon: Merge, label: 'Merge', color: 'text-violet-600', bg: 'bg-violet-50' },
    split: { icon: Scissors, label: 'Split', color: 'text-amber-600', bg: 'bg-amber-50' },
    invert: { icon: SunMoon, label: 'Invert', color: 'text-rose-600', bg: 'bg-rose-50' },
};

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/analytics?days=${days}`)
            .then((r) => r.json())
            .then((d) => { setAnalytics(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [days]);

    const totals = analytics?.totals || {};

    const stats = [
        { label: 'Page Views', value: totals.pageViews || 0, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Unique Visitors', value: totals.uniqueVisitors || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Calculator Used', value: totals.calculatorUsage || 0, icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Order Clicks', value: totals.orderClicks || 0, icon: MousePointerClick, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-48 rounded-lg bg-slate-200" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl border border-slate-100 bg-white" />)}
                </div>
                <div className="h-64 rounded-2xl border border-slate-100 bg-white" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <BarChart3 className="h-6 w-6 text-teal-600" /> Detailed Analytics
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Traffic and usage statistics.</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {[7, 14, 30].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${days === d ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${s.bg}`}>
                                <Icon size={20} className={s.color} />
                            </div>
                            <p className="mb-1 text-sm font-medium text-slate-500">{s.label}</p>
                            <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value.toLocaleString()}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tool Usage */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h3 className="font-semibold text-slate-900">PDF Tool Usage (Last {days} days)</h3>
                </div>
                <div className="grid grid-cols-2 gap-5 p-6 md:grid-cols-4">
                    {Object.entries(TOOL_META).map(([key, meta]) => {
                        const Icon = meta.icon;
                        const count = totals.toolsUsage?.[key] || 0;
                        return (
                            <div key={key} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                <div className={`mb-3 rounded-full ${meta.bg} p-3`}>
                                    <Icon size={22} className={meta.color} />
                                </div>
                                <span className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</span>
                                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{meta.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Table */}
            {analytics?.analytics?.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <h3 className="font-semibold text-slate-900">Daily Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 text-right font-medium">Views</th>
                                    <th className="px-6 py-3 text-right font-medium">Visitors</th>
                                    <th className="px-6 py-3 text-right font-medium">Calc</th>
                                    <th className="px-6 py-3 text-right font-medium">Orders</th>
                                    <th className="px-6 py-3 text-right font-medium text-teal-600">Compress</th>
                                    <th className="px-6 py-3 text-right font-medium text-teal-600">Merge</th>
                                    <th className="px-6 py-3 text-right font-medium text-teal-600">Split</th>
                                    <th className="px-6 py-3 text-right font-medium text-teal-600">Invert</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.analytics.map((day) => (
                                    <tr key={day.date} className="transition-colors hover:bg-slate-50/60">
                                        <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-800">{new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.pageViews}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.uniqueVisitors}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.calculatorUsage}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-600">{day.orderClicks}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-400">{day.toolsUsage?.compress || 0}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-400">{day.toolsUsage?.merge || 0}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-400">{day.toolsUsage?.split || 0}</td>
                                        <td className="px-6 py-3.5 text-right font-mono text-slate-400">{day.toolsUsage?.invert || 0}</td>
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
