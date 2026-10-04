import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  WalletCards,
  Users,
  Menu,
  Store,
  Clock,
  Grid3X3,
  Sparkles,
  Settings,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useWedding } from '../../context/WeddingContext';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const { data, toggleDarkMode } = useWedding();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checklist' as NavTab, label: 'Checklist', icon: CheckSquare },
    { id: 'budget' as NavTab, label: 'Anggaran', icon: WalletCards },
    { id: 'guests' as NavTab, label: 'Tamu', icon: Users },
  ];

  const moreTabs = [
    { id: 'vendors' as NavTab, label: 'Vendor Pernikahan', icon: Store, desc: 'Kelola & bandingkan vendor' },
    { id: 'rundown' as NavTab, label: 'Susunan Acara (Rundown)', icon: Clock, desc: 'Jadwal hari-H & cetak PDF' },
    { id: 'seating' as NavTab, label: 'Denah Meja (Seating)', icon: Grid3X3, desc: 'Atur penempatan meja tamu' },
    { id: 'inspiration' as NavTab, label: 'Inspirasi & Catatan', icon: Sparkles, desc: 'Moodboard, palet & catatan' },
    { id: 'settings' as NavTab, label: 'Pengaturan & Cadangan', icon: Settings, desc: 'Profil pengantin & backup JSON' },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === currentTab);

  return (
    <>
      {/* Backdrop for More Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer for More Modules */}
      <div
        className={`fixed inset-x-0 bottom-16 z-40 bg-white dark:bg-[#1E1C1A] border-t border-[#8A9A82]/20 rounded-t-3xl shadow-2xl p-5 lg:hidden transition-transform duration-300 transform ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
            Menu Lainnya
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
              aria-label="Toggle tema"
            >
              {data.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-3">
          {moreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setDrawerOpen(false);
                }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl text-left transition-colors ${
                  isActive
                    ? 'bg-[#8A9A82] text-white shadow-sm'
                    : 'bg-stone-50 dark:bg-[#282522] text-stone-800 dark:text-stone-200 hover:bg-[#8A9A82]/10'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#8A9A82]/15 text-[#8A9A82]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm leading-none">{tab.label}</p>
                  <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="no-print fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1E1C1A]/95 backdrop-blur-md border-t border-[#8A9A82]/20 lg:hidden px-2 py-1 shadow-lg flex items-center justify-around h-16">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                setDrawerOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive
                  ? 'text-[#8A9A82] font-semibold scale-105'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isMoreActive || drawerOpen
              ? 'text-[#8A9A82] font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Lainnya</span>
        </button>
      </nav>
    </>
  );
};
