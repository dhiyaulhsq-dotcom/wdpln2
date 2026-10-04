import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import {
  Assignee,
  ChecklistItem,
  ChecklistPeriod,
  Priority,
} from '../../types/wedding';
import { formatTanggalSingkat } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const PERIOD_LABELS: Record<ChecklistPeriod, { title: string; subtitle: string }> = {
  '12_bulan': {
    title: '12 Bulan Sebelum',
    subtitle: 'Konsep utama, tanggal, gedung, dan vendor besar',
  },
  '9_bulan': {
    title: '9 Bulan Sebelum',
    subtitle: 'Katering, fotografer, MUA, dan konsep lamaran',
  },
  '6_bulan': {
    title: '6 Bulan Sebelum',
    subtitle: 'Dekorasi, cincin kawin, MC, dan entertainment',
  },
  '3_bulan': {
    title: '3 Bulan Sebelum',
    subtitle: 'Dokumen KUA, cetak undangan, souvenir & busana',
  },
  '1_bulan': {
    title: '1 Bulan Sebelum',
    subtitle: 'Technical meeting, sebar undangan & finalisasi rundown',
  },
  '1_minggu': {
    title: '1 Minggu Sebelum',
    subtitle: 'Gladi resik, pelunasan vendor, dan perawatan pra-nikah',
  },
  hari_h: {
    title: 'Hari-H Pernikahan',
    subtitle: 'Pelaksanaan akad/pemberkatan, resepsi, dan kelancaran momen bahagia',
  },
};

const PERIOD_ORDER: ChecklistPeriod[] = [
  '12_bulan',
  '9_bulan',
  '6_bulan',
  '3_bulan',
  '1_bulan',
  '1_minggu',
  'hari_h',
];

const ASSIGNEE_OPTIONS: Assignee[] = [
  'Bersama',
  'Calon Pengantin Pria',
  'Calon Pengantin Wanita',
  'Keluarga',
  'Wedding Organizer',
];

