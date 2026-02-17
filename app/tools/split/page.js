'use client';
import { useState } from 'react';
import { splitPdf, mergePdfs, getPdfPageCount, downloadBlob } from '@/lib/pdf-utils';
import { trackToolUsage } from '@/lib/track';
import { Upload, Scissors, FileText, Trash2, Download, Layers } from 'lucide-react';

export default function SplitPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mergeAfterSplit, setMergeAfterSplit] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileAdd = async (newFiles) => {
        setUploading(true);
        setResult(null);
        const entries = [];
        for (const file of Array.from(newFiles)) {
            if (file.type !== 'application/pdf') continue;
            try {
                const pageCount = await getPdfPageCount(file);
                entries.push({ id: Date.now() + Math.random(), file, name: file.name, pageCount, splitFrom: 1, splitTo: pageCount });
            } catch (err) { console.error('Error reading PDF:', file.name, err); }
        }
        setFiles((prev) => [...prev, ...entries]);
        setUploading(false);
    };

    const updateFile = (id, field, value) => setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
    const removeFile = (id) => { setFiles((prev) => prev.filter((f) => f.id !== id)); setResult(null); };

    const handleSplit = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setResult(null);
        trackToolUsage('split');
        try {
            const allBlobs = [];
            for (const entry of files) {
                const blobs = await splitPdf(entry.file, [[entry.splitFrom, entry.splitTo]]);
                if (blobs[0]) allBlobs.push({ blob: blobs[0], name: entry.name, from: entry.splitFrom, to: entry.splitTo });
            }
            if (mergeAfterSplit && allBlobs.length > 1) {
                const fileObjects = allBlobs.map((b, i) => new File([b.blob], `split_${i + 1}.pdf`, { type: 'application/pdf' }));
                const mergedBlob = await mergePdfs(fileObjects);
                setResult({ type: 'merged', blob: mergedBlob, totalPages: allBlobs.reduce((s, b) => s + (b.to - b.from + 1), 0), fileCount: allBlobs.length });
            } else {
                setResult({ type: 'individual', blobs: allBlobs });
            }
        } catch (err) { console.error('Split error:', err); alert('PDF স্প্লিট করতে সমস্যা হয়েছে।'); }
        setLoading(false);
    };

    const handleReset = () => { setFiles([]); setResult(null); setMergeAfterSplit(false); };

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[640px] px-6 py-12">
                <h1 className="mb-2 flex items-center gap-3 text-[clamp(1.5rem,4vw,2rem)] font-bold text-slate-900">
                    <Scissors size={28} className="text-teal-600" /> PDF স্প্লিট
                </h1>
                <p className="mb-8 text-slate-500">একাধিক PDF ফাইলের নির্দিষ্ট পৃষ্ঠাগুলো আলাদা করুন</p>

                {!result && (
                    <>
                        <div className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-all hover:border-teal-500 hover:bg-teal-50/50" onClick={() => document.getElementById('split-input').click()}>
                            <Upload size={36} className="text-slate-400" strokeWidth={1.5} />
                            <p className="font-semibold text-slate-700">PDF ফাইল সিলেক্ট করুন</p>
                            <p className="text-sm text-slate-400">একাধিক PDF একসাথে সিলেক্ট করতে পারবেন</p>
                            <input id="split-input" type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFileAdd(e.target.files)} />
                        </div>
                        {uploading && (
                            <div className="mt-4 flex items-center justify-center gap-3 text-slate-500">
                                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" /> PDF পড়া হচ্ছে...
                            </div>
                        )}
                    </>
                )}

                {files.length > 0 && !result && (
                    <div className="mt-6 space-y-3">
                        {files.map((entry) => (
                            <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText size={18} className="text-slate-400" />
                                        <span className="font-semibold text-slate-700">{entry.name}</span>
                                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{entry.pageCount} পৃষ্ঠা</span>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500" onClick={() => removeFile(entry.id)}><Trash2 size={16} /></button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="mb-1 block text-xs font-medium text-slate-500">শুরু পৃষ্ঠা</label>
                                        <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" min={1} max={entry.pageCount} value={entry.splitFrom} onChange={(e) => updateFile(entry.id, 'splitFrom', Math.max(1, Math.min(entry.pageCount, Number(e.target.value))))} />
                                    </div>
                                    <span className="pt-5 text-sm text-slate-400">থেকে</span>
                                    <div className="flex-1">
                                        <label className="mb-1 block text-xs font-medium text-slate-500">শেষ পৃষ্ঠা</label>
                                        <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" min={entry.splitFrom} max={entry.pageCount} value={entry.splitTo} onChange={(e) => updateFile(entry.id, 'splitTo', Math.max(entry.splitFrom, Math.min(entry.pageCount, Number(e.target.value))))} />
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">{entry.splitTo - entry.splitFrom + 1}টি পৃষ্ঠা আলাদা করা হবে</p>
                            </div>
                        ))}

                        {files.length > 1 && (
                            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${mergeAfterSplit ? 'border-teal-500 bg-teal-50' : 'border-transparent bg-slate-50'}`}>
                                <input type="checkbox" checked={mergeAfterSplit} onChange={(e) => setMergeAfterSplit(e.target.checked)} className="h-4.5 w-4.5 accent-teal-600" />
                                <Layers size={18} className={mergeAfterSplit ? 'text-teal-600' : 'text-slate-400'} />
                                <div>
                                    <span className={`font-semibold ${mergeAfterSplit ? 'text-teal-700' : 'text-slate-700'}`}>স্প্লিটের পর মার্জ করুন</span>
                                    <p className="text-xs text-slate-400">সব স্প্লিট করা অংশ একটি PDF-এ একত্রিত হবে</p>
                                </div>
                            </label>
                        )}

                        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600 disabled:opacity-60" onClick={handleSplit} disabled={loading}>
                            {loading ? <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> প্রসেস হচ্ছে...</> : <><Scissors size={20} /> {files.length}টি PDF স্প্লিট করুন{mergeAfterSplit ? ' ও মার্জ করুন' : ''}</>}
                        </button>
                    </div>
                )}

                {result && result.type === 'merged' && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                        <div className="mb-4 text-5xl">✅</div>
                        <h3 className="text-xl font-bold text-slate-900">স্প্লিট ও মার্জ সম্পন্ন!</h3>
                        <p className="mt-2 text-sm text-slate-500">{result.fileCount}টি PDF থেকে নির্বাচিত অংশ একত্রিত হয়েছে</p>
                        <p className="mb-6 mt-1 text-2xl font-bold text-teal-700" style={{ fontFamily: 'Inter, sans-serif' }}>মোট {result.totalPages} পৃষ্ঠা</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => downloadBlob(result.blob, 'split_merged.pdf')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white transition-all hover:from-teal-700 hover:to-teal-600"><Download size={20} /> ডাউনলোড করুন</button>
                            <button onClick={handleReset} className="w-full rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50">আরেকবার স্প্লিট করুন</button>
                        </div>
                    </div>
                )}

                {result && result.type === 'individual' && (
                    <div className="mt-6">
                        <div className="mb-4 text-center text-5xl">✅</div>
                        <h3 className="mb-4 text-center text-xl font-bold text-slate-900">স্প্লিট সম্পন্ন!</h3>
                        <div className="space-y-2">
                            {result.blobs.map((b, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                                    <div className="flex items-center gap-2"><FileText size={18} className="text-slate-400" /><span className="text-sm">{b.name} (পৃষ্ঠা {b.from}-{b.to})</span></div>
                                    <button onClick={() => downloadBlob(b.blob, `split_${b.from}-${b.to}_${b.name}`)} className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"><Download size={14} /> ডাউনলোড</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleReset} className="mt-4 w-full rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50">আরেকবার স্প্লিট করুন</button>
                    </div>
                )}
            </div>
        </div>
    );
}
