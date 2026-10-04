import React from 'react';
import { Heart, Calendar, MapPin, Sparkles, Moon, Sun } from 'lucide-react';
import { useWedding } from '../../context/WeddingContext';
import { formatTanggalIndonesia, calculateCountdown } from '../../utils/formatters';
import { NavTab } from './Sidebar';

interface NavbarProps {
  onOpenSettings: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onSelectTab }) => {
  const { data, toggleDarkMode } = useWedding();
  const countdown = calculateCountdown(data.couple.weddingDate, data.couple.weddingTime);

  return (
    <header className="no-print bg-white/80 dark:bg-[#1E1C1A]/80 backdrop-blur-md border-b border-[#8A9A82]/15 sticky top-0 z-20 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Title or Desktop Couple Summary */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-9 h-9 rounded-full bg-[#8A9A82]/15 dark:bg-[#8A9A82]/25 flex items-center justify-center text-[#8A9A82]">
            <Heart className="w-4 h-4 fill-[#8A9A82]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2E2A27] dark:text-[#FBF8F3]">
                {data.couple.groomNickname || 'Pengantin Pria'} & {data.couple.brideNickname || 'Pengantin Wanita'}
              </h2>
              <button
                onClick={onOpenSettings}
                className="text-xs text-[#8A9A82] hover:underline hidden sm:inline-flex items-center gap-1 font-medium"
                title="Ubah profil pernikahan"
              >
                (Ubah)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
              {data.couple.weddingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8A9A82]" />
                  {formatTanggalIndonesia(data.couple.weddingDate)}
                </span>
              )}
              {data.couple.venueName && (
                <span className="hidden md:flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-[#8A9A82]" />
                  <span className="truncate">{data.couple.venueName}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Countdown badge & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {data.couple.weddingDate && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8A9A82]/10 dark:bg-[#8A9A82]/20 border border-[#8A9A82]/20 text-[#5A6953] dark:text-[#A4B59C] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>
                {countdown.isPast
                  ? 'Hari Bahagia Tercapai!'
                  : `${countdown.days} Hari Menuju Akad`}
              </span>
            </div>
          )}

          <button
            onClick={() => onSelectTab('rundown')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors"
          >
            Rundown Hari-H
          </button>

          <button
            onClick={toggleDarkMode}
            className="hidden lg:flex p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Toggle tema gelap/terang"
            aria-label="Toggle tema gelap/terang"
          >
            {data.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
