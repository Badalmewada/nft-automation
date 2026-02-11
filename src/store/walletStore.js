// src/store/walletStore.js
import { create } from 'zustand';

const useWalletStore = create((set, get) => ({
  // State
  wallets: [],
  groups: [],
  selectedWallets: [],
  selectedGroup: null,
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filterTags: [],
  
  // Stats
  stats: {
    total: 0,
    byGroup: {},
    byChain: {}
  },

  // Actions
  setWallets: (wallets) => set({ wallets }),
  
  setGroups: (groups) => set({ groups }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  setFilterTags: (tags) => set({ filterTags: tags }),
  
  setSelectedGroup: (groupId) => set({ selectedGroup: groupId }),

  // Wallet selection
  selectWallet: (walletId) => {
    const { selectedWallets } = get();
    if (!selectedWallets.includes(walletId)) {
      set({ selectedWallets: [...selectedWallets, walletId] });
    }
  },

  deselectWallet: (walletId) => {
    const { selectedWallets } = get();
    set({ selectedWallets: selectedWallets.filter(id => id !== walletId) });
  },

  toggleWalletSelection: (walletId) => {
    const { selectedWallets } = get();
    if (selectedWallets.includes(walletId)) {
      get().deselectWallet(walletId);
    } else {
      get().selectWallet(walletId);
    }
  },

  selectAllWallets: () => {
    const { wallets } = get();
    set({ selectedWallets: wallets.map(w => w.id) });
  },

  clearSelection: () => set({ selectedWallets: [] }),

  // Add wallet
  addWallet: (wallet) => {
    const { wallets } = get();
    set({ wallets: [...wallets, wallet] });
    get().updateStats();
  },

  addWallets: (newWallets) => {
    const { wallets } = get();
    set({ wallets: [...wallets, ...newWallets] });
    get().updateStats();
  },

  // Update wallet
  updateWallet: (walletId, updates) => {
    const { wallets } = get();
    set({
      wallets: wallets.map(w => 
        w.id === walletId ? { ...w, ...updates } : w
      )
    });
    get().updateStats();
  },

  // Remove wallet
  removeWallet: (walletId) => {
    const { wallets, selectedWallets } = get();
    set({
      wallets: wallets.filter(w => w.id !== walletId),
      selectedWallets: selectedWallets.filter(id => id !== walletId)
    });
    get().updateStats();
  },

  removeWallets: (walletIds) => {
    const { wallets, selectedWallets } = get();
    const idsSet = new Set(walletIds);
    set({
      wallets: wallets.filter(w => !idsSet.has(w.id)),
      selectedWallets: selectedWallets.filter(id => !idsSet.has(id))
    });
    get().updateStats();
  },

  // Group management
  addGroup: (group) => {
    const { groups } = get();
    set({ groups: [...groups, group] });
  },

  updateGroup: (groupId, updates) => {
    const { groups } = get();
    set({
      groups: groups.map(g => 
        g.id === groupId ? { ...g, ...updates } : g
      )
    });
  },

  removeGroup: (groupId) => {
    const { groups, wallets } = get();
    set({
      groups: groups.filter(g => g.id !== groupId),
      // Unassign wallets from this group
      wallets: wallets.map(w => 
        w.groupId === groupId ? { ...w, groupId: null } : w
      )
    });
    get().updateStats();
  },

  // Filtered wallets
  getFilteredWallets: () => {
    const { wallets, searchQuery, selectedGroup, filterTags, sortBy, sortOrder } = get();
    
    let filtered = [...wallets];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(query) ||
        w.address.toLowerCase().includes(query) ||
        w.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by group
    if (selectedGroup) {
      filtered = filtered.filter(w => w.groupId === selectedGroup);
    }

    // Filter by tags
    if (filterTags.length > 0) {
      filtered = filtered.filter(w => 
        filterTags.every(tag => w.tags?.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'lastUsed') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  },

  // Get wallets by group
  getWalletsByGroup: (groupId) => {
    const { wallets } = get();
    return wallets.filter(w => w.groupId === groupId);
  },

  // Get selected wallet objects
  getSelectedWalletObjects: () => {
    const { wallets, selectedWallets } = get();
    return wallets.filter(w => selectedWallets.includes(w.id));
  },

  // Update stats
  updateStats: () => {
    const { wallets } = get();
    
    const stats = {
      total: wallets.length,
      byGroup: {},
      byChain: {}
    };

    wallets.forEach(wallet => {
      // Count by group
      const groupId = wallet.groupId || 'ungrouped';
      stats.byGroup[groupId] = (stats.byGroup[groupId] || 0) + 1;
    });

    set({ stats });
  },

  // Get all unique tags
  getAllTags: () => {
    const { wallets } = get();
    const tagsSet = new Set();
    wallets.forEach(w => {
      w.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  },

  // Reset store
  reset: () => set({
    wallets: [],
    groups: [],
    selectedWallets: [],
    selectedGroup: null,
    loading: false,
    error: null,
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filterTags: [],
    stats: {
      total: 0,
      byGroup: {},
      byChain: {}
    }
  })
}));

export default useWalletStore;