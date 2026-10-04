import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Guest } from '../../types/wedding';
import { parseGuestCsv, downloadFile } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (guests: Array<Omit<Guest, 'id'>>) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Array<Omit<Guest, 'id'>>>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleCsvContent = `Nama Tamu,Kelompok,Jumlah Orang (Pax),Nomor WhatsApp,Status RSVP,Catatan / Alergi
Bpk. Ahmad Fauzi & Ibu,Keluarga Pria,2,081234567890,Hadir,Saksi akad
Ibu Siti Nurhaliza & Suami,Keluarga Wanita,2,081398765432,Diundang,Vegetarian
Rendra Mahardika,Teman,1,081299887766,Belum diundang,Sahabat SMA
Dian Sastrowardoyo & Pasangan,VIP,2,081822334455,Hadir,Perlu akses kursi dekat lorong`;

  const handleDownloadTemplate = () => {
    // Include UTF-8 BOM so Excel opens with proper accents
    const bom = '\uFEFF';
    downloadFile(bom + sampleCsvContent, 'template_daftar_tamu_mahligai.csv', 'text/csv;charset=utf-8;');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      processParse(content);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    processParse(text);
  };

  const processParse = (content: string) => {
    setErrorMsg('');
    try {
      const parsed = parseGuestCsv(content);
      if (parsed.length === 0) {
        setParsedPreview([]);
        if (content.trim()) {
          setErrorMsg('Tidak ditemukan baris data tamu yang valid di dalam teks CSV.');
        }
      } else {
        setParsedPreview(parsed);
      }
    } catch {
      setErrorMsg('Gagal memproses data CSV. Pastikan format kolom sesuai template.');
    }
  };

  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) return;
    onImport(parsedPreview);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Tamu dari File CSV"
      subtitle="Unggah file spreadsheet CSV atau tempel teks data tamu langsung"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Helper info & Download template */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F0F4EF] dark:bg-[#252220] border border-[#8A9A82]/20 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <FileText className="w-4 h-4 text-[#8A9A82] shrink-0" />
            <span>Format kolom: Nama, Kelompok, Pax, No WhatsApp, Status RSVP, Catatan</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1C1A] border border-[#8A9A82]/30 text-[#5A6953] dark:text-[#A4B59C] font-semibold hover:bg-[#8A9A82]/10 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Contoh CSV
          </button>
        </div>

        {/* Upload file area */}
        <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center hover:border-[#8A9A82] transition-colors bg-stone-50/50 dark:bg-[#201d1b]">
          <Upload className="w-6 h-6 mx-auto text-[#8A9A82] mb-1.5" />
          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Pilih file .CSV dari komputer Anda
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="mt-2 text-xs text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8A9A82] file:text-white hover:file:bg-[#788870] cursor-pointer"
          />
        </div>

        {/* Or paste directly */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Atau Tempel Teks CSV di Sini:
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Nama Tamu,Kelompok,Jumlah Orang (Pax),Nomor WhatsApp,Status RSVP,Catatan..."
            className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
          />
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedPreview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8A9A82]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Terdeteksi {parsedPreview.length} Tamu Siap Diimpor
              </span>
              <span>Total Pax: {parsedPreview.reduce((sum, g) => sum + g.pax, 0)} Pax</span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 dark:bg-[#252220] sticky top-0 text-[10px] uppercase font-bold text-stone-600 dark:text-stone-400">
                  <tr>
                    <th className="p-2">Nama</th>
                    <th className="p-2">Kelompok</th>
                    <th className="p-2 text-center">Pax</th>
                    <th className="p-2">WhatsApp</th>
                    <th className="p-2">RSVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-[#1E1C1A]">
                  {parsedPreview.slice(0, 10).map((g, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium truncate max-w-[140px]">{g.name}</td>
                      <td className="p-2 text-stone-500">{g.group}</td>
                      <td className="p-2 text-center">{g.pax}</td>
                      <td className="p-2 font-mono text-[11px] text-stone-600">{g.phone || '-'}</td>
                      <td className="p-2 text-stone-500">{g.rsvpStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedPreview.length > 10 && (
                <p className="p-2 text-center text-[11px] text-stone-400 bg-stone-50 dark:bg-[#252220]">
                  ...dan {parsedPreview.length - 10} tamu lainnya
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleExecuteImport}
            className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
              parsedPreview.length === 0
                ? 'bg-stone-300 dark:bg-stone-800 cursor-not-allowed'
                : 'bg-[#8A9A82] hover:bg-[#788870]'
            }`}
          >
            Impor {parsedPreview.length} Tamu Sekarang
          </button>
        </div>
      </div>
    </Modal>
  );
};
