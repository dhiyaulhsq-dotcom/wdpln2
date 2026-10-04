import React, { useState, useRef } from 'react';
import {
  Settings,
  Heart,
  Save,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { formatRupiah, parseRupiahInput } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    data,
    updateCouple,
    setTotalBudget,
    setInvitationTemplate,
    toggleDarkMode,
    resetToSampleData,
    clearAllData,
    exportBackupData,
    importBackupData,
    showToast,
  } = useWedding();

  // Couple profile form
  const [groomName, setGroomName] = useState(data.couple.groomName);
  const [brideName, setBrideName] = useState(data.couple.brideName);
  const [groomNick, setGroomNick] = useState(data.couple.groomNickname);
  const [brideNick, setBrideNick] = useState(data.couple.brideNickname);
  const [weddingDate, setWeddingDate] = useState(data.couple.weddingDate);
  const [weddingTime, setWeddingTime] = useState(data.couple.weddingTime);
  const [venueName, setVenueName] = useState(data.couple.venueName);
  const [venueAddress, setVenueAddress] = useState(data.couple.venueAddress);
  const [motto, setMotto] = useState(data.couple.motto);
  const [budgetLimit, setBudgetLimit] = useState(data.couple.totalBudget.toString());

  // Template form
  const [templateText, setTemplateText] = useState(data.invitationTemplate);

  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog triggers
  const [isResetSampleOpen, setIsResetSampleOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCouple({
      groomName,
      brideName,
      groomNickname: groomNick,
      brideNickname: brideNick,
      weddingDate,
      weddingTime,
      venueName,
      venueAddress,
      motto,
    });
    setTotalBudget(parseRupiahInput(budgetLimit));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setInvitationTemplate(templateText);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#8A9A82]" />
          Pengaturan &amp; Cadangan Data
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Konfigurasi profil pernikahan, batas anggaran, tampilan aplikasi, serta pencadangan file
        </p>
      </div>

      {/* 1. TAMPILAN & TEMA */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
          Tema &amp; Tampilan Aplikasi
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-stone-900 dark:text-white">
              Mode Gelap (Dark Mode)
            </p>
            <p className="text-xs text-stone-500">
              Gunakan mode gelap untuk kenyamanan mata di malam hari
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            {data.darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                Mode Terang
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                Mode Gelap
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PROFIL PERNIKAHAN & ANGGARAN */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span>Profil Pengantin &amp; Acara</span>
          <span className="text-xs font-sans text-[#8A9A82] font-semibold">Tersimpan Otomatis</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Lengkap Calon Pengantin Pria
              </label>
              <input
                type="text"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Panggilan Pria
              </label>
              <input
                type="text"
                value={groomNick}
                onChange={(e) => setGroomNick(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Lengkap Calon Pengantin Wanita
              </label>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Panggilan Wanita
              </label>
              <input
                type="text"
                value={brideNick}
                onChange={(e) => setBrideNick(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal Hari-H
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Waktu Acara
              </label>
              <input
                type="text"
                value={weddingTime}
                onChange={(e) => setWeddingTime(e.target.value)}
                placeholder="08:30 WIB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Batas Total Anggaran (Rp)
              </label>
              <input
                type="text"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(budgetLimit))}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Gedung / Ballroom Venue
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Contoh: Sasana Kriya Ballroom"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Alamat Lengkap Venue
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Jl. Raya TMII, Jakarta Timur"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Motto Pernikahan / Doa Indah
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Pernikahan
            </button>
          </div>
        </form>
      </div>

      {/* 3. TEMPLATE PESAN UNDANGAN WHATSAPP */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
          Template Undangan WhatsApp
        </h3>
        <p className="text-xs text-stone-500">
          Format pesan ini akan otomatis diisi dengan nama tamu, tanggal, gedung, dan nomor meja saat Anda menekan tombol "Pesan WA".
        </p>

        <form onSubmit={handleSaveTemplate} className="space-y-3">
          <textarea
            rows={8}
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82] leading-relaxed"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-stone-500">
              Gunakan tag: <code>[Nama Tamu]</code>, <code>[Nama Pengantin]</code>, <code>[Hari Tanggal]</code>, <code>[Waktu]</code>, <code>[Tempat]</code>, <code>[Meja]</code>
            </p>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-900 dark:hover:bg-white transition-colors"
            >
              Simpan Template Undangan
            </button>
          </div>
        </form>
      </div>

      {/* 4. CADANGAN & PEMULIHAN DATA (EXPORT / IMPORT JSON) */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
          Cadangan &amp; Pemulihan Data (Backup JSON)
        </h3>
        <p className="text-xs text-stone-500">
          Simpan seluruh data rencana pernikahan Anda (checklist, anggaran, tamu, vendor, rundown, meja, dan catatan) ke file JSON di komputer Anda agar aman, atau pulihkan di perangkat lain.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={exportBackupData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-xs font-semibold hover:bg-[#788870] shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Ekspor Cadangan (Unduh JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Pulihkan dari File JSON
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleJsonUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. RESET DATA AREA (DANGER ZONE) */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-rose-200 dark:border-rose-950/60 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-rose-700 dark:text-rose-400 pb-3 border-b border-rose-100 dark:border-rose-950/40 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Area Berbahaya (Reset Data)
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Gunakan opsi ini jika Anda ingin mengembalikan rencana ke template contoh Indonesia, atau ingin memulai rencana pernikahan Anda sendiri dari halaman kosong.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setIsResetSampleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Kembalikan ke Contoh Realistis
          </button>

          <button
            onClick={() => setIsClearAllOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            Mulai dari Kosong (Hapus Semua)
          </button>
        </div>
      </div>

      {/* CONFIRM RESET TO SAMPLE */}
      <ConfirmDialog
        isOpen={isResetSampleOpen}
        onClose={() => setIsResetSampleOpen(false)}
        onConfirm={resetToSampleData}
        title="Atur Ulang ke Data Contoh?"
        message="Data saat ini akan diganti dengan data contoh pernikahan Dimas & Adinda. Data yang belum Anda ekspor ke JSON akan tertimpa."
        confirmLabel="Ya, Atur Ulang"
      />

      {/* CONFIRM CLEAR ALL */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={clearAllData}
        title="Hapus Semua Data & Mulai Kosong?"
        message="Seluruh checklist, anggaran, tamu, vendor, rundown, meja, dan catatan akan dihapus bersih. Pastikan Anda sudah mengunduh cadangan JSON jika data ini masih dibutuhkan."
        confirmLabel="Hapus Bersih Sekarang"
        isDestructive={true}
      />
    </div>
  );
};
