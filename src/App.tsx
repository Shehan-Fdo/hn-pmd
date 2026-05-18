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
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (tab !== 'product-form') {
      setEditingProductId(null);
    }
  };

  const handleEditProduct = (id: number) => {
    setEditingProductId(id);
    setActiveTab('product-form');
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={handleTabChange} />;
      case 'products':
        return <ProductsList setActiveTab={handleTabChange} onEditProduct={handleEditProduct} />;
      case 'product-form':
        return <ProductForm setActiveTab={handleTabChange} editingProductId={editingProductId} />;
      case 'categories':
        return <CategoriesManager />;
      default:
        return <Overview setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-neutral-100 min-h-screen text-slate-900">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#0f0f0f] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="font-black text-[#0f0f0f] text-xs tracking-widest">H</span>
          </div>
          <span className="font-semibold text-white tracking-wide text-sm">HN Store</span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
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
