import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  Wallet,
  Users,
  Store,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import {
  formatRupiah,
  formatTanggalIndonesia,
  formatTanggalSingkat,
  calculateCountdown,
  CountdownResult,
} from '../../utils/formatters';
import { NavTab } from '../common/Sidebar';
import { Modal } from '../common/Modal';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickTaskModal?: () => void;
  onOpenQuickBudgetModal?: () => void;
  onOpenQuickGuestModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenQuickTaskModal,
  onOpenQuickBudgetModal,
  onOpenQuickGuestModal,
}) => {
  const { data, toggleChecklistComplete, updateCouple } = useWedding();

  // Live countdown state
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown(data.couple.weddingDate, data.couple.weddingTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(data.couple.weddingDate, data.couple.weddingTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.couple.weddingDate, data.couple.weddingTime]);

  // Edit couple profile modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editGroom, setEditGroom] = useState(data.couple.groomName);
  const [editBride, setEditBride] = useState(data.couple.brideName);
  const [editGroomNick, setEditGroomNick] = useState(data.couple.groomNickname);
  const [editBrideNick, setEditBrideNick] = useState(data.couple.brideNickname);
  const [editDate, setEditDate] = useState(data.couple.weddingDate);
  const [editTime, setEditTime] = useState(data.couple.weddingTime);
  const [editVenue, setEditVenue] = useState(data.couple.venueName);
  const [editAddress, setEditAddress] = useState(data.couple.venueAddress);
  const [editMotto, setEditMotto] = useState(data.couple.motto);

  const openProfileModal = () => {
    setEditGroom(data.couple.groomName);
    setEditBride(data.couple.brideName);
    setEditGroomNick(data.couple.groomNickname);
    setEditBrideNick(data.couple.brideNickname);
    setEditDate(data.couple.weddingDate);
    setEditTime(data.couple.weddingTime);
    setEditVenue(data.couple.venueName);
    setEditAddress(data.couple.venueAddress);
    setEditMotto(data.couple.motto);
    setIsEditingProfile(true);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCouple({
      groomName: editGroom,
      brideName: editBride,
      groomNickname: editGroomNick,
      brideNickname: editBrideNick,
      weddingDate: editDate,
      weddingTime: editTime,
      venueName: editVenue,
      venueAddress: editAddress,
      motto: editMotto,
    });
    setIsEditingProfile(false);
  };

  // Calculations
  // 1. Checklist
  const totalChecklist = data.checklist.length;
  const completedChecklist = data.checklist.filter((i) => i.completed).length;
  const checklistPercent =
    totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // 2. Budget
  const totalActual = data.budget.reduce((sum, i) => sum + (i.actualCost || i.estimatedCost || 0), 0);
  const totalPaid = data.budget.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const remainingBudget = data.couple.totalBudget - totalActual;
  const isOverBudget = remainingBudget < 0;

  // 3. Guests
  const totalGuestsCount = data.guests.length;
  const totalPax = data.guests.reduce((sum, g) => sum + g.pax, 0);
  const attendingGuests = data.guests.filter((g) => g.rsvpStatus === 'Hadir');
  const attendingPax = attendingGuests.reduce((sum, g) => sum + g.pax, 0);
  const pendingGuests = data.guests.filter((g) => g.rsvpStatus === 'Diundang');
  const declinedGuests = data.guests.filter((g) => g.rsvpStatus === 'Tidak hadir');

  // 4. Vendors
  const dealVendors = data.vendors.filter((v) => v.status === 'Deal').length;
  const totalVendors = data.vendors.length;

  // 5. Nearest 5 pending tasks
  const pendingTasks = data.checklist
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 5);

  // 6. Donut chart budget breakdown
  const categoryTotals: Record<string, number> = {};
  data.budget.forEach((item) => {
    const cost = item.actualCost || item.estimatedCost || 0;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + cost;
  });

  const chartColors = [
    '#8A9A82', // Sage
    '#D8A7A0', // Dusty Rose
    '#C9A96E', // Soft Gold
    '#688B58', // Forest Sage
    '#B57C76', // Deep Rose
    '#D9B382', // Ochre
    '#7D8B99', // Slate
    '#A09285', // Warm Taupe
    '#9B6B6B', // Wine
    '#5E7461', // Olive
  ];

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const chartGrandTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Compute SVG Donut segments
  let cumulativeAngle = 0;
  const donutSegments = sortedCategories.map(([cat, amount], index) => {
    const fraction = chartGrandTotal > 0 ? amount / chartGrandTotal : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      category: cat,
      amount,
      percentage: Math.round(fraction * 100),
      color: chartColors[index % chartColors.length],
      startAngle,
      angle,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8A9A82]/15 via-[#FBF8F3] to-[#D8A7A0]/20 dark:from-[#2a3028] dark:via-[#1E1C1A] dark:to-[#2c1f1e] p-6 sm:p-8 lg:p-10 border border-[#8A9A82]/20 shadow-sm">
        {/* Subtle decorative floral/ring watermark */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#8A9A82]/10 dark:bg-[#8A9A82]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#D8A7A0]/10 dark:bg-[#D8A7A0]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Couple Title & Meta */}
          <div className="text-center lg:text-left space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A9A82]/15 dark:bg-[#8A9A82]/25 text-[#5A6953] dark:text-[#A4B59C] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Pernikahan Suci Menuju Hari Bahagia</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2E2A27] dark:text-[#FBF8F3]">
                {data.couple.groomNickname || 'Dimas'} &amp;{' '}
                {data.couple.brideNickname || 'Adinda'}
              </h1>
              <button
                onClick={openProfileModal}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="Edit data pasangan"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <p className="italic text-stone-600 dark:text-stone-400 font-serif text-sm sm:text-base max-w-xl">
              "{data.couple.motto || 'Meniti hari bahagia menuju keluarga sakinah, mawaddah, warahmah'}"
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#8A9A82]" />
                <span className="font-medium">
                  {formatTanggalIndonesia(data.couple.weddingDate) || 'Belum diatur'}
                </span>
                {data.couple.weddingTime && (
                  <span className="text-stone-400">({data.couple.weddingTime})</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8A9A82]" />
                <span className="font-medium truncate max-w-[280px]">
                  {data.couple.venueName || 'Lokasi belum ditentukan'}
                </span>
              </div>
            </div>
          </div>

          {/* COUNTDOWN WIDGET */}
          <div className="shrink-0 bg-white/90 dark:bg-[#252220]/90 backdrop-blur-md rounded-2xl p-5 border border-[#8A9A82]/25 shadow-lg flex flex-col items-center">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#8A9A82] mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Hitung Mundur Hari-H
            </p>
            {countdown.isPast ? (
              <div className="text-center py-2 px-4">
                <p className="font-serif text-2xl font-bold text-[#8A9A82]">
                  Selamat Berbahagia!
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Hari pernikahan telah terlaksana
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="bg-[#F0F4EF] dark:bg-[#1E1C1A] rounded-xl px-3 py-2.5 min-w-[60px] border border-[#8A9A82]/15">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2E2A27] dark:text-white">
                    {countdown.days}
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    Hari
                  </p>
                </div>
                <div className="bg-[#F0F4EF] dark:bg-[#1E1C1A] rounded-xl px-3 py-2.5 min-w-[60px] border border-[#8A9A82]/15">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2E2A27] dark:text-white">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    Jam
                  </p>
                </div>
                <div className="bg-[#F0F4EF] dark:bg-[#1E1C1A] rounded-xl px-3 py-2.5 min-w-[60px] border border-[#8A9A82]/15">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2E2A27] dark:text-white">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    Menit
                  </p>
                </div>
                <div className="bg-[#F0F4EF] dark:bg-[#1E1C1A] rounded-xl px-3 py-2.5 min-w-[60px] border border-[#8A9A82]/15">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8A9A82]">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
                    Detik
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4 SUMMARY STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Checklist */}
        <div
          onClick={() => onSelectTab('checklist')}
          className="cursor-pointer bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 hover:border-[#8A9A82]/50 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Checklist Persiapan
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8A9A82]/15 flex items-center justify-center text-[#8A9A82]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              {checklistPercent}%
            </span>
            <span className="text-xs text-stone-500">
              {completedChecklist} / {totalChecklist} selesai
            </span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#8A9A82] h-full rounded-full transition-all duration-500"
              style={{ width: `${checklistPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-[#8A9A82] font-medium group-hover:translate-x-0.5 transition-transform">
            <span>Buka Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Anggaran */}
        <div
          onClick={() => onSelectTab('budget')}
          className="cursor-pointer bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 hover:border-[#8A9A82]/50 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Anggaran
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isOverBudget
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-[#C9A96E]/15 text-[#C9A96E]'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mb-2">
            <p className="text-lg font-serif font-bold text-stone-900 dark:text-white truncate">
              {formatRupiah(totalActual)}
            </p>
            <p className="text-xs text-stone-500">
              Batas Budget: {formatRupiah(data.couple.totalBudget)}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span
              className={`font-semibold ${
                isOverBudget ? 'text-rose-600' : 'text-[#8A9A82]'
              }`}
            >
              {isOverBudget
                ? `Lebih ${formatRupiah(Math.abs(remainingBudget))}`
                : `Sisa ${formatRupiah(remainingBudget)}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8A9A82] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Tamu & RSVP */}
        <div
          onClick={() => onSelectTab('guests')}
          className="cursor-pointer bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 hover:border-[#8A9A82]/50 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Daftar Tamu &amp; RSVP
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D8A7A0]/20 flex items-center justify-center text-[#B57C76]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              {attendingPax}{' '}
              <span className="text-sm font-sans font-normal text-stone-500">
                / {totalPax} pax
              </span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mb-2">
            {attendingGuests.length} hadir • {pendingGuests.length} diundang • {declinedGuests.length} batal
          </p>
          <div className="flex items-center justify-between text-xs text-[#8A9A82] font-medium group-hover:translate-x-0.5 transition-transform">
            <span>Kelola Tamu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Vendor */}
        <div
          onClick={() => onSelectTab('vendors')}
          className="cursor-pointer bg-white dark:bg-[#1E1C1A] rounded-2xl p-5 border border-[#8A9A82]/20 hover:border-[#8A9A82]/50 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Vendor Deal
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8A9A82]/15 flex items-center justify-center text-[#8A9A82]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              {dealVendors}{' '}
              <span className="text-sm font-sans font-normal text-stone-500">
                / {totalVendors} vendor
              </span>
            </span>
            <span className="text-xs text-[#8A9A82] font-medium">
              {totalVendors > 0
                ? `${Math.round((dealVendors / totalVendors) * 100)}% siap`
                : '0%'}
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Venue, Katering, MUA, Foto &amp; WO
          </p>
          <div className="flex items-center justify-between mt-3 text-xs text-[#8A9A82] font-medium group-hover:translate-x-0.5 transition-transform">
            <span>Bandingkan &amp; Kontak</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* QUICK SHORTCUT ACTIONS */}
      <section className="flex flex-wrap gap-2.5">
        <button
          onClick={() => onSelectTab('checklist')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1C1A] border border-[#8A9A82]/30 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-[#8A9A82]/10 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#8A9A82]" />
          Tambah Tugas
        </button>
        <button
          onClick={() => onSelectTab('budget')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1C1A] border border-[#8A9A82]/30 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-[#8A9A82]/10 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
          Catat Pengeluaran
        </button>
        <button
          onClick={() => onSelectTab('guests')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1C1A] border border-[#8A9A82]/30 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-[#8A9A82]/10 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#B57C76]" />
          Tambah Tamu
        </button>
        <button
          onClick={() => onSelectTab('rundown')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1C1A] border border-[#8A9A82]/30 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-[#8A9A82]/10 transition-colors shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          Lihat &amp; Cetak Rundown
        </button>
      </section>

      {/* TWO COLUMN GRID: TUGAS TERDEKAT + GRAFIK ANGGARAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TUGAS TERDEKAT (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#8A9A82]/15">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Tugas Terdekat
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  5 tugas prioritas yang perlu segera diselesaikan
                </p>
              </div>
              <button
                onClick={() => onSelectTab('checklist')}
                className="text-xs text-[#8A9A82] hover:underline font-semibold flex items-center gap-1"
              >
                Lihat Semua ({pendingChecklistCount(data.checklist)})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-2">
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#8A9A82] mb-2 opacity-60" />
                  Semua tugas terdekat sudah selesai! Hebat!
                </div>
              ) : (
                pendingTasks.map((task) => {
                  const priorityColors = {
                    tinggi: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                    sedang: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
                    rendah: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                  };

                  return (
                    <div
                      key={task.id}
                      className="py-3 flex items-start justify-between gap-3 group hover:bg-[#FBF8F3] dark:hover:bg-[#252220] px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleChecklistComplete(task.id)}
                          className="mt-0.5 w-5 h-5 rounded-md border-2 border-stone-300 dark:border-stone-600 hover:border-[#8A9A82] flex items-center justify-center transition-colors shrink-0"
                          title="Tandai selesai"
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4 text-[#8A9A82]" />}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-stone-800 dark:text-stone-200 leading-snug">
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#8A9A82]" />
                              Tenggat: {formatTanggalSingkat(task.dueDate)}
                            </span>
                            <span>•</span>
                            <span className="text-stone-600 dark:text-stone-400">
                              PIC: {task.assignee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>Centang kotak untuk menandai tugas selesai</span>
            <button
              onClick={() => onSelectTab('checklist')}
              className="text-[#8A9A82] font-medium hover:underline"
            >
              + Tambah tugas baru
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DONUT GRAFIK ANGGARAN (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E1C1A] rounded-2xl p-6 border border-[#8A9A82]/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#8A9A82]/15">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                  Komposisi Anggaran
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Proporsi pengeluaran per kategori
                </p>
              </div>
              <button
                onClick={() => onSelectTab('budget')}
                className="text-xs text-[#8A9A82] hover:underline font-semibold flex items-center gap-1"
              >
                Rincian
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {chartGrandTotal === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                Belum ada data anggaran yang dicatat
              </div>
            ) : (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                {/* SVG DONUT */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="stroke-stone-100 dark:stroke-stone-800"
                      strokeWidth="18"
                      fill="none"
                    />
                    {donutSegments.map((seg, i) => {
                      const strokeDasharray = `${(seg.percentage / 100) * 238.76} 238.76`;
                      const strokeDashoffset = -((seg.startAngle / 360) * 238.76);
                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="18"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="font-serif font-bold text-xs text-stone-900 dark:text-white max-w-[80px] truncate">
                      {formatRupiah(chartGrandTotal).replace('Rp ', '')}
                    </span>
                  </div>
                </div>

                {/* LEGEND LIST */}
                <div className="flex-1 w-full space-y-2">
                  {donutSegments.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-stone-700 dark:text-stone-300 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-stone-500 text-[11px]">{item.percentage}%</span>
                        <span className="font-medium text-stone-800 dark:text-stone-200 text-[11px]">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>Sudah Terbayar: {formatRupiah(totalPaid)}</span>
            <span className={isOverBudget ? 'text-rose-500 font-bold' : 'text-[#8A9A82] font-semibold'}>
              {isOverBudget ? 'Peringatan Over Budget!' : 'Anggaran Terkendali'}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFIL CEPAT */}
      <Modal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title="Ubah Data Pernikahan"
        subtitle="Sesuaikan nama pasangan, tanggal, dan lokasi acara"
      >
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Nama Lengkap Pria
              </label>
              <input
                type="text"
                value={editGroom}
                onChange={(e) => setEditGroom(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Nama Panggilan Pria
              </label>
              <input
                type="text"
                value={editGroomNick}
                onChange={(e) => setEditGroomNick(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Nama Lengkap Wanita
              </label>
              <input
                type="text"
                value={editBride}
                onChange={(e) => setEditBride(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Nama Panggilan Wanita
              </label>
              <input
                type="text"
                value={editBrideNick}
                onChange={(e) => setEditBrideNick(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Tanggal Hari-H
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Waktu Acara
              </label>
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                placeholder="08:00 WIB"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Nama Gedung / Lokasi Venue
            </label>
            <input
              type="text"
              value={editVenue}
              onChange={(e) => setEditVenue(e.target.value)}
              placeholder="Contoh: Sasana Kriya Ballroom"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Alamat Lengkap
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="Jl. Raya TMII, Jakarta Timur"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Motto / Pesan Indah
            </label>
            <input
              type="text"
              value={editMotto}
              onChange={(e) => setEditMotto(e.target.value)}
              placeholder="Meniti hari bahagia bersama..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#282522] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8A9A82]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A9A82] text-white text-sm font-semibold hover:bg-[#788870] shadow-sm transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function pendingChecklistCount(checklist: { completed: boolean }[]) {
  return checklist.filter((c) => !c.completed).length;
}
