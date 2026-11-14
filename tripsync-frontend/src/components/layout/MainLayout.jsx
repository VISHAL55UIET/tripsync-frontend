import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

export default function MainLayout() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-x-hidden">
      {/* Subtle Top Ambient Glow */}
      <div className="pointer-events-none fixed inset-x-0 -top-40 h-80 bg-gradient-to-b from-indigo-950/30 to-transparent blur-3xl" />

      <Navbar />
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}