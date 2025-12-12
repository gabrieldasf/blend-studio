import React, { useState } from 'react';
import { Settings } from './components/Settings';
import { TranscriberView } from './components/TranscriberView';
import { MockupGenerator } from './components/MockupGenerator';
import { 
    IconMicrophone, 
    IconSettings, 
    IconLayoutSidebarLeftCollapse,
    IconInfinity,
    IconShirt
} from '@tabler/icons-react';

type ViewState = 'transcriber' | 'mockup' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('transcriber');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Helper to close sidebar on mobile when navigating
  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-2 text-gray-12 font-sans overflow-hidden">
      
      {/* Navigation Drawer (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-gray-2 border-r border-gray-6 flex flex-col transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-14 px-3 flex items-center gap-2 border-b border-gray-4">
            <div className="h-6 w-6 rounded-sm bg-blue text-white flex items-center justify-center">
                <IconInfinity size={16} stroke={2.5} />
            </div>
            <span className="font-semibold text-sm text-gray-12 tracking-tight">Blend Studio</span>
            <button className="md:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)}>
                <IconLayoutSidebarLeftCollapse size={18} />
            </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-2 space-y-0.5">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-9 uppercase tracking-wider">
                Ferramentas
            </div>
            
            <button 
                onClick={() => navigateTo('transcriber')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm font-medium text-sm cursor-pointer transition-colors ${
                    currentView === 'transcriber' 
                    ? 'bg-gray-4 text-gray-12' 
                    : 'text-gray-9 hover:bg-gray-3 hover:text-gray-12'
                }`}
            >
                <IconMicrophone size={16} className={currentView === 'transcriber' ? 'text-gray-12' : 'text-gray-9'} />
                <span>Transcritor</span>
            </button>
            
            <button 
                onClick={() => navigateTo('mockup')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm font-medium text-sm cursor-pointer transition-colors ${
                    currentView === 'mockup' 
                    ? 'bg-gray-4 text-gray-12' 
                    : 'text-gray-9 hover:bg-gray-3 hover:text-gray-12'
                }`}
            >
                <IconShirt size={16} className={currentView === 'mockup' ? 'text-gray-12' : 'text-gray-9'} />
                <span>Mockups</span>
            </button>

            <div className="px-2 py-1.5 mt-4 text-xs font-semibold text-gray-9 uppercase tracking-wider">
                Sistema
            </div>

            <button 
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm font-medium text-sm cursor-pointer transition-colors ${
                    currentView === 'settings' 
                    ? 'bg-gray-4 text-gray-12' 
                    : 'text-gray-9 hover:bg-gray-3 hover:text-gray-12'
                }`}
            >
                <IconSettings size={16} className={currentView === 'settings' ? 'text-gray-12' : 'text-gray-9'} />
                <span>Configurações</span>
            </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-4">
            <a href="https://blendtc.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-9 hover:text-blue transition-colors">
                <IconInfinity size={16} />
                <span>Powered by Blend</span>
            </a>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Default Layout Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-2">
        
        {/* Page Header */}
        <header className="h-14 px-4 md:px-6 flex items-center gap-3 bg-gray-1 border-b border-gray-4 shrink-0">
            <button 
                className="md:hidden p-1 text-gray-9 -ml-2"
                onClick={() => setSidebarOpen(true)}
            >
                <IconLayoutSidebarLeftCollapse size={20} className="rotate-180" />
            </button>
            <h1 className="text-md font-medium text-gray-12">
                {currentView === 'transcriber' && 'Transcritor de Áudio'}
                {currentView === 'mockup' && 'Gerador de Mockups'}
                {currentView === 'settings' && 'Configurações'}
            </h1>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {currentView === 'transcriber' && <TranscriberView />}
                {currentView === 'mockup' && <MockupGenerator />}
                {currentView === 'settings' && <Settings />}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;