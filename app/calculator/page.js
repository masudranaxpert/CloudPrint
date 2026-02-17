'use client';
import { useState, useCallback, useEffect } from 'react';
import { getPdfPageCount } from '@/lib/pdf-utils';
import { calculatePdfPrice, formatPrice, generateWhatsAppUrl } from '@/lib/price-calculator';
import { trackCalculatorUsage, trackOrderClick } from '@/lib/track';
import { Upload, FileText, Trash2, Plus, Calculator, Send, MessageCircle, Info, Copy, Layers, Link2, Share2 } from 'lucide-react';

const DEFAULT_PRICING = { blackWhitePerPage: 1.3, colorPerPage: 2.6 };

export default function CalculatorPage() {
    const [pdfs, setPdfs] = useState([]);
    const [pricing, setPricing] = useState(DEFAULT_PRICING);
    const [contacts, setContacts] = useState({ whatsappNumber: '', telegramUsername: '' });
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/pricing').then(r => r.json()).then(d => { if (d.blackWhitePerPage) setPricing(d); }).catch(() => {});
        fetch('/api/settings').then(r => r.json()).then(d => setContacts(d)).catch(() => {});
        fetch('/api/calculations/cleanup', { method: 'POST' }).catch(() => {});
    }, []);

    const handleFiles = useCallback(async (files) => {
        setLoading(true);
        const newPdfs = [];
        for (const file of Array.from(files)) {
            if (file.type !== 'application/pdf') continue;
            try {
                const pageCount = await getPdfPageCount(file);
                newPdfs.push({ id: Date.now() + Math.random(), file, fileName: file.name, pageCount, printType: 'bw', slidesPerPage: 1, isManual: false });
            } catch (err) { console.error('Error reading PDF:', file.name, err); }
        }
        setPdfs(prev => [...prev, ...newPdfs]);
        trackCalculatorUsage();
        setLoading(false);
    }, []);

    const addManualEntry = () => {
        setPdfs(prev => [...prev, { id: Date.now() + Math.random(), file: null, fileName: `ম্যানুয়াল এন্ট্রি ${prev.length + 1}`, pageCount: 1, printType: 'bw', slidesPerPage: 1, isManual: true }]);
    };

    const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }, [handleFiles]);
    const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
    const handleDragLeave = useCallback(() => setDragOver(false), []);

    const updatePdf = (id, field, value) => { setPdfs(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p))); setShareUrl(''); };
    const removePdf = (id) => { setPdfs(prev => prev.filter(p => p.id !== id)); setShareUrl(''); };

    const pdfItems = pdfs.map(pdf => {
        const result = calculatePdfPrice({ pageCount: pdf.pageCount, printType: pdf.printType, slidesPerPage: pdf.slidesPerPage, copies: 1, pricing });
        return { ...pdf, ...result };
    });
    const grandTotal = pdfItems.reduce((s, i) => s + i.totalPrice, 0);
    const totalSheets = pdfItems.reduce((s, i) => s + i.sheets, 0);

    const handleWhatsAppOrder = () => {
        trackOrderClick();
        const url = generateWhatsAppUrl(contacts.whatsappNumber, { items: pdfItems.map(p => ({ ...p, copies: 1 })), grandTotal: Math.round(grandTotal * 100) / 100, customerName: 'Customer' });
        if (shareUrl) { window.open(url + encodeURIComponent(`\n\n🔗 ক্যালকুলেশন লিংক: ${shareUrl}`), '_blank'); }
        else { window.open(url, '_blank'); }
    };

    const handleTelegramOrder = () => { trackOrderClick(); window.open(`https://t.me/${contacts.telegramUsername}`, '_blank'); };

    const handleShare = async () => {
        if (pdfItems.length === 0) return;
        setSharing(true);
        try {
            const res = await fetch('/api/calculations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: pdfItems.map(p => ({ fileName: p.fileName, pageCount: p.pageCount, printType: p.printType, slidesPerPage: p.slidesPerPage, sheets: p.sheets, totalPrice: p.totalPrice })), grandTotal: Math.round(grandTotal * 100) / 100, totalSheets }) });
            const data = await res.json();
            if (data.id) setShareUrl(`${window.location.origin}/calculator?id=${data.id}`);
        } catch (err) { console.error('Share error:', err); }
        setSharing(false);
    };

    const handleCopyUrl = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const calcId = params.get('id');
        if (calcId) {
            fetch(`/api/calculations?id=${calcId}`).then(r => r.json()).then(data => {
                if (data.items?.length) {
                    setPdfs(data.items.map((item, i) => ({ id: Date.now() + i + Math.random(), file: null, fileName: item.fileName, pageCount: item.pageCount, printType: item.printType, slidesPerPage: item.slidesPerPage, isManual: true })));
                    setShareUrl(`${window.location.origin}/calculator?id=${calcId}`);
                }
            }).catch(() => {});
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <div className="mx-auto max-w-[1200px] px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="flex items-center gap-3 text-[clamp(1.5rem,4vw,2.4rem)] font-bold text-slate-900">
                        <Calculator size={32} className="text-teal-600" /> প্রাইস ক্যালকুলেটর
                    </h1>
                    <p className="mt-2 text-slate-500">আপনার PDF আপলোড করুন অথবা ম্যানুয়ালি পৃষ্ঠা সংখ্যা দিন — তাৎক্ষণিক দাম জানুন।</p>
                </div>

                {/* Info Banner */}
                <div className="mb-6 flex gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
                    <Info size={20} className="mt-0.5 shrink-0 text-teal-700" />
                    <div className="text-sm text-teal-900">
                        <strong>পৃষ্ঠা ও পাতা বুঝুন:</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed">
                            <li><strong>১ পাতা (Sheet)</strong> = ১ কাগজ = ২ পৃষ্ঠা (Page) — সামনে + পেছনে</li>
                            <li><strong>Slides/Page</strong> = এক পৃষ্ঠায় কতটি স্লাইড বসবে (1, 2, 4, 8, 16)</li>
                            <li><strong>উদাহরণ:</strong> ১৬ পৃষ্ঠার PDF, 4 slides/page → ৪ পৃষ্ঠা → ২ পাতা</li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
                    {/* Left side */}
                    <div>
                        {/* Upload Zone */}
                        <div
                            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-white hover:border-teal-500 hover:bg-teal-50/30'}`}
                            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('pdf-input').click()}
                        >
                            <Upload size={36} className="text-slate-400" strokeWidth={1.5} />
                            <p className="font-semibold text-slate-700">PDF ফাইল ড্র্যাগ করুন এখানে</p>
                            <p className="text-sm text-slate-400">অথবা ক্লিক করে সিলেক্ট করুন • একসাথে অনেকগুলো PDF দিতে পারবেন</p>
                            <input id="pdf-input" type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                        </div>

                        <button onClick={addManualEntry} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-3 font-semibold text-slate-600 transition-all hover:border-teal-200 hover:bg-teal-50/50">
                            <Plus size={18} /> PDF ছাড়া ম্যানুয়ালি পৃষ্ঠা সংখ্যা দিন
                        </button>

                        {loading && (
                            <div className="mt-6 flex items-center justify-center gap-3 text-slate-500">
                                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" /> PDF পড়া হচ্ছে...
                            </div>
                        )}

                        {/* PDF List */}
                        <div className="mt-6 space-y-4">
                            {pdfItems.map((pdf) => (
                                <div key={pdf.id} className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                                                <FileText size={18} className="shrink-0 text-slate-400" />
                                                {pdf.isManual ? (
                                                    <input type="text" value={pdf.fileName} onChange={(e) => updatePdf(pdf.id, 'fileName', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                                                ) : <span className="truncate">{pdf.fileName}</span>}
                                            </h4>
                                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Layers size={14} /> {pdf.pageCount} পৃষ্ঠা</span>
                                                <span className="flex items-center gap-1"><Copy size={14} /> {pdf.sheets} পাতা</span>
                                            </div>

                                            {/* Controls */}
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {pdf.isManual && (
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-slate-500">পৃষ্ঠা সংখ্যা</label>
                                                        <input type="number" min="1" value={pdf.pageCount} onChange={(e) => updatePdf(pdf.id, 'pageCount', Math.max(1, Number(e.target.value)))} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-slate-500">প্রিন্ট টাইপ</label>
                                                    <select value={pdf.printType} onChange={(e) => updatePdf(pdf.id, 'printType', e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                                                        <option value="bw">সাদা-কালো (B&W)</option>
                                                        <option value="color">কালার</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-slate-500">Slides/Page</label>
                                                    <select value={pdf.slidesPerPage} onChange={(e) => updatePdf(pdf.id, 'slidesPerPage', Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                                                        <option value={1}>১ slide / page</option>
                                                        <option value={2}>২ slides / page</option>
                                                        <option value={4}>৪ slides / page</option>
                                                        <option value={8}>৮ slides / page</option>
                                                        <option value={16}>১৬ slides / page</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price + Remove */}
                                        <div className="shrink-0 text-right">
                                            <p className="text-xl font-bold text-teal-700" style={{ fontFamily: 'Inter, sans-serif' }}>{formatPrice(pdf.totalPrice)}</p>
                                            <p className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>{pdf.sheets} পাতা × {formatPrice(pdf.pricePerSheet)}</p>
                                            <button onClick={() => removePdf(pdf.id)} className="mt-2 text-slate-400 transition-colors hover:text-red-500" title="মুছে ফেলুন"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {pdfs.length === 0 && (
                                <div className="py-12 text-center text-slate-400">
                                    <FileText size={48} strokeWidth={1} className="mx-auto mb-4 opacity-30" />
                                    <p>এখনো কোনো PDF অ্যাড করা হয়নি</p>
                                    <p className="mt-1 text-sm">উপরের বক্সে PDF ড্র্যাগ করুন বা "ম্যানুয়ালি পৃষ্ঠা সংখ্যা দিন" বাটন ক্লিক করুন</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Summary */}
                    <div className="lg:sticky lg:top-[88px] lg:self-start">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">অর্ডার সারসংক্ষেপ</h3>

                            {pdfItems.length > 0 ? (
                                <>
                                    <div className="space-y-3">
                                        {pdfItems.map((pdf, i) => (
                                            <div key={pdf.id} className="flex items-center justify-between text-sm">
                                                <span className="max-w-[200px] truncate text-slate-600">{i + 1}. {pdf.fileName}</span>
                                                <span className="font-semibold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{formatPrice(pdf.totalPrice)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                                        <span>মোট পাতা (Sheet)</span>
                                        <span style={{ fontFamily: 'Inter, sans-serif' }}>{totalSheets}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-200 py-4 text-lg font-bold">
                                        <span className="text-slate-900">সর্বমোট</span>
                                        <span className="text-teal-700" style={{ fontFamily: 'Inter, sans-serif' }}>{formatPrice(Math.round(grandTotal * 100) / 100)}</span>
                                    </div>

                                    {/* Share URL Section */}
                                    <div className="mt-2">
                                        {!shareUrl ? (
                                            <button onClick={handleShare} disabled={sharing} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-200 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-teal-200 hover:bg-teal-50 disabled:opacity-60">
                                                {sharing ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" /> লিংক তৈরি হচ্ছে...</> : <><Share2 size={16} /> শেয়ার লিংক তৈরি করুন</>}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                                                <Link2 size={14} className="shrink-0 text-teal-600" />
                                                <input type="text" readOnly value={shareUrl} className="min-w-0 flex-1 border-none bg-transparent text-xs text-slate-700 outline-none" style={{ fontFamily: 'Inter, sans-serif' }} />
                                                <button onClick={handleCopyUrl} className="shrink-0 rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700">
                                                    {copied ? '✓' : 'কপি'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order buttons */}
                                    <div className="mt-4 flex flex-col gap-3">
                                        <button onClick={handleWhatsAppOrder} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3.5 font-bold text-white shadow-md shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700">
                                            <MessageCircle size={20} /> WhatsApp-এ অর্ডার করুন
                                        </button>
                                        <button onClick={handleTelegramOrder} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 py-3.5 font-bold text-white shadow-md shadow-blue-400/20 transition-all hover:from-blue-500 hover:to-blue-600">
                                            <Send size={20} /> Telegram-এ অর্ডার করুন
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 text-center text-slate-400">
                                    <Calculator size={32} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">PDF অ্যাড করলে এখানে দাম দেখাবে</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
