import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  WalletCards,
  Users,
  Store,
  Clock,
  Grid3X3,
  Sparkles,
  Settings,
  Heart,
  Moon,
  Sun,
} from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { calculateCountdown } from '../../utils/formatters';

export type NavTab =
  | 'dashboard'
  | 'checklist'
  | 'budget'
  | 'guests'
  | 'vendors'
  | 'rundown'
  | 'seating'
  | 'inspiration'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { data, toggleDarkMode } = useWedding();

  const countdown = calculateCountdown(data.couple.weddingDate, data.couple.weddingTime);

  const pendingChecklist = data.checklist.filter((i) => !i.completed).length;
  const guestCount = data.guests.reduce((sum, g) => sum + g.pax, 0);

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'checklist' as NavTab,
      label: 'Checklist & Timeline',
      icon: CheckSquare,
      badge: pendingChecklist > 0 ? pendingChecklist : null,
    },
    {
      id: 'budget' as NavTab,
      label: 'Anggaran (Budget)',
      icon: WalletCards,
      badge: null,
    },
    {
      id: 'guests' as NavTab,
      label: 'Daftar Tamu & RSVP',
      icon: Users,
      badge: guestCount > 0 ? `${guestCount} pax` : null,
    },
    {
      id: 'vendors' as NavTab,
      label: 'Vendor',
      icon: Store,
      badge: data.vendors.length > 0 ? data.vendors.length : null,
    },
    {
      id: 'rundown' as NavTab,
      label: 'Susunan Acara (Rundown)',
      icon: Clock,
      badge: data.rundown.length > 0 ? data.rundown.length : null,
    },
    {
      id: 'seating' as NavTab,
      label: 'Denah Meja (Seating)',
      icon: Grid3X3,
      badge: data.tables.length > 0 ? data.tables.length : null,
    },
    {
      id: 'inspiration' as NavTab,
      label: 'Inspirasi & Catatan',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="no-print hidden lg:flex flex-col w-64 bg-white dark:bg-[#1E1C1A] border-r border-[#8A9A82]/20 h-screen sticky top-0 shrink-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#8A9A82]/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8A9A82]/15 dark:bg-[#8A9A82]/25 flex items-center justify-center text-[#8A9A82] ring-2 ring-[#8A9A82]/30">
            <Heart className="w-5 h-5 fill-[#8A9A82]" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-[#2E2A27] dark:text-[#FBF8F3]">
              Mahligai
            </h1>
            <p className="text-[11px] uppercase tracking-wider text-[#8A9A82] font-semibold">
              Wedding Planner
            </p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors"
          title={data.darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          aria-label="Toggle dark mode"
        >
          {data.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Couple mini widget */}
      <div className="px-5 py-4 mx-4 mt-4 rounded-xl bg-[#F0F4EF] dark:bg-[#282522] border border-[#8A9A82]/20">
        <p className="text-[11px] font-medium text-[#8A9A82] uppercase tracking-wider">
          Pasangan Mempelai
        </p>
        <p className="font-serif font-semibold text-sm text-[#2E2A27] dark:text-[#FBF8F3] truncate mt-0.5">
          {data.couple.groomNickname || 'Pengantin'} & {data.couple.brideNickname || 'Pengantin'}
        </p>
        <div className="mt-2 pt-2 border-t border-[#8A9A82]/15 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <span>Menuju Hari-H</span>
          <span className="font-bold text-[#8A9A82] dark:text-[#A4B59C]">
            {countdown.isPast ? 'Hari Bahagia' : `${countdown.days} hari lagi`}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#8A9A82] text-white shadow-sm shadow-[#8A9A82]/30 font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8A9A82]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#8A9A82]/15 text-center">
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          Mahligai • Perencana Pernikahan
        </p>
      </div>
    </aside>
  );
};
