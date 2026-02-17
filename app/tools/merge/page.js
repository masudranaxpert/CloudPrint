'use client';
import { useState } from 'react';
import { mergePdfs, getPdfPageCount, downloadBlob } from '@/lib/pdf-utils';
import { trackToolUsage } from '@/lib/track';
import { Upload, FileText, Trash2, Download, Layers } from 'lucide-react';

export default function MergePage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mergedBlob, setMergedBlob] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const handleFileAdd = async (newFiles) => {
        const MAX_SIZE_BYTES = 70 * 1024 * 1024; // 70MB
        setUploading(true);
        const entries = [];
        for (const file of Array.from(newFiles)) {
            if (file.type !== 'application/pdf') continue;
            if (file.size > MAX_SIZE_BYTES) {
                console.warn('PDF skipped due to size limit (70MB):', file.name);
                continue;
            }
            try { entries.push({ file, name: file.name, pageCount: await getPdfPageCount(file) }); }
            catch (err) { console.error('Error reading PDF:', file.name, err); }
        }
        setFiles((prev) => [...prev, ...entries]);
        setMergedBlob(null);
        setUploading(false);
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        setLoading(true);
        trackToolUsage('merge');
        try {
            const blob = await mergePdfs(files.map((f) => f.file));
            setTotalPages(files.reduce((s, f) => s + f.pageCount, 0));
            setMergedBlob(blob);
        } catch { alert('PDF মার্জ করতে সমস্যা হয়েছে।'); }
        setLoading(false);
    };

    const removeFile = (i) => { setFiles((p) => p.filter((_, idx) => idx !== i)); setMergedBlob(null); };
    const handleReset = () => { setFiles([]); setMergedBlob(null); setTotalPages(0); };

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[640px] px-6 py-12">
                <h1 className="mb-2 flex items-center gap-3 text-[clamp(1.5rem,4vw,2rem)] font-bold text-slate-900">
                    <Layers size={28} className="text-teal-600" /> PDF মার্জ
                </h1>
                <p className="mb-8 text-slate-500">একাধিক PDF ফাইলকে একটি ফাইলে যুক্ত করুন</p>

                <div className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-all hover:border-teal-500 hover:bg-teal-50/50" onClick={() => document.getElementById('merge-input').click()}>
                    <Upload size={36} className="text-slate-400" strokeWidth={1.5} />
                    <p className="font-semibold text-slate-700">PDF ফাইল সিলেক্ট করুন</p>
                    <p className="text-sm text-slate-400">একাধিক PDF সিলেক্ট করুন</p>
                    <input id="merge-input" type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFileAdd(e.target.files)} />
                </div>

                {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-3 text-slate-500">
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" /> PDF পড়া হচ্ছে...
                    </div>
                )}

                {files.length > 0 && !mergedBlob && (
                    <div className="mt-6 space-y-2">
                        {files.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-slate-400" />
                                    <span className="text-sm text-slate-700">{i + 1}. {entry.name}</span>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{entry.pageCount} পৃষ্ঠা</span>
                                </div>
                                <button className="text-slate-400 hover:text-red-500" onClick={() => removeFile(i)}><Trash2 size={16} /></button>
                            </div>
                        ))}
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                            <span className="font-semibold text-slate-700">মোট পৃষ্ঠা</span>
                            <span className="font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{files.reduce((s, f) => s + f.pageCount, 0)}</span>
                        </div>
                        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600 disabled:opacity-60" onClick={handleMerge} disabled={loading || files.length < 2}>
                            {loading ? <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> মার্জ হচ্ছে...</> : <><Layers size={20} /> {files.length}টি PDF মার্জ করুন</>}
                        </button>
                    </div>
                )}

                {mergedBlob && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                        <div className="mb-4 text-5xl">✅</div>
                        <h3 className="text-xl font-bold text-slate-900">সফলভাবে মার্জ হয়েছে!</h3>
                        <p className="mt-2 text-sm text-slate-500">{files.length}টি PDF একত্রিত করা হয়েছে</p>
                        <p className="mb-6 mt-1 text-2xl font-bold text-teal-700" style={{ fontFamily: 'Inter, sans-serif' }}>মোট {totalPages} পৃষ্ঠা</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => downloadBlob(mergedBlob, 'merged.pdf')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white transition-all hover:from-teal-700 hover:to-teal-600">
                                <Download size={20} /> ডাউনলোড করুন
                            </button>
                            <button onClick={handleReset} className="w-full rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50">আরেকবার মার্জ করুন</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
