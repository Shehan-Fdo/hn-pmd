import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { ProductsList } from './pages/ProductsList';
import { ProductForm } from './pages/ProductForm';
import { CategoriesManager } from './pages/CategoriesManager';
import { Menu } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={handleTabChange} />;
      case 'products':
        return <ProductsList setActiveTab={handleTabChange} />;
      case 'product-form':
        return <ProductForm setActiveTab={handleTabChange} />;
      case 'categories':
        return <CategoriesManager />;
      default:
        return <Overview setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-screen text-slate-900">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="font-bold text-white text-xs tracking-wider">H</span>
          </div>
          <span className="font-bold text-slate-900 tracking-wide text-sm">HN Store</span>
        </div>
        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/25 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content body */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto py-2 md:py-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
