'use client';
import { useState } from 'react';
import { compressPdf, downloadBlob } from '@/lib/pdf-utils';
import { trackToolUsage } from '@/lib/track';
import { Upload, FileArchive, ArrowRight, Download } from 'lucide-react';

export default function CompressPage() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCompress = async () => {
        if (!file) return;
        const MAX_SIZE_BYTES = 70 * 1024 * 1024; // 70MB
        if (file.size > MAX_SIZE_BYTES) {
            alert('File is larger than 70MB. Please select a smaller PDF.');
            return;
        }
        setLoading(true);
        trackToolUsage('compress');
        try { setResult(await compressPdf(file)); }
        catch { alert('PDF কম্প্রেস করতে সমস্যা হয়েছে।'); }
        setLoading(false);
    };

    const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[640px] px-6 py-12">
                <h1 className="mb-2 flex items-center gap-3 text-[clamp(1.5rem,4vw,2rem)] font-bold text-slate-900">
                    <FileArchive size={28} className="text-teal-600" /> PDF কম্প্রেস
                </h1>
                <p className="mb-8 text-slate-500">PDF ফাইলের সাইজ কমান — কোয়ালিটি বজায় রেখে</p>

                <div
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-all hover:border-teal-500 hover:bg-teal-50/50"
                    onClick={() => document.getElementById('compress-input').click()}
                >
                    <Upload size={36} className="text-slate-400" strokeWidth={1.5} />
                    <p className="font-semibold text-slate-700">{file ? file.name : 'PDF ফাইল সিলেক্ট করুন'}</p>
                    <p className="text-sm text-slate-400">{file ? fmt(file.size) : 'ক্লিক করুন বা ড্র্যাগ করুন'}</p>
                    <input id="compress-input" type="file" accept=".pdf" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setResult(null); }} />
                </div>

                {file && !result && (
                    <button
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-teal-600 disabled:opacity-60"
                        onClick={handleCompress}
                        disabled={loading}
                    >
                        {loading ? <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> কম্প্রেস হচ্ছে...</> : <><FileArchive size={20} /> কম্প্রেস করুন</>}
                    </button>
                )}

                {result && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                        <div className="mb-6 flex items-center justify-center gap-8">
                            <div>
                                <p className="text-sm text-slate-400">আগের সাইজ</p>
                                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{fmt(result.originalSize)}</p>
                            </div>
                            <ArrowRight size={24} className="text-teal-600" />
                            <div>
                                <p className="text-sm text-slate-400">পরের সাইজ</p>
                                <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>{fmt(result.compressedSize)}</p>
                            </div>
                        </div>
                        <p className="mb-4 text-green-600">{Math.round((1 - result.compressedSize / result.originalSize) * 100)}% কমেছে!</p>
                        <button onClick={() => downloadBlob(result.blob, `compressed_${file.name}`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-bold text-white transition-all hover:from-teal-700 hover:to-teal-600">
                            <Download size={20} /> ডাউনলোড করুন
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
