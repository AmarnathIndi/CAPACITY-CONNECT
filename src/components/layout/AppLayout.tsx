import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopGovBar } from './TopGovBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OfflineSyncBanner } from '../common/OfflineSyncBanner';
import { AICourseAssistant } from '../common/AICourseAssistant';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopGovBar />
      <Navbar />
      <OfflineSyncBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <AICourseAssistant />
      <Footer />
    </div>
  );
};
