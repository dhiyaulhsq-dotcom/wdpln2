/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeddingProvider } from './context/WeddingContext';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChecklistView } from './components/checklist/ChecklistView';
import { BudgetView } from './components/budget/BudgetView';
import { GuestListView } from './components/guests/GuestListView';
import { VendorView } from './components/vendors/VendorView';
import { RundownView } from './components/rundown/RundownView';
import { SeatingChartView } from './components/seating/SeatingChartView';
import { InspirationView } from './components/inspiration/InspirationView';
import { SettingsView } from './components/settings/SettingsView';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-[#FBF8F3] dark:bg-[#141210] text-[#2E2A27] dark:text-[#f3eee7] flex flex-col lg:flex-row transition-colors selection:bg-[#8A9A82]/30">
      {/* Desktop Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Navbar */}
        <Navbar
          onOpenSettings={() => setCurrentTab('settings')}
          onSelectTab={setCurrentTab}
        />

        {/* Dynamic Module View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
          {currentTab === 'dashboard' && (
            <DashboardView onSelectTab={setCurrentTab} />
          )}
          {currentTab === 'checklist' && <ChecklistView />}
          {currentTab === 'budget' && <BudgetView />}
          {currentTab === 'guests' && <GuestListView />}
          {currentTab === 'vendors' && <VendorView />}
          {currentTab === 'rundown' && <RundownView />}
          {currentTab === 'seating' && <SeatingChartView />}
          {currentTab === 'inspiration' && <InspirationView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Floating Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WeddingProvider>
      <MainApp />
    </WeddingProvider>
  );
}
