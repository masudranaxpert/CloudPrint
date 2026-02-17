'use client';
import { useState, useEffect } from 'react';
import {
    ShoppingCart, Plus, Package, Clock, CheckCircle, XCircle,
    Trash2, X, Link2, FileText, ChevronDown, Filter
} from 'lucide-react';

const STATUS = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderChannel, setOrderChannel] = useState('whatsapp');
    const [calcUrl, setCalcUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ fileName: '', pageCount: 1, printType: 'bw', slidesPerPage: 1 }]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetch('/api/orders')
            .then((res) => res.json())
            .then((data) => { setOrders(data.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const match = calcUrl.match(/[?&]id=([a-f0-9]+)/i);
        if (match) {
            fetch(`/api/calculations?id=${match[1]}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.items?.length) {
                        setItems(data.items.map((i) => ({
                            fileName: i.fileName, pageCount: i.pageCount,
                            printType: i.printType, slidesPerPage: i.slidesPerPage,
                        })));
                    }
                })
                .catch(() => {});
        }
    }, [calcUrl]);

    const addItem = () => setItems((p) => [...p, { fileName: '', pageCount: 1, printType: 'bw', slidesPerPage: 1 }]);
    const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));
    const updateItem = (idx, field, value) =>
        setItems((p) => p.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

    const handleCreate = async () => {
        if (!customerName.trim() || !customerPhone.trim()) return;
        const validItems = items.filter((i) => i.fileName.trim());
        if (!validItems.length) return;
        setCreating(true);
        try {
            const totalPages = validItems.reduce((s, i) => s + i.pageCount, 0);
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName, customerPhone, orderChannel, pdfs: validItems, totalPages, totalPrice: 0, calculationUrl: calcUrl, notes }),
            });
            const order = await res.json();
            setOrders((p) => [order, ...p]);
            setShowCreate(false);
            setCustomerName(''); setCustomerPhone(''); setCalcUrl(''); setNotes('');
            setItems([{ fileName: '', pageCount: 1, printType: 'bw', slidesPerPage: 1 }]);
        } catch { alert('Failed to create order.'); }
        setCreating(false);
    };

    const handleStatus = async (orderId, status) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status }),
            });
            const updated = await res.json();
            setOrders((p) => p.map((o) => (o._id === orderId ? updated : o)));
        } catch {}
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <ShoppingCart className="h-6 w-6 text-teal-600" /> Orders
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Manage print orders and statuses.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                    <Plus size={18} /> New Order
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">Create New Order</h3>
                            <button onClick={() => setShowCreate(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Name *</label>
                                    <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number *</label>
                                    <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Channel</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={orderChannel} onChange={(e) => setOrderChannel(e.target.value)}>
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="telegram">Telegram</option>
                                            <option value="manual">Manual/Direct</option>
                                        </select>
                                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"><Link2 size={12} /> Calc URL</label>
                                    <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={calcUrl} onChange={(e) => setCalcUrl(e.target.value)} placeholder="Paste link..." />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
                                <textarea className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
                            </div>

                            {/* PDF items */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText size={16} className="text-teal-600" /> PDF Files</h4>
                                    <button onClick={addItem} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-teal-600 transition-colors hover:bg-teal-50"><Plus size={12} /> Add</button>
                                </div>
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-slate-300 md:flex-row md:items-center">
                                        <input className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" value={item.fileName} onChange={(e) => updateItem(idx, 'fileName', e.target.value)} placeholder="file.pdf" />
                                        <div className="flex gap-2">
                                            <input type="number" min="1" className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm focus:border-teal-500 focus:outline-none" value={item.pageCount} onChange={(e) => updateItem(idx, 'pageCount', Math.max(1, Number(e.target.value)))} />
                                            <select className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:border-teal-500 focus:outline-none" value={item.printType} onChange={(e) => updateItem(idx, 'printType', e.target.value)}>
                                                <option value="bw">B&W</option>
                                                <option value="color">Color</option>
                                            </select>
                                            <select className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:border-teal-500 focus:outline-none" value={item.slidesPerPage} onChange={(e) => updateItem(idx, 'slidesPerPage', Number(e.target.value))}>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={4}>4</option>
                                            </select>
                                            {items.length > 1 && (
                                                <button onClick={() => removeItem(idx)} className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-100 bg-slate-50 p-6">
                            <button onClick={handleCreate} disabled={creating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                                {creating ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Plus size={20} /> Create Order</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders list */}
            {loading ? (
                <div className="animate-pulse space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
                    <div className="h-10 w-full rounded bg-slate-100" />
                    <div className="h-64 w-full rounded bg-slate-50" />
                </div>
            ) : orders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">All Orders</span>
                        <span className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs text-slate-500 shadow-sm">{orders.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium">Pages</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Channel</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => {
                                    const st = STATUS[order.status] || STATUS.pending;
                                    const StIcon = st.icon;
                                    return (
                                        <tr key={order._id} className="transition-colors hover:bg-slate-50/60">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{order.customerName}</div>
                                                <div className="mt-0.5 font-mono text-xs text-slate-400">{order.customerPhone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-slate-600"><FileText size={14} className="text-slate-400" /> {order.pdfs?.length || 0} files</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600">{order.totalPages}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${st.bg} ${st.color} ${st.border}`}>
                                                    <StIcon size={12} /> {st.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">{order.orderChannel}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-teal-500 focus:outline-none" value={order.status} onChange={(e) => handleStatus(order._id, e.target.value)}>
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="mb-4 rounded-full bg-slate-100 p-4"><ShoppingCart className="h-8 w-8 text-slate-300" /></div>
                    <h3 className="text-lg font-semibold text-slate-900">No orders yet</h3>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">Orders will appear here once created.</p>
                    <button onClick={() => setShowCreate(true)} className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">Create First Order</button>
                </div>
            )}
        </div>
    );
}
