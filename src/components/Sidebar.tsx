import React from 'react';
import { LayoutDashboard, ShoppingBag, FolderOpen, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-56 flex flex-col bg-[#0f0f0f]
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="font-black text-[#0f0f0f] text-xs tracking-widest">H</span>
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">HN Store</span>
        </div>

        <button
          onClick={onClose}
          className="md:hidden text-neutral-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'products' && activeTab === 'product-form');

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'
                }
              `}
            >
              <Icon
                size={16}
                className={isActive ? 'text-white' : 'text-neutral-600'}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] font-bold tracking-widest">
            AD
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-300">Administrator</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
