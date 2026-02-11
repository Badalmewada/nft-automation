// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/common/Toast';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Import all modules
import Dashboard from './components/dashboard/Dashboard';
import WalletsModule from './components/wallets/WalletsModule';
import TasksModule from './components/tasks/TasksModule';
import RPCModule from './components/rpc/RPCModule';
import ProxiesModule from './components/proxies/ProxiesModule';
import NFTToolsModule from './components/nft-tools/NFTToolsModule';
import CaptchaModule from './components/captcha/CaptchaModule';
import SettingsModule from './components/settings/SettingsModule';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [stats, setStats] = useState({
    totalWallets: 0,
    activeTasks: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    // Load initial data
    loadAppData();

    // Set up listeners for stats updates
    const statsInterval = setInterval(loadStats, 5000);

    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const loadAppData = async () => {
    try {
      await loadStats();
      checkConnection();
    } catch (error) {
      console.error('Failed to load app data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await window.electron.invoke('app:getStats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const checkConnection = async () => {
    try {
      const status = await window.electron.invoke('app:checkConnection');
      setConnectionStatus(status ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'wallets':
        return <WalletsModule />;
      case 'tasks':
        return <TasksModule />;
      case 'rpc':
        return <RPCModule />;
      case 'proxies':
        return <ProxiesModule />;
      case 'nft-tools':
        return <NFTToolsModule />;
      case 'captcha':
        return <CaptchaModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {renderActiveModule()}
          </main>
        </div>

        {/* Footer */}
        <Footer connectionStatus={connectionStatus} stats={stats} />
      </div>
    </ToastProvider>
  );
}

export default App;