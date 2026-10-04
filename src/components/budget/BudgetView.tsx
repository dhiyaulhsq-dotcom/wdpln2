import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  PieChart,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import {
  BudgetCategory,
  BudgetItem,
  PaymentStatus,
} from '../../types/wedding';
import {
  formatRupiah,
  formatTanggalSingkat,
  parseRupiahInput,
} from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const BUDGET_CATEGORIES: BudgetCategory[] = [
  'Gedung/Venue',
  'Katering',
  'Dekorasi',
  'Rias & Busana',
  'Foto & Video',
  'Hiburan/MC',
  'Undangan & Souvenir',
  'Seserahan & Mahar',
  'Transportasi',
  'Akomodasi',
  'Dokumen & Administrasi',
  'Lain-lain',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['Belum bayar', 'DP', 'Lunas'];

export const BudgetView: React.FC = () => {
  const {
    data,
    setTotalBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
  } = useWedding();

  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Total budget edit modal
  const [isEditingBudgetLimit, setIsEditingBudgetLimit] = useState(false);
  const [budgetLimitInput, setBudgetLimitInput] = useState(
    data.couple.totalBudget.toString()
  );

  // Item Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Gedung/Venue');
  const [formEstimated, setFormEstimated] = useState('0');
  const [formActual, setFormActual] = useState('0');
  const [formPaid, setFormPaid] = useState('0');
  const [formStatus, setFormStatus] = useState<PaymentStatus>('Belum bayar');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Calculations
  const totalBudgetLimit = data.couple.totalBudget;
  const totalActual = data.budget.reduce(
    (sum, i) => sum + (i.actualCost || i.estimatedCost || 0),
    0
  );
  const totalEstimated = data.budget.reduce(
    (sum, i) => sum + (i.estimatedCost || 0),
    0
  );
  const totalPaid = data.budget.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const remainingBudget = totalBudgetLimit - totalActual;
  const remainingPayment = totalActual - totalPaid;
  const isOverBudget = remainingBudget < 0;

  // Breakdown per category
  const categoryStats = BUDGET_CATEGORIES.map((cat) => {
    const items = data.budget.filter((i) => i.category === cat);
    const actual = items.reduce(
      (sum, i) => sum + (i.actualCost || i.estimatedCost || 0),
      0
    );
    const paid = items.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const percentOfTotal = totalActual > 0 ? (actual / totalActual) * 100 : 0;
    return {
      category: cat,
      count: items.length,
      actual,
      paid,
      percentOfTotal,
    };
  }).filter((c) => c.count > 0 || c.actual > 0);

  // Filter items
  const filteredItems = data.budget.filter((item) => {
    if (categoryFilter !== 'semua' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'semua' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchName && !matchNotes) return false;
    }
    return true;
  });

  const openAddModal = (defaultCategory?: BudgetCategory) => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(defaultCategory || 'Gedung/Venue');
    setFormEstimated('0');
    setFormActual('0');
    setFormPaid('0');
    setFormStatus('Belum bayar');
    setFormDueDate('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormEstimated(item.estimatedCost.toString());
    setFormActual(item.actualCost.toString());
    setFormPaid(item.paidAmount.toString());
    setFormStatus(item.status);
    setFormDueDate(item.dueDate || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const est = parseRupiahInput(formEstimated);
    const act = parseRupiahInput(formActual) || est;
    const paid = parseRupiahInput(formPaid);

    // Auto-update status if paid >= actual
    let computedStatus = formStatus;
    if (paid >= act && act > 0) {
      computedStatus = 'Lunas';
    } else if (paid > 0 && computedStatus === 'Belum bayar') {
      computedStatus = 'DP';
    }

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        name: formName,
        category: formCategory,
        estimatedCost: est,
        actualCost: act,
        paidAmount: paid,
        status: computedStatus,
        dueDate: formDueDate,
        notes: formNotes,
      });
    } else {
      addBudgetItem({
        name: formName,
        category: formCategory,
        estimatedCost: est,
        actualCost: act,
        paidAmount: paid,
        status: computedStatus,
        dueDate: formDueDate,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveBudgetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseRupiahInput(budgetLimitInput);
    setTotalBudget(val);
    setIsEditingBudgetLimit(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <WalletCards className="w-7 h-7 text-[#C9A96E]" />
            Anggaran &amp; Pengeluaran
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Pantau rincian biaya, pembayaran uang muka (DP), dan pelunasan setiap vendor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBudgetLimitInput(data.couple.totalBudget.toString());
              setIsEditingBudgetLimit(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1C1A] text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Ubah Batas Budget
          </button>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* OVER BUDGET ALERT BANNER */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <p className="font-bold">
              Peringatan: Pengeluaran melebihi total batas anggaran!
            </p>
            <p className="mt-0.5 opacity-90">
              Total biaya aktual Anda telah melampaui batas anggaran sebesar{' '}
              <span className="font-bold underline">
                {formatRupiah(Math.abs(remainingBudget))}
              </span>
              . Pertimbangkan untuk merevisi pos pengeluaran sekunder atau menambah cadangan dana.
            </p>
          </div>
        </div>
      )}

      {/* 4 SUMMARY STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Target */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            Batas Total Anggaran
          </p>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            {formatRupiah(totalBudgetLimit)}
          </p>
          <p className="text-[11px] text-stone-500 mt-2">
            Estimasi Awal: {formatRupiah(totalEstimated)}
          </p>
        </div>

        {/* Total Actual */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            Total Biaya Aktual
          </p>
          <p
            className={`text-2xl font-serif font-bold mt-1 ${
              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-white'
            }`}
          >
            {formatRupiah(totalActual)}
          </p>
          <p className="text-[11px] text-stone-500 mt-2">
            {totalBudgetLimit > 0
              ? `${Math.round((totalActual / totalBudgetLimit) * 100)}% dari batas budget`
              : '-'}
          </p>
        </div>

        {/* Sudah Dibayar */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            Sudah Dibayar (DP / Lunas)
          </p>
          <p className="text-2xl font-serif font-bold text-[#8A9A82] dark:text-[#A4B59C] mt-1">
            {formatRupiah(totalPaid)}
          </p>
          <p className="text-[11px] text-stone-500 mt-2">
            Sisa Pelunasan: {formatRupiah(remainingPayment)}
          </p>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
            Sisa Anggaran Bebas
          </p>
          <p
            className={`text-2xl font-serif font-bold mt-1 ${
              isOverBudget ? 'text-rose-600' : 'text-[#8A9A82]'
            }`}
          >
            {isOverBudget ? `-${formatRupiah(Math.abs(remainingBudget))}` : formatRupiah(remainingBudget)}
          </p>
          <p className="text-[11px] text-stone-500 mt-2">
            {isOverBudget ? 'Over Budget' : 'Tersedia untuk kebutuhan tak terduga'}
          </p>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN SECTION */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
              Ringkasan Alokasi per Kategori
            </h3>
            <p className="text-xs text-stone-500">
              Distribusi pengeluaran dan status pelunasan
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {categoryStats.length} Kategori Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {categoryStats.map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-xl bg-stone-50/70 dark:bg-[#252220] border border-stone-200/60 dark:border-stone-800"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-stone-800 dark:text-stone-200 truncate">{cat.category}</span>
                <span className="text-[#8A9A82] shrink-0">{cat.percentOfTotal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#8A9A82] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, cat.percentOfTotal)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Biaya: {formatRupiah(cat.actual)}</span>
                <span>Dibayar: {formatRupiah(cat.paid)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari item pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              <option value="semua">Semua Kategori</option>
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              <option value="semua">Semua Status Bayar</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BUDGET ITEMS LIST (TABLE ON DESKTOP, CARDS ON MOBILE) */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#8A9A82]/20 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Tidak ada item pengeluaran yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0F4EF]/70 dark:bg-[#252220] border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  <tr>
                    <th className="py-3.5 px-4">Nama Pos Pengeluaran</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4 text-right">Biaya Aktual</th>
                    <th className="py-3.5 px-4 text-right">Sudah Dibayar</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Tenggat</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredItems.map((item) => {
                    const statusBadge = {
                      Lunas: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                      DP: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                      'Belum bayar': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                    }[item.status];

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FBF8F3] dark:hover:bg-[#252220]/60 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-stone-900 dark:text-white leading-tight">
                            {item.name}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-stone-500 mt-0.5 max-w-xs truncate">
                              {item.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif font-bold text-stone-900 dark:text-white">
                          {formatRupiah(item.actualCost || item.estimatedCost)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-[#8A9A82]">
                          {formatRupiah(item.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-500">
                          {item.dueDate ? formatTanggalSingkat(item.dueDate) : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(item.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800 p-3">
              {filteredItems.map((item) => {
                const statusBadge = {
                  Lunas: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                  DP: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                  'Belum bayar': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                }[item.status];

                return (
                  <div key={item.id} className="py-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {item.category}
                        </span>
                        <h4 className="font-semibold text-sm text-stone-900 dark:text-white mt-1">
                          {item.name}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800/60">
                      <div>
                        <span className="text-stone-400">Aktual: </span>
                        <span className="font-serif font-bold text-stone-900 dark:text-white">
                          {formatRupiah(item.actualCost || item.estimatedCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400">Dibayar: </span>
                        <span className="font-semibold text-[#8A9A82]">
                          {formatRupiah(item.paidAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>Tenggat: {item.dueDate ? formatTanggalSingkat(item.dueDate) : '-'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-stone-500 hover:text-stone-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1 text-stone-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL UBAH BATAS BUDGET */}
      <Modal
        isOpen={isEditingBudgetLimit}
        onClose={() => setIsEditingBudgetLimit(false)}
        title="Atur Batas Total Anggaran"
        subtitle="Tetapkan batas maksimal biaya keseluruhan pernikahan"
      >
        <form onSubmit={handleSaveBudgetLimit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Total Batas Budget (Rupiah)
            </label>
            <input
              type="text"
              value={budgetLimitInput}
              onChange={(e) => setBudgetLimitInput(e.target.value)}
              placeholder="Contoh: 250000000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
            <p className="text-xs text-stone-500 mt-1">
              Pratinjau: {formatRupiah(parseRupiahInput(budgetLimitInput))}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsEditingBudgetLimit(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              Simpan Batas Budget
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL ADD / EDIT ITEM ANGGARAN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Pos Anggaran' : 'Catat Pos Anggaran Baru'}
        subtitle="Rincian biaya, uang muka (DP), dan status pelunasan vendor"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Pos / Layanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Katering Prasmanan 500 Pax + Stall"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Status Pembayaran
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Estimasi Awal (Rp)
              </label>
              <input
                type="text"
                value={formEstimated}
                onChange={(e) => setFormEstimated(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(formEstimated))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Biaya Aktual / Deal (Rp)
              </label>
              <input
                type="text"
                value={formActual}
                onChange={(e) => setFormActual(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(formActual))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Sudah Dibayar (Rp)
              </label>
              <input
                type="text"
                value={formPaid}
                onChange={(e) => setFormPaid(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(formPaid))}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Tenggat Pelunasan
            </label>
            <input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan / Ketentuan Vendor
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Catatan rekening transfer, nomor invoice, atau kesepakatan bonus..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              {editingItem ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteBudgetItem(deleteTargetId);
        }}
        title="Hapus Pos Anggaran"
        message="Apakah Anda yakin ingin menghapus pos anggaran ini? Data pengeluaran dan catatan pembayaran akan terhapus."
        confirmLabel="Hapus Pos Anggaran"
        isDestructive={true}
      />
    </div>
  );
};
