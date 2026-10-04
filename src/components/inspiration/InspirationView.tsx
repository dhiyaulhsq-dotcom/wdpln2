import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Palette,
  Image as ImageIcon,
  FileText,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { MoodboardItem, NoteItem, PaletteColor } from '../../types/wedding';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const InspirationView: React.FC = () => {
  const {
    data,
    addMoodboard,
    deleteMoodboard,
    updatePalette,
    addNote,
    updateNote,
    deleteNote,
    showToast,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'moodboard' | 'palette' | 'notes'>('moodboard');

  // Moodboard modal
  const [isMoodboardModalOpen, setIsMoodboardModalOpen] = useState(false);
  const [mbTitle, setMbTitle] = useState('');
  const [mbCategory, setMbCategory] = useState('Dekorasi & Bunga');
  const [mbImageUrl, setMbImageUrl] = useState('');
  const [mbColorHex, setMbColorHex] = useState('#8A9A82');
  const [mbNotes, setMbNotes] = useState('');
  const [deleteMbId, setDeleteMbId] = useState<string | null>(null);

  // Palette editing
  const [tempPalette, setTempPalette] = useState<PaletteColor[]>(data.palette);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Notes modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Seserahan');
  const [noteContent, setNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const handleSaveMoodboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbTitle.trim()) return;

    addMoodboard({
      title: mbTitle,
      category: mbCategory,
      imageUrl: mbImageUrl || undefined,
      colorHex: mbColorHex || undefined,
      notes: mbNotes,
    });

    setIsMoodboardModalOpen(false);
  };

  const handleColorChange = (index: number, newHex: string) => {
    const updated = [...tempPalette];
    updated[index] = { ...updated[index], hex: newHex };
    setTempPalette(updated);
    updatePalette(updated);
  };

  const handleColorNameChange = (index: number, newName: string) => {
    const updated = [...tempPalette];
    updated[index] = { ...updated[index], name: newName };
    setTempPalette(updated);
    updatePalette(updated);
  };

  const handleAddPaletteColor = () => {
    if (tempPalette.length >= 6) {
      showToast('Maksimal 6 warna tema palet utama', 'info');
      return;
    }
    const newColor: PaletteColor = {
      id: 'pal-' + Date.now(),
      name: 'Warna Baru',
      hex: '#D8A7A0',
    };
    const updated = [...tempPalette, newColor];
    setTempPalette(updated);
    updatePalette(updated);
  };

  const handleRemovePaletteColor = (id: string) => {
    if (tempPalette.length <= 2) {
      showToast('Minimal 2 warna tema pernikahan', 'info');
      return;
    }
    const updated = tempPalette.filter((c) => c.id !== id);
    setTempPalette(updated);
    updatePalette(updated);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Kode warna ${hex} disalin!`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Notes actions
  const openAddNoteModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteCategory('Seserahan');
    setNoteContent('');
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (note: NoteItem) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteCategory(note.category || 'Catatan');
    setNoteContent(note.content);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: noteTitle,
        category: noteCategory,
        content: noteContent,
      });
    } else {
      addNote({
        title: noteTitle,
        category: noteCategory,
        content: noteContent,
      });
    }

    setIsNoteModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[#C9A96E]" />
            Inspirasi &amp; Catatan Pernikahan
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Koleksi visual moodboard impian, palet warna tema, serta ruang catatan bebas persiapan
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('moodboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'moodboard'
                ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Moodboard ({data.moodboards.length})
          </button>
          <button
            onClick={() => setActiveTab('palette')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'palette'
                ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Palet Tema ({data.palette.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Catatan ({data.notes.length})
          </button>
        </div>
      </div>

      {/* 1. MOODBOARD TAB */}
      {activeTab === 'moodboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Simpan referensi visual dekorasi, busana, cincin kawin, dan bunga
            </p>
            <button
              onClick={() => {
                setMbTitle('');
                setMbImageUrl('');
                setMbColorHex('#8A9A82');
                setMbNotes('');
                setIsMoodboardModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8A9A82] text-white text-xs font-semibold hover:bg-[#788870] shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Inspirasi
            </button>
          </div>

          {data.moodboards.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
              Belum ada inspirasi di moodboard Anda. Tambahkan foto atau warna referensi pertama!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.moodboards.map((mb) => (
                <div
                  key={mb.id}
                  className="bg-white dark:bg-[#1E1C1A] rounded-2xl overflow-hidden border border-[#8A9A82]/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Visual Header (Image or Color Block) */}
                  <div className="relative w-full h-48 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    {mb.imageUrl ? (
                      <img
                        src={mb.imageUrl}
                        alt={mb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // fallback if URL broken
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white/90 font-serif text-lg font-bold"
                        style={{ backgroundColor: mb.colorHex || '#8A9A82' }}
                      >
                        {mb.colorHex}
                      </div>
                    )}

                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-xs text-stone-800 dark:text-stone-200">
                      {mb.category}
                    </span>

                    <button
                      onClick={() => setDeleteMbId(mb.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 dark:bg-black/80 text-stone-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus inspirasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white leading-tight">
                        {mb.title}
                      </h4>
                      {mb.notes && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          {mb.notes}
                        </p>
                      )}
                    </div>

                    {mb.colorHex && (
                      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: mb.colorHex }}
                          />
                          <span className="font-mono">{mb.colorHex}</span>
                        </div>
                        {mb.imageUrl && (
                          <a
                            href={mb.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8A9A82] hover:underline flex items-center gap-1"
                          >
                            Buka Foto <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PALETTE TAB */}
      {activeTab === 'palette' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  Palet Warna Tema Pernikahan
                </h3>
                <p className="text-xs text-stone-500">
                  Warna utama yang digunakan untuk dekorasi pelaminan, busana pengantin, bunga, dan undangan
                </p>
              </div>

              <button
                onClick={handleAddPaletteColor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Warna Palet
              </button>
            </div>

            {/* Live Palette Visual Bar */}
            <div className="mt-6 h-20 rounded-2xl overflow-hidden flex shadow-inner border border-stone-200 dark:border-stone-800">
              {tempPalette.map((col) => (
                <div
                  key={col.id}
                  className="flex-1 flex flex-col items-center justify-end p-2 transition-all hover:flex-grow-2 relative group"
                  style={{ backgroundColor: col.hex }}
                >
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {col.hex}
                  </span>
                </div>
              ))}
            </div>

            {/* Individual Swatch Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {tempPalette.map((col, idx) => (
                <div
                  key={col.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#252220] space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={col.hex}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent p-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => handleColorNameChange(idx, e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#8A9A82] focus:outline-hidden py-0.5"
                      />
                      <button
                        onClick={() => handleCopyHex(col.hex)}
                        className="text-[11px] font-mono text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 mt-0.5"
                      >
                        {copiedHex === col.hex ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{col.hex}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleRemovePaletteColor(col.id)}
                      className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Catatan bebas untuk daftar seserahan, playlist musik hari-H, janji suci, dan nomor darurat
            </p>
            <button
              onClick={openAddNoteModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8A9A82] text-white text-xs font-semibold hover:bg-[#788870] shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Tulis Catatan Baru
            </button>
          </div>

          {data.notes.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
              Belum ada catatan tersimpan. Klik "Tulis Catatan Baru" untuk mencatat detail penting pernikahan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8A9A82]/15 text-[#5A6953] dark:text-[#A4B59C]">
                        {note.category}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {note.updatedAt}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white leading-tight">
                      {note.title}
                    </h4>

                    <div className="mt-3 text-xs text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto bg-stone-50/50 dark:bg-[#252220] p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                      {note.content}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditNoteModal(note)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Edit catatan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteNoteId(note.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL TAMBAH MOODBOARD */}
      <Modal
        isOpen={isMoodboardModalOpen}
        onClose={() => setIsMoodboardModalOpen(false)}
        title="Tambah Inspirasi Moodboard"
        subtitle="Simpan foto referensi dari internet atau warna tema"
      >
        <form onSubmit={handleSaveMoodboard} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Judul Inspirasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={mbTitle}
              onChange={(e) => setMbTitle(e.target.value)}
              placeholder="Contoh: Gapura Bunga Eucalyptus & Mawar Putih"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kategori Inspirasi
              </label>
              <select
                value={mbCategory}
                onChange={(e) => setMbCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                <option value="Dekorasi & Bunga">Dekorasi &amp; Bunga</option>
                <option value="Busana Pengantin">Busana Pengantin</option>
                <option value="Mahar & Cincin">Mahar &amp; Cincin</option>
                <option value="Tata Meja & Lighting">Tata Meja &amp; Lighting</option>
                <option value="Kue & Katering">Kue &amp; Katering</option>
                <option value="Undangan & Souvenir">Undangan &amp; Souvenir</option>
                <option value="Pose Foto & Video">Pose Foto &amp; Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Aksen Warna Terkait
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={mbColorHex}
                  onChange={(e) => setMbColorHex(e.target.value)}
                  className="w-10 h-9 rounded-xl border border-stone-300 dark:border-stone-700 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={mbColorHex}
                  onChange={(e) => setMbColorHex(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              URL Foto / Gambar (Opsional)
            </label>
            <input
              type="url"
              value={mbImageUrl}
              onChange={(e) => setMbImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan Detail / Konsep
            </label>
            <textarea
              rows={2}
              value={mbNotes}
              onChange={(e) => setMbNotes(e.target.value)}
              placeholder="Detail bunga segar, posisi pencahayaan, atau vendor yang bisa mewujudkan..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsMoodboardModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              Simpan ke Moodboard
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TULIS / EDIT CATATAN */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? 'Edit Catatan' : 'Tulis Catatan Baru'}
        subtitle="Dokumentasikan daftar barang, lirik lagu, janji suci, atau briefing"
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Judul Catatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Contoh: Daftar Seserahan Dimas untuk Adinda"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                placeholder="Seserahan / Hiburan / Operasional / Doa"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Isi Catatan
            </label>
            <textarea
              rows={8}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Tuliskan butir-butir catatan Anda di sini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82] font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm"
            >
              {editingNote ? 'Simpan Perubahan' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MOODBOARD */}
      <ConfirmDialog
        isOpen={!!deleteMbId}
        onClose={() => setDeleteMbId(null)}
        onConfirm={() => {
          if (deleteMbId) deleteMoodboard(deleteMbId);
        }}
        title="Hapus Kartu Moodboard"
        message="Apakah Anda yakin ingin menghapus inspirasi visual ini?"
        confirmLabel="Hapus"
        isDestructive={true}
      />

      {/* CONFIRM DELETE NOTE */}
      <ConfirmDialog
        isOpen={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={() => {
          if (deleteNoteId) deleteNote(deleteNoteId);
        }}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan ini?"
        confirmLabel="Hapus Catatan"
        isDestructive={true}
      />
    </div>
  );
};
