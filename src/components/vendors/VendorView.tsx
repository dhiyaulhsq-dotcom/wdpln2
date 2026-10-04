import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  MessageSquare,
  Instagram,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowRight,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { Vendor, VendorCategory, VendorStatus } from '../../types/wedding';
import { formatRupiah, parseRupiahInput } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const VENDOR_CATEGORIES: VendorCategory[] = [
  'Venue',
  'Katering',
  'Dekor',
  'MUA',
  'Fotografer',
  'Videografer',
  'Musik/Band',
  'WO',
  'Lainnya',
];

const VENDOR_STATUSES: VendorStatus[] = [
  'Prospek',
  'Negosiasi',
  'Deal',
  'Batal',
];

export const VendorView: React.FC = () => {
  const { data, addVendor, updateVendor, deleteVendor } = useWedding();

  const [activeTab, setActiveTab] = useState<'cards' | 'compare'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Comparison category selector
  const [compareCategory, setCompareCategory] = useState<VendorCategory>('Katering');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<VendorCategory>('Venue');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formQuotation, setFormQuotation] = useState('0');
  const [formDealPrice, setFormDealPrice] = useState('0');
  const [formStatus, setFormStatus] = useState<VendorStatus>('Prospek');
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState('');

  // Delete confirm
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filtered vendors
  const filteredVendors = data.vendors.filter((v) => {
    if (selectedCategory !== 'semua' && v.category !== selectedCategory) return false;
    if (statusFilter !== 'semua' && v.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchNotes = v.notes?.toLowerCase().includes(q);
      const matchIg = v.instagram?.toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchIg) return false;
    }
    return true;
  });

  // Comparison vendors
  const compareVendors = data.vendors.filter((v) => v.category === compareCategory);

  const openAddModal = (defaultCategory?: VendorCategory) => {
    setEditingVendor(null);
    setFormName('');
    setFormCategory(defaultCategory || 'Venue');
    setFormPhone('');
    setFormWhatsapp('');
    setFormInstagram('');
    setFormQuotation('0');
    setFormDealPrice('0');
    setFormStatus('Prospek');
    setFormRating(5);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormName(vendor.name);
    setFormCategory(vendor.category);
    setFormPhone(vendor.phone);
    setFormWhatsapp(vendor.whatsapp);
    setFormInstagram(vendor.instagram);
    setFormQuotation(vendor.quotationPrice.toString());
    setFormDealPrice((vendor.dealPrice || 0).toString());
    setFormStatus(vendor.status);
    setFormRating(vendor.rating || 5);
    setFormNotes(vendor.notes);
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const quot = parseRupiahInput(formQuotation);
    const deal = parseRupiahInput(formDealPrice);

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name: formName,
        category: formCategory,
        phone: formPhone,
        whatsapp: formWhatsapp,
        instagram: formInstagram.replace('@', ''),
        quotationPrice: quot,
        dealPrice: deal > 0 ? deal : undefined,
        status: formStatus,
        rating: formRating,
        notes: formNotes,
      });
    } else {
      addVendor({
        name: formName,
        category: formCategory,
        phone: formPhone,
        whatsapp: formWhatsapp || formPhone,
        instagram: formInstagram.replace('@', ''),
        quotationPrice: quot,
        dealPrice: deal > 0 ? deal : undefined,
        status: formStatus,
        rating: formRating,
        notes: formNotes,
      });
    }

    setIsModalOpen(false);
  };

  const cleanPhone = (val: string) => {
    let digits = val.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    return digits;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Store className="w-7 h-7 text-[#8A9A82]" />
            Vendor Pernikahan
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Daftar rekanan vendor, kontak WhatsApp, tautan Instagram, dan perbandingan harga paket
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Semua Vendor
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'compare'
                  ? 'bg-white dark:bg-[#1E1C1A] text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Bandingkan Vendor
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Vendor
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <>
          {/* FILTER BAR */}
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari vendor, nama IG, paket layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 md:flex-initial px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  <option value="semua">Semua Kategori</option>
                  {VENDOR_CATEGORIES.map((c) => (
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
                  <option value="semua">Semua Status</option>
                  {VENDOR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VENDOR CARDS GRID */}
          {filteredVendors.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
              Tidak ada vendor yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVendors.map((vendor) => {
                const statusBadge = {
                  Deal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300',
                  Negosiasi: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300',
                  Prospek: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300',
                  Batal: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-300',
                }[vendor.status];

                const waDigits = cleanPhone(vendor.whatsapp || vendor.phone);
                const igHandle = vendor.instagram.replace('@', '');

                return (
                  <div
                    key={vendor.id}
                    className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-[#8A9A82]/15 text-[#5A6953] dark:text-[#A4B59C]">
                          {vendor.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge}`}
                        >
                          {vendor.status}
                        </span>
                      </div>

                      {/* Name & Rating */}
                      <div className="flex items-start justify-between gap-2 mt-2">
                        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white leading-tight">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-0.5 shrink-0 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < vendor.rating ? 'fill-amber-400' : 'text-stone-200 dark:text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Price info */}
                      <div className="mt-3 p-3 rounded-xl bg-[#F0F4EF]/60 dark:bg-[#252220] border border-[#8A9A82]/15 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-stone-500">
                            {vendor.dealPrice ? 'Harga Deal' : 'Harga Penawaran'}
                          </p>
                          <p className="font-serif font-bold text-base text-stone-900 dark:text-white">
                            {formatRupiah(vendor.dealPrice || vendor.quotationPrice)}
                          </p>
                        </div>
                        {vendor.dealPrice && vendor.quotationPrice > vendor.dealPrice && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            Hemat {formatRupiah(vendor.quotationPrice - vendor.dealPrice)}
                          </span>
                        )}
                      </div>

                      {/* Notes / Services */}
                      {vendor.notes && (
                        <p className="mt-3 text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {vendor.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions: Social & Edit */}
                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {waDigits && (
                          <a
                            href={`https://wa.me/${waDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-colors"
                            title="Hubungi via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        {vendor.phone && (
                          <a
                            href={`tel:${vendor.phone}`}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 transition-colors"
                            title="Telepon Langsung"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {igHandle && (
                          <a
                            href={`https://instagram.com/${igHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 transition-colors"
                            title="Lihat Portofolio Instagram"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(vendor)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Edit vendor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(vendor.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Hapus vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* COMPARISON MATRIX VIEW */
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#8A9A82]/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Bandingkan Vendor Sejenis
              </h3>
              <p className="text-xs text-stone-500">
                Pilih kategori untuk membandingkan harga penawaran, rating bintang, dan benefit layanan
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Kategori:
              </span>
              <select
                value={compareCategory}
                onChange={(e) => setCompareCategory(e.target.value as VendorCategory)}
                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#252220] text-xs font-semibold text-stone-800 dark:text-stone-200"
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {compareVendors.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-12 text-center text-stone-400 text-sm border border-[#8A9A82]/20">
              Belum ada vendor yang dicatat pada kategori "{compareCategory}". Tambahkan minimal 2 vendor untuk membandingkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareVendors.map((v) => (
                <div
                  key={v.id}
                  className={`bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border shadow-xs flex flex-col justify-between ${
                    v.status === 'Deal'
                      ? 'border-[#8A9A82] ring-2 ring-[#8A9A82]/20'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        {v.name}
                      </h4>
                      {v.status === 'Deal' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8A9A82] text-white">
                          Pilihan Final
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < v.rating ? 'fill-amber-400' : 'text-stone-200 dark:text-stone-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 ml-1">
                        ({v.rating}/5)
                      </span>
                    </div>

                    <div className="py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-[#252220] border border-stone-200/60 dark:border-stone-800 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">Penawaran:</span>
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {formatRupiah(v.quotationPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-stone-700 dark:text-stone-300">Deal:</span>
                        <span className="font-serif text-[#8A9A82]">
                          {v.dealPrice ? formatRupiah(v.dealPrice) : '-'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        Catatan &amp; Benefit Paket:
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed bg-stone-50/50 dark:bg-stone-900/40 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
                        {v.notes || 'Belum ada rincian catatan.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">
                      Status: <strong className="text-stone-800 dark:text-stone-200">{v.status}</strong>
                    </span>
                    <button
                      onClick={() => openEditModal(v)}
                      className="text-xs text-[#8A9A82] font-semibold hover:underline"
                    >
                      Edit Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT VENDOR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Data Vendor' : 'Tambah Rekanan Vendor Baru'}
        subtitle="Simpan kontak, negosiasi harga, dan review paket layanan"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Vendor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Puspa Catering Services"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kategori Layanan
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as VendorCategory)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Status Kerjasama
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                {VENDOR_STATUSES.map((s) => (
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
                No. Telepon / Kantor
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0217983344"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Admin
              </label>
              <input
                type="tel"
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
                placeholder="081311223344"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Instagram (@)
              </label>
              <input
                type="text"
                value={formInstagram}
                onChange={(e) => setFormInstagram(e.target.value)}
                placeholder="puspacatering"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Harga Penawaran Awal (Rp)
              </label>
              <input
                type="text"
                value={formQuotation}
                onChange={(e) => setFormQuotation(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(formQuotation))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Harga Deal Final (Rp)
              </label>
              <input
                type="text"
                value={formDealPrice}
                onChange={(e) => setFormDealPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
              <span className="text-[10px] text-stone-500">
                {formatRupiah(parseRupiahInput(formDealPrice))}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Rating Kepuasan (1-5)
              </label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Puas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Bagus)</option>
                <option value={3}>⭐⭐⭐ (3 - Cukup)</option>
                <option value={2}>⭐⭐ (2 - Kurang)</option>
                <option value={1}>⭐ (1 - Buruk)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan Paket &amp; Benefit Tambahan
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contoh: Sudah termasuk bonus 1 ekor kambing guling, free test food 6 orang, pelunasan H-7..."
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
              {editingVendor ? 'Simpan Perubahan' : 'Tambahkan Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteVendor(deleteTargetId);
        }}
        title="Hapus Rekanan Vendor"
        message="Apakah Anda yakin ingin menghapus vendor ini dari daftar rekanan pernikahan?"
        confirmLabel="Hapus Vendor"
        isDestructive={true}
      />
    </div>
  );
};
