'use client';
import { useState, useEffect } from 'react';
import {
    Settings, MessageCircle, Send, Save, CheckCircle2,
    Video, Plus, Trash2, Eye, EyeOff, Clock, GripVertical
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [expiryDays, setExpiryDays] = useState(3);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const [tutorials, setTutorials] = useState([]);
    const [tutorialsLoading, setTutorialsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [addingTutorial, setAddingTutorial] = useState(false);

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((d) => { setWhatsappNumber(d.whatsappNumber || ''); setTelegramUsername(d.telegramUsername || ''); setExpiryDays(d.calculationExpiryDays || 3); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch('/api/tutorials?admin=true')
            .then((r) => r.json())
            .then((d) => { setTutorials(d.tutorials || []); setTutorialsLoading(false); })
            .catch(() => setTutorialsLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true); setSaved(false);
        try {
            await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ whatsappNumber, telegramUsername, calculationExpiryDays: expiryDays }) });
            setSaved(true); setTimeout(() => setSaved(false), 3000);
        } catch { alert('Settings save failed.'); }
        setSaving(false);
    };

    const handleAddTutorial = async () => {
        if (!newTitle.trim() || !newVideoUrl.trim()) return;
        setAddingTutorial(true);
        try {
            const res = await fetch('/api/tutorials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle, description: newDescription, videoUrl: newVideoUrl, order: tutorials.length }) });
            const tutorial = await res.json();
            setTutorials((p) => [...p, tutorial]);
            setNewTitle(''); setNewDescription(''); setNewVideoUrl(''); setShowAddForm(false);
        } catch { alert('Failed to add tutorial.'); }
        setAddingTutorial(false);
    };

    const handleDeleteTutorial = async (id) => {
        if (!confirm('Delete this tutorial?')) return;
        try { await fetch(`/api/tutorials?id=${id}`, { method: 'DELETE' }); setTutorials((p) => p.filter((t) => t._id !== id)); } catch { alert('Failed to delete.'); }
    };

    const handleTogglePublished = async (tutorial) => {
        try {
            await fetch('/api/tutorials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tutorial._id, published: !tutorial.published }) });
            setTutorials((p) => p.map((t) => (t._id === tutorial._id ? { ...t, published: !t.published } : t)));
        } catch { alert('Failed to update.'); }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl animate-pulse space-y-6">
                <div className="h-8 w-48 rounded-lg bg-slate-200" />
                <div className="h-96 rounded-2xl border border-slate-100 bg-white" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <Settings className="h-6 w-6 text-teal-600" /> Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500">Configure global application settings and manage content.</p>
            </div>

            {/* General Config */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <MessageCircle size={18} className="text-teal-600" /> General Configuration
                    </h3>
                </div>

                <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><MessageCircle size={14} /> WhatsApp Number</label>
                            <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="8801XXXXXXXXX" />
                            <p className="text-xs text-slate-400">Include country code, without &apos;+&apos; (e.g. 8801712345678)</p>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><Send size={14} /> Telegram Username</label>
                            <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="cloudprint_bd" />
                            <p className="text-xs text-slate-400">Without &apos;@&apos; symbol (e.g. cloudprint_bd)</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="max-w-md space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><Clock size={14} /> Calculation Expiry (Days)</label>
                            <div className="flex items-center gap-4">
                                <input type="number" min="1" max="30" className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-bold transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={expiryDays} onChange={(e) => setExpiryDays(Math.max(1, Number(e.target.value)))} />
                                <p className="flex-1 text-xs text-slate-500">Shared calculations auto-delete after this many days (Default: 3).</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                    <button onClick={handleSave} disabled={saving} className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${saved ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md'}`}>
                        {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tutorial Management */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Video size={18} className="text-teal-600" /> Tutorial Management</h3>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100">
                        <Plus size={14} /> {showAddForm ? 'Cancel' : 'Add Tutorial'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="space-y-4 border-b border-slate-100 bg-teal-50/30 p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
                                <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="How to upload PDF" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Video URL *</label>
                                <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="YouTube Link" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
                                <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description (optional)" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDescription(''); setNewVideoUrl(''); }} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">Cancel</button>
                            <button onClick={handleAddTutorial} disabled={addingTutorial || !newTitle.trim() || !newVideoUrl.trim()} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50">{addingTutorial ? 'Adding...' : 'Add Tutorial'}</button>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-slate-50">
                    {tutorialsLoading ? (
                        <div className="space-y-4 p-6">{[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-50" />)}</div>
                    ) : tutorials.length > 0 ? (
                        tutorials.map((t) => (
                            <div key={t._id} className={`group flex flex-col gap-4 p-4 transition-all hover:bg-slate-50/60 sm:flex-row sm:items-center ${!t.published ? 'bg-slate-50/30 opacity-60' : ''}`}>
                                <div className="hidden text-slate-300 sm:block"><GripVertical size={16} /></div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate font-medium text-slate-900 transition-colors group-hover:text-teal-700">{t.title}</h4>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">{t.description || 'No description'}</p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button onClick={() => handleTogglePublished(t)} className={`rounded-lg border p-2 transition-colors ${t.published ? 'border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100' : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200'}`} title={t.published ? 'Unpublish' : 'Publish'}>
                                        {t.published ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button onClick={() => handleDeleteTutorial(t._id)} className="rounded-lg border border-slate-200 bg-white p-2 text-rose-500 transition-colors hover:border-rose-200 hover:bg-rose-50" title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-3 rounded-full bg-slate-100 p-4"><Video className="h-8 w-8 text-slate-300" /></div>
                            <p className="font-medium text-slate-500">No tutorials found</p>
                            <p className="mt-1 text-xs text-slate-400">Add video tutorials to help users.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
