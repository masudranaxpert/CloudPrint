'use client';
import { useState, useEffect } from 'react';
import { Calculator, Clock, FileText, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/price-calculator';

export default function AdminCalculationsPage() {
    const [calculations, setCalculations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCalcs = () => {
        setLoading(true);
        fetch('/api/calculations?all=true')
            .then((res) => res.json())
            .then((data) => { setCalculations(data.calculations || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchCalcs(); }, []);

    const handleCleanup = async () => {
        await fetch('/api/calculations/cleanup', { method: 'POST' });
        fetchCalcs();
    };

    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const isExpired = (d) => new Date(d) < new Date();

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <Calculator className="h-6 w-6 text-teal-600" /> Calculations
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">View history of user price calculations.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCalcs} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button onClick={handleCleanup} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm transition-colors hover:bg-rose-50">
                        <Trash2 size={16} /> Cleanup
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-white" />
                    ))}
                </div>
            ) : calculations.length > 0 ? (
                <div className="space-y-4">
                    {calculations.map((calc) => {
                        const expired = isExpired(calc.expiresAt);
                        return (
                            <div
                                key={calc._id}
                                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${expired ? 'border-slate-100 opacity-50' : 'border-slate-100 hover:border-teal-200'}`}
                            >
                                <div className="flex flex-col justify-between gap-4 md:flex-row">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${expired ? 'border-slate-200 bg-slate-100 text-slate-500' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
                                                {expired ? 'Expired' : 'Active'}
                                            </span>
                                            <span className="font-mono text-xs text-slate-400">#{calc._id.slice(-6)}</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            {calc.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <FileText size={14} className="shrink-0 text-slate-400" />
                                                    <span className="truncate font-medium">{item.fileName}</span>
                                                    <span className="text-xs text-slate-400">
                                                        ({item.pageCount} pgs &bull; {item.printType === 'color' ? 'Color' : 'B&W'} &bull; {item.slidesPerPage}up)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                            <Clock size={12} /> {fmt(calc.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 md:min-w-[140px] md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:pl-5 md:pt-0">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold tracking-tight text-teal-600">{formatPrice(calc.grandTotal || 0)}</div>
                                            <div className="text-xs font-medium text-slate-400">{calc.totalSheets} sheets</div>
                                        </div>
                                        {!expired && (
                                            <a
                                                href={`/calculator?id=${calc._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-600 transition-colors hover:bg-teal-100"
                                            >
                                                Open <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mb-3 rounded-full bg-slate-100 p-4"><Calculator className="h-8 w-8 text-slate-300" /></div>
                    <p className="font-medium text-slate-500">No calculation history found</p>
                </div>
            )}
        </div>
    );
}
