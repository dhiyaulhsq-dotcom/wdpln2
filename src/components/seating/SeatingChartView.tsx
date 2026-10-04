import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  UserMinus,
  UserPlus,
  Circle,
  Square,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, SeatingTable } from '../../types/wedding';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SeatingChartView: React.FC = () => {
  const { data, addTable, updateTable, deleteTable, assignGuestToTable } = useWedding();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);

  const [formName, setFormName] = useState('');
  const [formShape, setFormShape] = useState<'round' | 'rect'>('round');
  const [formCapacity, setFormCapacity] = useState('8');
  const [formNotes, setFormNotes] = useState('');

  // Assign Guest Modal (choose a table for a guest)
  const [assigningGuest, setAssigningGuest] = useState<Guest | null>(null);
  const [selectedTableIdForAssign, setSelectedTableIdForAssign] = useState<string>('');

  // Delete table confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Stats calculation
  const totalTables = data.tables.length;
  const totalCapacity = data.tables.reduce((sum, t) => sum + t.capacity, 0);

  // Group guests by table
  const guestsByTable: Record<string, Guest[]> = {};
  data.tables.forEach((t) => {
    guestsByTable[t.id] = [];
  });

  const unassignedGuests: Guest[] = [];
  let seatedPax = 0;

  data.guests.forEach((g) => {
    if (g.tableId && guestsByTable[g.tableId]) {
      guestsByTable[g.tableId].push(g);
      seatedPax += g.pax;
    } else {
      unassignedGuests.push(g);
    }
  });

  const unassignedPax = unassignedGuests.reduce((sum, g) => sum + g.pax, 0);

  const openAddTableModal = () => {
    setEditingTable(null);
    setFormName('');
    setFormShape('round');
    setFormCapacity('8');
    setFormNotes('');
    setIsTableModalOpen(true);
  };

  const openEditTableModal = (table: SeatingTable) => {
    setEditingTable(table);
    setFormName(table.name);
    setFormShape(table.shape);
    setFormCapacity(table.capacity.toString());
    setFormNotes(table.notes || '');
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const cap = Math.max(1, parseInt(formCapacity, 10) || 8);

    if (editingTable) {
      updateTable(editingTable.id, {
        name: formName,
        shape: formShape,
        capacity: cap,
        notes: formNotes,
      });
    } else {
      addTable({
        name: formName,
        shape: formShape,
        capacity: cap,
        notes: formNotes,
      });
    }

    setIsTableModalOpen(false);
  };

  const handleOpenAssignModal = (guest: Guest) => {
    setAssigningGuest(guest);
    setSelectedTableIdForAssign(data.tables[0]?.id || '');
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningGuest) return;
    assignGuestToTable(assigningGuest.id, selectedTableIdForAssign || undefined);
    setAssigningGuest(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Grid3X3 className="w-7 h-7 text-[#8A9A82]" />
            Denah &amp; Penempatan Meja (Seating Chart)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Atur meja resepsi, kelola kapasitas kursi, dan tempatkan setiap tamu keluarga serta VIP
          </p>
        </div>

        <button
          onClick={openAddTableModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Meja Baru
        </button>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Total Meja
          </p>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            {totalTables}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">Meja</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Kapasitas Kursi
          </p>
          <p className="text-2xl font-serif font-bold text-[#8A9A82] dark:text-[#A4B59C] mt-1">
            {totalCapacity}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">Kursi Total</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Tamu Duduk
          </p>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {seatedPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">Pax</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
            Belum Dapat Meja
          </p>
          <p
            className={`text-2xl font-serif font-bold mt-1 ${
              unassignedPax > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-white'
            }`}
          >
            {unassignedPax}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              Pax ({unassignedGuests.length} Undangan)
            </span>
          </p>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: TABLES GRID + UNASSIGNED GUESTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: TABLE CARDS (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
              Daftar Meja Resepsi ({data.tables.length})
            </h3>
            <span className="text-xs text-stone-500">
              Bulat &amp; Persegi
            </span>
          </div>

          {data.tables.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
              Belum ada meja yang dibuat. Klik tombol "Tambah Meja Baru" di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tables.map((table) => {
                const assigned = guestsByTable[table.id] || [];
                const occupiedPax = assigned.reduce((sum, g) => sum + g.pax, 0);
                const isFull = occupiedPax >= table.capacity;
                const isOver = occupiedPax > table.capacity;

                return (
                  <div
                    key={table.id}
                    className={`bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                      isOver
                        ? 'border-rose-400 dark:border-rose-900 bg-rose-50/20'
                        : isFull
                        ? 'border-emerald-300 dark:border-emerald-800'
                        : 'border-[#8A9A82]/20 hover:border-[#8A9A82]/40'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Shape, Title & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              table.shape === 'round'
                                ? 'rounded-full bg-[#8A9A82]/15 text-[#8A9A82]'
                                : 'bg-[#C9A96E]/15 text-[#C9A96E]'
                            }`}
                            title={table.shape === 'round' ? 'Meja Bulat' : 'Meja Persegi'}
                          >
                            {table.shape === 'round' ? (
                              <Circle className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white leading-tight">
                              {table.name}
                            </h4>
                            {table.notes && (
                              <p className="text-[11px] text-stone-500 line-clamp-1">
                                {table.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditTableModal(table)}
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                            title="Edit meja"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(table.id)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600"
                            title="Hapus meja"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 dark:text-stone-400 font-medium">
                            Terisi: <strong>{occupiedPax}</strong> / {table.capacity} Pax
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOver
                                ? 'bg-rose-100 text-rose-800'
                                : isFull
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                          >
                            {isOver
                              ? `Kelebihan ${occupiedPax - table.capacity} Pax`
                              : isFull
                              ? 'Penuh'
                              : `Sisa ${table.capacity - occupiedPax} Kursi`}
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver
                                ? 'bg-rose-500'
                                : isFull
                                ? 'bg-emerald-500'
                                : 'bg-[#8A9A82]'
                            }`}
                            style={{
                              width: `${Math.min(100, (occupiedPax / table.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Assigned Guests List in Table */}
                      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-1.5 min-h-[90px]">
                        {assigned.length === 0 ? (
                          <div className="py-4 text-center text-xs text-stone-400 italic">
                            Belum ada tamu di meja ini
                          </div>
                        ) : (
                          assigned.map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-stone-50 dark:bg-[#252220] group/item"
                            >
                              <div className="truncate mr-2">
                                <span className="font-medium text-stone-800 dark:text-stone-200">
                                  {g.name}
                                </span>
                                <span className="text-stone-400 ml-1">({g.pax} pax)</span>
                              </div>
                              <button
                                onClick={() => assignGuestToTable(g.id, undefined)}
                                className="p-1 text-stone-400 hover:text-rose-600 transition-colors opacity-80 group-hover/item:opacity-100"
                                title="Keluarkan dari meja"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: UNASSIGNED GUESTS PANEL (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Belum Dapat Meja
              </h3>
              <p className="text-xs text-stone-500">
                {unassignedGuests.length} Undangan ({unassignedPax} Pax)
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[500px] overflow-y-auto mt-2">
            {unassignedGuests.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-70" />
                Semua tamu yang hadir sudah ditempatkan ke meja!
              </div>
            ) : (
              unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#FBF8F3] dark:hover:bg-[#252220] px-1 rounded-lg"
                >
                  <div className="truncate">
                    <p className="font-medium text-xs text-stone-900 dark:text-white leading-tight truncate">
                      {guest.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                      <span className="font-semibold text-[#8A9A82]">{guest.pax} Pax</span>
                      <span>•</span>
                      <span>{guest.group}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAssignModal(guest)}
                    disabled={data.tables.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A9A82]/15 text-[#5A6953] dark:text-[#A4B59C] text-xs font-semibold hover:bg-[#8A9A82] hover:text-white transition-all shrink-0 disabled:opacity-40"
                    title="Tempatkan tamu ini ke meja"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Pilih Meja
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL BUAT / EDIT MEJA */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title={editingTable ? 'Edit Data Meja' : 'Tambah Meja Baru'}
        subtitle="Tentukan nama meja, bentuk, dan kapasitas kursi"
      >
        <form onSubmit={handleSaveTable} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Meja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Meja VIP 1 / Sahabat Kampus"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Bentuk Meja
              </label>
              <select
                value={formShape}
                onChange={(e) => setFormShape(e.target.value as 'round' | 'rect')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                <option value="round">Meja Bulat (Round Table)</option>
                <option value="rect">Meja Persegi Panjang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kapasitas Kursi (Pax)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan Lokasi Meja
            </label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contoh: Sisi kiri panggung pelaminan, dekat panggung musik..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsTableModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              {editingTable ? 'Simpan Perubahan' : 'Buat Meja'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TEMPATKAN TAMU KE MEJA */}
      <Modal
        isOpen={!!assigningGuest}
        onClose={() => setAssigningGuest(null)}
        title="Tempatkan Tamu ke Meja"
        subtitle={`Pilih meja untuk ${assigningGuest?.name} (${assigningGuest?.pax} Pax)`}
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Pilih Meja Tujuan
            </label>
            <select
              value={selectedTableIdForAssign}
              onChange={(e) => setSelectedTableIdForAssign(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            >
              {data.tables.map((t) => {
                const assigned = guestsByTable[t.id] || [];
                const occupiedPax = assigned.reduce((sum, g) => sum + g.pax, 0);
                const remaining = t.capacity - occupiedPax;
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} (Tersedia {remaining} dari {t.capacity} kursi)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setAssigningGuest(null)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              Tempatkan Tamu
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteTable(deleteTargetId);
        }}
        title="Hapus Meja Resepsi"
        message="Apakah Anda yakin ingin menghapus meja ini? Semua tamu yang ditempatkan di meja ini akan dipindahkan ke daftar belum mendapat meja."
        confirmLabel="Hapus Meja"
        isDestructive={true}
      />
    </div>
  );
};