export const ChecklistView: React.FC = () => {
  const {
    data,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistComplete,
    deleteChecklistItem,
  } = useWedding();

  const [statusFilter, setStatusFilter] = useState<'semua' | 'pending' | 'completed'>('semua');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('semua');
  const [priorityFilter, setPriorityFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsed sections tracker
  const [collapsedPeriods, setCollapsedPeriods] = useState<Record<string, boolean>>({});

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formPeriod, setFormPeriod] = useState<ChecklistPeriod>('6_bulan');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignee, setFormAssignee] = useState<Assignee>('Bersama');
  const [formPriority, setFormPriority] = useState<Priority>('sedang');
  const [formNotes, setFormNotes] = useState('');

  // Delete confirm dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const togglePeriodCollapse = (period: ChecklistPeriod) => {
    setCollapsedPeriods((prev) => ({ ...prev, [period]: !prev[period] }));
  };

  const openAddModal = (defaultPeriod?: ChecklistPeriod) => {
    setEditingItem(null);
    setFormTitle('');
    setFormPeriod(defaultPeriod || '6_bulan');
    setFormDueDate('');
    setFormAssignee('Bersama');
    setFormPriority('sedang');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormPeriod(item.period);
    setFormDueDate(item.dueDate || '');
    setFormAssignee(item.assignee);
    setFormPriority(item.priority);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      updateChecklistItem(editingItem.id, {
        title: formTitle,
        period: formPeriod,
        dueDate: formDueDate,
        assignee: formAssignee,
        priority: formPriority,
        notes: formNotes,
      });
    } else {
      addChecklistItem({
        title: formTitle,
        period: formPeriod,
        dueDate: formDueDate || new Date().toISOString().split('T')[0],
        assignee: formAssignee,
        priority: formPriority,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  // Filter items
  const filteredList = data.checklist.filter((item) => {
    if (statusFilter === 'pending' && item.completed) return false;
    if (statusFilter === 'completed' && !item.completed) return false;
    if (assigneeFilter !== 'semua' && item.assignee !== assigneeFilter) return false;
    if (priorityFilter !== 'semua' && item.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  });

  const totalTasks = data.checklist.length;
  const completedTasks = data.checklist.filter((t) => t.completed).length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#8A9A82]" />
            Checklist &amp; Timeline Persiapan
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Panduan komprehensif langkah demi langkah menuju hari pernikahan impian Anda
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Tugas Baru
        </button>
      </div>

      {/* OVERALL PROGRESS BAR */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              Kemajuan Keseluruhan Persiapan
            </span>
          </div>
          <span className="text-sm font-serif font-bold text-[#8A9A82] dark:text-[#A4B59C]">
            {completedTasks} dari {totalTasks} Selesai ({overallPercent}%)
          </span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#8A9A82] to-[#A4B59C] h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama tugas atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'semua'
                  ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Semua ({data.checklist.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Belum ({totalTasks - completedTasks})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Selesai ({completedTasks})
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500">Penanggung Jawab:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-stone-700 dark:text-stone-300 font-medium"
            >
              <option value="semua">Semua PIC</option>
              {ASSIGNEE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Prioritas:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-stone-700 dark:text-stone-300 font-medium"
            >
              <option value="semua">Semua Prioritas</option>
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>
          </div>

          {(assigneeFilter !== 'semua' || priorityFilter !== 'semua' || searchQuery) && (
            <button
              onClick={() => {
                setAssigneeFilter('semua');
                setPriorityFilter('semua');
                setSearchQuery('');
              }}
              className="text-[#8A9A82] hover:underline font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* CHECKLIST PERIOD GROUPS */}
      <div className="space-y-6">
        {PERIOD_ORDER.map((periodKey) => {
          const periodInfo = PERIOD_LABELS[periodKey];
          const periodAllItems = data.checklist.filter((i) => i.period === periodKey);
          const periodFilteredItems = filteredList.filter((i) => i.period === periodKey);

          // If no items match filters for this period and user searched, hide or show empty
          if (periodFilteredItems.length === 0 && (searchQuery || statusFilter !== 'semua' || assigneeFilter !== 'semua' || priorityFilter !== 'semua')) {
            return null;
          }

          const periodTotal = periodAllItems.length;
          const periodCompleted = periodAllItems.filter((i) => i.completed).length;
          const periodPercent = periodTotal > 0 ? Math.round((periodCompleted / periodTotal) * 100) : 0;
          const isCollapsed = !!collapsedPeriods[periodKey];

          return (
            <div
              key={periodKey}
              className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#8A9A82]/20 shadow-xs overflow-hidden transition-all"
            >
              {/* Group Header */}
              <div
                onClick={() => togglePeriodCollapse(periodKey)}
                className="cursor-pointer p-4 sm:p-5 bg-gradient-to-r from-[#F0F4EF]/80 to-transparent dark:from-[#252220] dark:to-transparent border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8A9A82]/20 text-[#8A9A82] flex items-center justify-center font-bold text-xs">
                    {periodKey === 'hari_h' ? 'H' : periodKey.split('_')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                        {periodInfo.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                        {periodCompleted}/{periodTotal}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {periodInfo.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mini period progress bar */}
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <div className="flex-1 bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#8A9A82] h-full rounded-full transition-all"
                        style={{ width: `${periodPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 w-8 text-right">
                      {periodPercent}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddModal(periodKey);
                    }}
                    className="p-1.5 rounded-lg text-[#8A9A82] hover:bg-[#8A9A82]/10 transition-colors"
                    title={`Tambah tugas di periode ${periodInfo.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <div className="text-stone-400">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Group Task Items */}
              {!isCollapsed && (
                <div className="divide-y divide-stone-100 dark:divide-stone-800/60 p-2 sm:p-4">
                  {periodFilteredItems.length === 0 ? (
                    <div className="py-6 text-center text-stone-400 text-xs">
                      Tidak ada tugas di kategori ini yang cocok dengan filter.
                    </div>
                  ) : (
                    periodFilteredItems.map((item) => {
                      const priorityStyles = {
                        tinggi: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
                        sedang: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
                        rendah: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
                      };

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                            item.completed
                              ? 'bg-stone-50/60 dark:bg-[#1E1C1A]/40 opacity-70 hover:opacity-100'
                              : 'hover:bg-[#FBF8F3] dark:hover:bg-[#252220]'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleChecklistComplete(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                                item.completed
                                  ? 'bg-[#8A9A82] border-[#8A9A82] text-white shadow-2xs'
                                  : 'border-stone-300 dark:border-stone-600 hover:border-[#8A9A82]'
                              }`}
                              title={item.completed ? 'Batalkan selesai' : 'Tandai selesai'}
                            >
                              {item.completed && <CheckCircle2 className="w-4 h-4 fill-white text-[#8A9A82]" />}
                            </button>

                            <div className="space-y-1 flex-1">
                              <p
                                className={`text-sm font-medium leading-snug transition-all ${
                                  item.completed
                                    ? 'line-through text-stone-400 dark:text-stone-500'
                                    : 'text-stone-900 dark:text-white'
                                }`}
                              >
                                {item.title}
                              </p>

                              {item.notes && (
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                  {item.notes}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                                {item.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#8A9A82]" />
                                    Tenggat: {formatTanggalSingkat(item.dueDate)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-[#8A9A82]" />
                                  PIC: {item.assignee}
                                </span>
                                {item.completedAt && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Selesai {formatTanggalSingkat(item.completedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Badges & Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${priorityStyles[item.priority]}`}
                            >
                              {item.priority}
                            </span>

                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800"
                                title="Edit tugas"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(item.id)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Hapus tugas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL TAMBAH / EDIT TUGAS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Tugas Checklist' : 'Tambah Tugas Checklist Baru'}
        subtitle="Rencanakan setiap detail persiapan pernikahan dengan rapi"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Contoh: Survei dan booking katering pernikahan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kelompok Periode
              </label>
              <select
                value={formPeriod}
                onChange={(e) => setFormPeriod(e.target.value as ChecklistPeriod)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {PERIOD_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {PERIOD_LABELS[p].title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tenggat Waktu (Due Date)
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={formAssignee}
                onChange={(e) => setFormAssignee(e.target.value as Assignee)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {ASSIGNEE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                <option value="tinggi">Tinggi (Mendesak/Krusial)</option>
                <option value="sedang">Sedang</option>
                <option value="rendah">Rendah (Fleksibel)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan / Detail Tambahan
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Catatan kontak vendor, persyaratan berkas, atau rekomendasi..."
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
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Checklist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteChecklistItem(deleteTargetId);
        }}
        title="Hapus Tugas Checklist"
        message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Tugas"
        isDestructive={true}
      />
    </div>
  );
};
