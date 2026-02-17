'use client';
import { useState, useEffect } from 'react';
import { Tags, DollarSign, Save, CheckCircle2 } from 'lucide-react';

export default function AdminPricingPage() {
    const [pricing, setPricing] = useState({ blackWhitePerPage: 0, colorPerPage: 0, slidesPerPageOptions: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetch('/api/pricing')
            .then((r) => r.json())
            .then((d) => { setPricing(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true); setMessage({ text: '', type: '' });
        try {
            const res = await fetch('/api/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pricing) });
            setMessage(res.ok ? { text: 'Pricing updated successfully!', type: 'success' } : { text: 'Failed to update pricing.', type: 'error' });
        } catch { setMessage({ text: 'An unexpected error occurred.', type: 'error' }); }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl animate-pulse space-y-6">
                <div className="h-8 w-48 rounded-lg bg-slate-200" />
                <div className="h-96 rounded-2xl border border-slate-100 bg-white" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-10">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <Tags className="h-6 w-6 text-teal-600" /> Pricing Configuration
                </h1>
                <p className="mt-1 text-sm text-slate-500">Manage printing costs and slide options.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <DollarSign size={18} className="text-teal-600" /> Base Rates Per Sheet (BDT)
                    </h3>
                </div>

                <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Black & White (B&W)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                                <input type="number" step="0.1" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 font-mono text-lg font-bold text-slate-900 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={pricing?.blackWhitePerPage || ''} onChange={(e) => setPricing({ ...pricing, blackWhitePerPage: Number(e.target.value) })} />
                            </div>
                            <p className="text-xs text-slate-400">Rate for one sheet (2 pages)</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Color Print</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                                <input type="number" step="0.1" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 font-mono text-lg font-bold text-slate-900 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={pricing?.colorPerPage || ''} onChange={(e) => setPricing({ ...pricing, colorPerPage: Number(e.target.value) })} />
                            </div>
                            <p className="text-xs text-slate-400">Rate for one sheet (2 pages)</p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border border-teal-200/60 bg-teal-50/50 p-4">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-800">Summary</h4>
                        <div className="space-y-2 text-sm text-teal-900">
                            <div className="flex items-center justify-between"><span>B&W Cost</span><span className="font-mono font-bold">৳{pricing?.blackWhitePerPage} / sheet</span></div>
                            <div className="flex items-center justify-between"><span>Color Cost</span><span className="font-mono font-bold">৳{pricing?.colorPerPage} / sheet</span></div>
                            <div className="mt-2 flex items-center justify-between border-t border-teal-200/50 pt-2 text-xs text-teal-700">
                                <span>Slides per Page</span>
                                <span className="font-mono">{pricing?.slidesPerPageOptions?.join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                            {message.type === 'success' && <CheckCircle2 size={16} />}
                            {message.text}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                    <button onClick={handleSave} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
                        {saving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Save size={20} /> Update Pricing</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
