// src/components/layout/Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  Server, 
  Shield, 
  Image,
  Bot,
  Settings
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'wallets', label: 'Wallets', icon: Wallet, path: '/wallets' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'rpc', label: 'RPC Nodes', icon: Server, path: '/rpc' },
  { id: 'proxies', label: 'Proxies', icon: Shield, path: '/proxies' },
  { id: 'nft-tools', label: 'NFT Tools', icon: Image, path: '/nft-tools' },
  { id: 'captcha', label: 'Captcha', icon: Bot, path: '/captcha' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all font-medium text-sm
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Premium
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;