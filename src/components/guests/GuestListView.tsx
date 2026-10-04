import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MessageSquare,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  ArrowUpDown,
  Send,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, GuestGroup, RsvpStatus } from '../../types/wedding';
import { generateGuestCsv, downloadFile } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { WhatsAppModal } from './WhatsAppModal';
import { CsvImportModal } from './CsvImportModal';

const GUEST_GROUPS: GuestGroup[] = [
  'VIP',
  'Keluarga Pria',
  'Keluarga Wanita',
  'Teman',
  'Rekan Kerja',
];

const RSVP_STATUSES: RsvpStatus[] = [
  'Belum diundang',
  'Diundang',
  'Hadir',
  'Tidak hadir',
];

type SortKey = 'name' | 'pax' | 'group' | 'rsvpStatus';

export const GuestListView: React.FC = () => {
  const { data, addGuest, updateGuest, deleteGuest, importGuests } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('semua');
  const [rsvpFilter, setRsvpFilter] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGroup, setFormGroup] = useState<GuestGroup>('Teman');
  const [formPax, setFormPax] = useState('1');
  const [formPhone, setFormPhone] = useState('');
  const [formRsvp, setFormRsvp] = useState<RsvpStatus>('Belum diundang');
  const [formTableId, setFormTableId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // WhatsApp Invite Modal
  const [waSelectedGuest, setWaSelectedGuest] = useState<Guest | null>(null);

  // CSV Import Modal
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Delete Confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Statistics calculation
  const totalGuests = data.guests.length;
  const totalPax = data.guests.reduce((sum, g) => sum + g.pax, 0);

  const attendingGuests = data.guests.filter((g) => g.rsvpStatus === 'Hadir');
  const attendingPax = attendingGuests.reduce((sum, g) => sum + g.pax, 0);

  const invitedGuests = data.guests.filter((g) => g.rsvpStatus === 'Diundang');
  const invitedPax = invitedGuests.reduce((sum, g) => sum + g.pax, 0);

  const uninvitedGuests = data.guests.filter((g) => g.rsvpStatus === 'Belum diundang');
  const uninvitedPax = uninvitedGuests.reduce((sum, g) => sum + g.pax, 0);

  const declinedGuests = data.guests.filter((g) => g.rsvpStatus === 'Tidak hadir');
  const declinedPax = declinedGuests.reduce((sum, g) => sum + g.pax, 0);

  // Filter & Sort
  const filteredGuests = data.guests
    .filter((g) => {
      if (groupFilter !== 'semua' && g.group !== groupFilter) return false;
      if (rsvpFilter !== 'semua' && g.rsvpStatus !== rsvpFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchPhone = g.phone.toLowerCase().includes(q);
        const matchNotes = g.notes?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNotes) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'pax') {
        comparison = a.pax - b.pax;
      } else if (sortBy === 'group') {
        comparison = a.group.localeCompare(b.group);
      } else if (sortBy === 'rsvpStatus') {
        comparison = a.rsvpStatus.localeCompare(b.rsvpStatus);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const openAddModal = () => {
    setEditingGuest(null);
    setFormName('');
    setFormGroup('Teman');
    setFormPax('1');
    setFormPhone('');
    setFormRsvp('Belum diundang');
    setFormTableId('');
    setFormNotes('');
    setIsAddEditOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormGroup(guest.group);
    setFormPax(guest.pax.toString());
    setFormPhone(guest.phone);
    setFormRsvp(guest.rsvpStatus);
    setFormTableId(guest.tableId || '');
    setFormNotes(guest.notes || '');
    setIsAddEditOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const paxNum = Math.max(1, parseInt(formPax, 10) || 1);

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        name: formName,
        group: formGroup,
        pax: paxNum,
        phone: formPhone,
        rsvpStatus: formRsvp,
        tableId: formTableId || undefined,
        notes: formNotes,
      });
    } else {
      addGuest({
        name: formName,
        group: formGroup,
        pax: paxNum,
        phone: formPhone,
        rsvpStatus: formRsvp,
        tableId: formTableId || undefined,
        notes: formNotes,
      });
    }

    setIsAddEditOpen(false);
  };

  const handleExportCsv = () => {
    const csvData = generateGuestCsv(data.guests, data.tables);
    // Add UTF-8 BOM so Excel opens indonesian characters cleanly
    const bom = '\uFEFF';
    downloadFile(
      bom + csvData,
      `daftar_tamu_${data.couple.groomNickname}_${data.couple.brideNickname}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return null;
    return data.tables.find((t) => t.id === tableId)?.name || 'Meja ' + tableId;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#8A9A82]" />
            Daftar Tamu &amp; RSVP
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Kelola undangan, pantau konfirmasi kehadiran (pax), dan bagikan pesan WhatsApp personal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1C1A] text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor CSV
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1C1A] text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Tamu
          </button>
        </div>
      </div>

      {/* 4 RSVP STAT TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pax */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Total Tamu &amp; Pax
          </p>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            {totalPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              Pax ({totalGuests} Undangan)
            </span>
          </p>
        </div>

        {/* Hadir */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
              Konfirmasi Hadir
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {attendingPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              Pax ({attendingGuests.length} Undangan)
            </span>
          </p>
        </div>

        {/* Menunggu / Diundang */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
              Diundang / Menunggu
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
            {invitedPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              Pax ({invitedGuests.length} Undangan)
            </span>
          </p>
        </div>

        {/* Tidak Hadir / Belum */}
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
              Belum Diundang / Batal
            </p>
            <HelpCircle className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-600 dark:text-stone-300 mt-1">
            {uninvitedPax + declinedPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              Pax ({uninvitedGuests.length + declinedGuests.length})
            </span>
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama tamu, nomor HP, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              <option value="semua">Semua Kelompok</option>
              {GUEST_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-medium text-stone-700 dark:text-stone-300"
            >
              <option value="semua">Semua Status RSVP</option>
              {RSVP_STATUSES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GUEST TABLE & CARDS */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#8A9A82]/20 shadow-xs overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Tidak ada tamu yang cocok dengan pencarian atau filter.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0F4EF]/70 dark:bg-[#252220] border-b border-stone-200 dark:border-stone-800 text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 select-none">
                  <tr>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-stone-900 dark:hover:text-white"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nama Tamu</span>
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-stone-900 dark:hover:text-white"
                      onClick={() => handleSort('group')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Kelompok</span>
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-stone-900 dark:hover:text-white"
                      onClick={() => handleSort('pax')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Pax</span>
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Kontak WhatsApp</th>
                    <th
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-stone-900 dark:hover:text-white"
                      onClick={() => handleSort('rsvpStatus')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Status RSVP</span>
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Meja</th>
                    <th className="py-3.5 px-4 text-center">Undangan WA</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredGuests.map((guest) => {
                    const rsvpBadge = {
                      Hadir: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                      Diundang: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                      'Tidak hadir': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                      'Belum diundang': 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
                    }[guest.rsvpStatus];

                    const tableName = getTableName(guest.tableId);

                    return (
                      <tr
                        key={guest.id}
                        className="hover:bg-[#FBF8F3] dark:hover:bg-[#252220]/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-stone-900 dark:text-white">
                          <p className="leading-snug">{guest.name}</p>
                          {guest.notes && (
                            <p className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">
                              {guest.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${
                              guest.group === 'VIP'
                                ? 'bg-[#C9A96E]/20 text-[#856b3b] dark:text-[#eed8a9] font-bold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {guest.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-stone-900 dark:text-white font-serif">
                          {guest.pax}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-stone-600 dark:text-stone-400">
                          {guest.phone || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${rsvpBadge}`}
                          >
                            {guest.rsvpStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-stone-400">
                          {tableName ? (
                            <span className="font-medium text-[#8A9A82]">{tableName}</span>
                          ) : (
                            <span className="text-stone-400 italic">Belum diatur</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setWaSelectedGuest(guest)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-medium transition-all"
                            title="Buka atau Salin Pesan Undangan WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Pesan WA
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(guest)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                              title="Edit tamu"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(guest.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus tamu"
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

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800 p-3">
              {filteredGuests.map((guest) => {
                const rsvpBadge = {
                  Hadir: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                  Diundang: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                  'Tidak hadir': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                  'Belum diundang': 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
                }[guest.rsvpStatus];

                const tableName = getTableName(guest.tableId);

                return (
                  <div key={guest.id} className="py-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-stone-900 dark:text-white">
                            {guest.name}
                          </h4>
                          <span className="text-xs font-serif font-bold text-[#8A9A82] bg-[#8A9A82]/10 px-1.5 py-0.5 rounded">
                            {guest.pax} Pax
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              guest.group === 'VIP'
                                ? 'bg-[#C9A96E]/20 text-[#856b3b] font-bold'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {guest.group}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rsvpBadge}`}>
                            {guest.rsvpStatus}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setWaSelectedGuest(guest)}
                        className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shrink-0"
                        title="Kirim pesan WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>

                    {guest.notes && (
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Catatan: {guest.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800/60">
                      <span>Meja: {tableName || 'Belum diatur'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(guest)}
                          className="p-1 text-stone-500 hover:text-stone-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(guest.id)}
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

      {/* MODAL TAMBAH / EDIT TAMU */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingGuest ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
        subtitle="Kelola detail undangan, jumlah orang (pax), dan nomor kontak"
      >
        <form onSubmit={handleSaveGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Tamu / Pasangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Bpk. Ir. Bambang Soeprapto & Ibu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kelompok Tamu
              </label>
              <select
                value={formGroup}
                onChange={(e) => setFormGroup(e.target.value as GuestGroup)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {GUEST_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Jumlah Orang (Pax)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formPax}
                onChange={(e) => setFormPax(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Status RSVP
              </label>
              <select
                value={formRsvp}
                onChange={(e) => setFormRsvp(e.target.value as RsvpStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {RSVP_STATUSES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Penempatan Meja (Seating)
            </label>
            <select
              value={formTableId}
              onChange={(e) => setFormTableId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            >
              <option value="">Belum Ditentukan (Bebas)</option>
              {data.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Kapasitas: {t.capacity} pax)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan Khusus (Alergi / Permintaan Kursi)
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contoh: Menu vegetarian, butuh akses kursi roda, membawa bayi..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              {editingGuest ? 'Simpan Perubahan' : 'Tambahkan Tamu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* WHATSAPP INVITATION MODAL */}
      <WhatsAppModal
        isOpen={!!waSelectedGuest}
        onClose={() => setWaSelectedGuest(null)}
        guest={waSelectedGuest}
        tables={data.tables}
      />

      {/* CSV IMPORT MODAL */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImport={(guests) => importGuests(guests)}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteGuest(deleteTargetId);
        }}
        title="Hapus Data Tamu"
        message="Apakah Anda yakin ingin menghapus tamu ini dari daftar undangan?"
        confirmLabel="Hapus Tamu"
        isDestructive={true}
      />
    </div>
  );
};
