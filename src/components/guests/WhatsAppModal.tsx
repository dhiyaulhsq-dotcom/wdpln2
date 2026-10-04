import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { Guest, SeatingTable } from '../../types/wedding';
import { useWedding } from '../../context/WeddingContext';
import { formatTanggalIndonesia } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  tables: SeatingTable[];
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  guest,
  tables,
}) => {
  const { data, setInvitationTemplate, showToast } = useWedding();
  const [copied, setCopied] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [tempTemplate, setTempTemplate] = useState(data.invitationTemplate);

  if (!guest) return null;

  // Resolve table name
  const tableName = guest.tableId
    ? tables.find((t) => t.id === guest.tableId)?.name || 'Sesuai Arahan Among Tamu'
    : 'Sesuai Arahan Among Tamu';

  // Replace placeholders
  const coupleFullName = `${data.couple.groomName} & ${data.couple.brideName}`;
  const coupleNicknames = `${data.couple.groomNickname} & ${data.couple.brideNickname}`;
  const weddingDateStr = formatTanggalIndonesia(data.couple.weddingDate);

  const personalizedMessage = (isEditingTemplate ? tempTemplate : data.invitationTemplate)
    .replace(/\[Nama Tamu\]/g, guest.name)
    .replace(/\[Nama Pengantin\]/g, coupleFullName)
    .replace(/\[Nama Panggilan Pasangan\]/g, coupleNicknames)
    .replace(/\[Hari Tanggal\]/g, weddingDateStr)
    .replace(/\[Waktu\]/g, data.couple.weddingTime || '09:00 WIB')
    .replace(/\[Tempat\]/g, data.couple.venueName || 'Venue Pernikahan')
    .replace(/\[Alamat\]/g, data.couple.venueAddress || '')
    .replace(/\[Meja\]/g, tableName);

  const handleCopy = () => {
    navigator.clipboard.writeText(personalizedMessage);
    setCopied(true);
    showToast(`Pesan undangan untuk ${guest.name} berhasil disalin!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveTemplate = () => {
    setInvitationTemplate(tempTemplate);
    setIsEditingTemplate(false);
    showToast('Format template undangan diperbarui');
  };

  // Clean phone number for wa.me
  const cleanPhone = (raw: string) => {
    let digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    }
    return digits;
  };

  const phoneParam = cleanPhone(guest.phone);
  const waUrl = phoneParam
    ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(personalizedMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(personalizedMessage)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pesan Undangan WhatsApp"
      subtitle={`Personalisasi pesan untuk ${guest.name} (${guest.pax} Pax)`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Toggle Mode: Preview vs Edit Template */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {isEditingTemplate ? 'Edit Pola Template Pesan' : 'Pratinjau Pesan yang Akan Dikirim'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (isEditingTemplate) {
                handleSaveTemplate();
              } else {
                setTempTemplate(data.invitationTemplate);
                setIsEditingTemplate(true);
              }
            }}
            className="text-xs font-medium text-[#8A9A82] hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingTemplate ? 'Simpan Template' : 'Ubah Format Template'}
          </button>
        </div>

        {isEditingTemplate ? (
          <div className="space-y-2">
            <textarea
              rows={10}
              value={tempTemplate}
              onChange={(e) => setTempTemplate(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82] leading-relaxed"
            />
            <p className="text-[11px] text-stone-500">
              Variabel tersedia: <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Nama Tamu]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Nama Pengantin]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Hari Tanggal]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Waktu]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Tempat]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Alamat]</code>,{' '}
              <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">[Meja]</code>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F0F4EF]/70 dark:bg-[#252220] border border-[#8A9A82]/20 text-xs sm:text-sm whitespace-pre-line text-stone-800 dark:text-stone-200 leading-relaxed max-h-72 overflow-y-auto font-sans shadow-inner">
            {personalizedMessage}
          </div>
        )}

        {/* Guest Meta Pill */}
        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 bg-stone-50 dark:bg-[#1E1C1A] p-3 rounded-xl border border-stone-200 dark:border-stone-800 gap-2">
          <span>
            Nomor Tujuan: <strong className="text-stone-800 dark:text-stone-200">{guest.phone || 'Belum ada nomor HP'}</strong>
          </span>
          <span>
            Meja Ditunjuk: <strong className="text-stone-800 dark:text-stone-200">{tableName}</strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#282522] border border-[#8A9A82]/40 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-[#8A9A82]/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#8A9A82]" />
                Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#8A9A82]" />
                Salin Pesan Teks
              </>
            )}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            Buka di WhatsApp
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
