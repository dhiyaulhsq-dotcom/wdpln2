import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Printer,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  MapPin,
  User,
  Phone,
  Calendar,
  Heart,
  FileDown,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { RundownItem } from '../../types/wedding';
import { formatTanggalIndonesia } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const RundownView: React.FC = () => {
  const {
    data,
    addRundownItem,
    updateRundownItem,
    deleteRundownItem,
    moveRundownItem,
  } = useWedding();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);

  const [formStart, setFormStart] = useState('08:00');
  const [formEnd, setFormEnd] = useState('09:00');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPic, setFormPic] = useState('');
  const [formPicPhone, setFormPicPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sortedRundown = [...data.rundown].sort((a, b) => a.order - b.order);

  const openAddModal = () => {
    setEditingItem(null);
    setFormStart('08:00');
    setFormEnd('09:00');
    setFormTitle('');
    setFormLocation(data.couple.venueName || '');
    setFormPic('');
    setFormPicPhone('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: RundownItem) => {
    setEditingItem(item);
    setFormStart(item.startTime);
    setFormEnd(item.endTime);
    setFormTitle(item.title);
    setFormLocation(item.location);
    setFormPic(item.pic);
    setFormPicPhone(item.picPhone || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      updateRundownItem(editingItem.id, {
        startTime: formStart,
        endTime: formEnd,
        title: formTitle,
        location: formLocation,
        pic: formPic,
        picPhone: formPicPhone,
        notes: formNotes,
      });
    } else {
      addRundownItem({
        startTime: formStart,
        endTime: formEnd,
        title: formTitle,
        location: formLocation,
        pic: formPic,
        picPhone: formPicPhone,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* SCREEN VIEW (NO PRINT) */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-[#8A9A82]" />
              Susunan Acara Hari-H (Rundown)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Jadwal pelaksanaan detail setiap prosesi, penanggung jawab lapangan (PIC), dan catatan teknis
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1C1A] text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-[#8A9A82]" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Sesi Acara
            </button>
          </div>
        </div>

        {/* Rundown list items */}
        {sortedRundown.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
            Belum ada sesi acara di dalam rundown. Klik tombol "Tambah Sesi Acara" untuk mulai menyusun jadwal hari-H.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#8A9A82]/20 shadow-xs divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden">
            {sortedRundown.map((item, index) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBF8F3] dark:hover:bg-[#252220]/60 transition-colors group"
              >
                {/* Time & Sequence indicator */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#8A9A82]/15 text-[#8A9A82] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    #{item.order || index + 1}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        {item.startTime} - {item.endTime} WIB
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-white leading-tight">
                        {item.title}
                      </h3>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-0.5">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8A9A82]" />
                          {item.location}
                        </span>
                      )}
                      {item.pic && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#8A9A82]" />
                          PIC: <strong className="text-stone-700 dark:text-stone-300">{item.pic}</strong>
                          {item.picPhone && (
                            <span className="text-stone-400 font-mono">({item.picPhone})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reorder and Edit Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
                    <button
                      onClick={() => moveRundownItem(item.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-500 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Geser ke atas"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveRundownItem(item.id, 'down')}
                      disabled={index === sortedRundown.length - 1}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-500 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Geser ke bawah"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Edit acara"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus acara"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINT-ONLY CLEAN VIEW (A4 READY) */}
      <div className="print-only p-8 text-black bg-white">
        {/* Monogram & Title */}
        <div className="text-center pb-6 border-b-2 border-stone-800 mb-6">
          <div className="inline-block p-2 rounded-full border border-stone-400 mb-2">
            <Heart className="w-6 h-6 mx-auto text-stone-700" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide uppercase">
            Rundown Susunan Acara Pernikahan
          </h1>
          <p className="font-serif text-xl font-medium mt-1">
            {data.couple.groomName} &amp; {data.couple.brideName}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-stone-600 mt-2">
            <span>📅 {formatTanggalIndonesia(data.couple.weddingDate)}</span>
            <span>📍 {data.couple.venueName}</span>
          </div>
          {data.couple.venueAddress && (
            <p className="text-xs text-stone-500 mt-1">{data.couple.venueAddress}</p>
          )}
        </div>

        {/* Printable Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-stone-800 font-bold uppercase tracking-wider text-[11px] bg-stone-100">
              <th className="p-2.5 w-12 text-center">No</th>
              <th className="p-2.5 w-28">Waktu (WIB)</th>
              <th className="p-2.5">Nama Kegiatan / Prosesi</th>
              <th className="p-2.5 w-36">Lokasi</th>
              <th className="p-2.5 w-44">Penanggung Jawab (PIC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-300">
            {sortedRundown.map((item, idx) => (
              <tr key={item.id} className="print-break-inside-avoid">
                <td className="p-2.5 text-center font-bold">{idx + 1}</td>
                <td className="p-2.5 font-mono font-semibold">
                  {item.startTime} - {item.endTime}
                </td>
                <td className="p-2.5">
                  <p className="font-bold text-stone-900">{item.title}</p>
                  {item.notes && <p className="text-[11px] text-stone-600 mt-0.5">{item.notes}</p>}
                </td>
                <td className="p-2.5 text-stone-700">{item.location || '-'}</td>
                <td className="p-2.5">
                  <p className="font-semibold text-stone-900">{item.pic || '-'}</p>
                  {item.picPhone && <p className="text-[10px] text-stone-600 font-mono">{item.picPhone}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer print info */}
        <div className="mt-8 pt-4 border-t border-stone-400 flex items-center justify-between text-[10px] text-stone-500">
          <span>Dicetak dari Mahligai - Personal Wedding Planner</span>
          <span>Dokumen Resmi Panitia &amp; Rekanan Vendor</span>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT RUNDOWN */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Sesi Acara' : 'Tambah Sesi Acara Hari-H'}
        subtitle="Atur durasi waktu, lokasi ruangan, dan penanggung jawab"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Waktu Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                placeholder="07:30"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Waktu Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                placeholder="08:30"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Kegiatan / Prosesi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Contoh: Prosesi Akad Nikah & Ijab Kabul"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Lokasi / Ruangan
            </label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="Contoh: Area Meja Akad Ballroom / Ruang Rias"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={formPic}
                onChange={(e) => setFormPic(e.target.value)}
                placeholder="Contoh: Penghulu & WO Mas Fajar"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                No. HP PIC
              </label>
              <input
                type="tel"
                value={formPicPhone}
                onChange={(e) => setFormPicPhone(e.target.value)}
                placeholder="08119988771"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan / Properti / Instruksi Teknis
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Catatan pengeras suara, saksi nikah sudah di tempat, standby photografer..."
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
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan Sesi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteRundownItem(deleteTargetId);
        }}
        title="Hapus Sesi Acara Rundown"
        message="Apakah Anda yakin ingin menghapus sesi acara ini dari susunan acara hari-H?"
        confirmLabel="Hapus Sesi"
        isDestructive={true}
      />
    </div>
  );
};
