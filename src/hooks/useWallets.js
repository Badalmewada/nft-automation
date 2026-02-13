// src/hooks/useWallets.js
import { useEffect, useCallback } from 'react';
import useWalletStore from '../store/walletStore';

const useWallets = () => {
  const store = useWalletStore();

  // Load wallets on mount
  useEffect(() => {
    loadWallets();
    loadGroups();
  }, []);

  // Load all wallets from backend
  const loadWallets = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    
    try {
      const wallets = await window.electron.invoke('wallet:getAll');
      store.setWallets(wallets);
      store.updateStats();
    } catch (error) {
      store.setError(error.message);
      console.error('Failed to load wallets:', error);
    } finally {
      store.setLoading(false);
    }
  }, []);

  // Load wallet groups
  const loadGroups = useCallback(async () => {
    try {
      const groups = await window.electron.invoke('wallet:getGroups');
      store.setGroups(groups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, []);

  // Create a new wallet
  const createWallet = useCallback(async (options = {}) => {
  try {
    const groupId = store.selectedGroup;

    const wallet = await window.electron.invoke('wallet:create', {
      ...options,
      groupId: groupId === "ungrouped" ? null : groupId
    });

    store.addWallet(wallet);
    return wallet;
  } catch (error) {
    store.setError(error.message);
    throw error;
  }
}, []);


  // Create multiple wallets
 const createBulkWallets = useCallback(async (count, options = {}) => {
  store.setLoading(true);
  try {
    const groupId = store.selectedGroup;

    const wallets = await window.electron.invoke('wallet:createBulk', {
      count,
      options: {
        ...options,
        groupId: groupId === "ungrouped" ? null : groupId
      }
    });

    store.addWallets(wallets);
    return wallets;
  } catch (error) {
    store.setError(error.message);
    throw error;
  } finally {
    store.setLoading(false);
  }
}, []);


  // Import wallet from private key
  const importFromPrivateKey = useCallback(async (privateKey, options = {}) => {
    try {
      const wallet = await window.electron.invoke('wallet:importPrivateKey', { 
        privateKey, 
        options 
      });
      store.addWallet(wallet);
      return wallet;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Import wallet from mnemonic
  const importFromMnemonic = useCallback(async (mnemonic, options = {}) => {
    try {
      const wallet = await window.electron.invoke('wallet:importMnemonic', { 
        mnemonic, 
        options 
      });
      store.addWallet(wallet);
      return wallet;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Import multiple wallets from mnemonic
  const importMultipleFromMnemonic = useCallback(async (mnemonic, count, options = {}) => {
    store.setLoading(true);
    try {
      const wallets = await window.electron.invoke('wallet:importMultipleMnemonic', { 
        mnemonic, 
        count, 
        options 
      });
      store.addWallets(wallets);
      return wallets;
    } catch (error) {
      store.setError(error.message);
      throw error;
    } finally {
      store.setLoading(false);
    }
  }, []);

  // Import from JSON keystore
  const importFromJSON = useCallback(async (json, password, options = {}) => {
    try {
      const wallet = await window.electron.invoke('wallet:importJSON', { 
        json, 
        password, 
        options 
      });
      store.addWallet(wallet);
      return wallet;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Update wallet
  const updateWallet = useCallback(async (walletId, updates) => {
    try {
      const updated = await window.electron.invoke('wallet:update', { 
        walletId, 
        updates 
      });
      store.updateWallet(walletId, updated);
      return updated;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Delete wallet
  const deleteWallet = useCallback(async (walletId) => {
    try {
      await window.electron.invoke('wallet:delete', { walletId });
      store.removeWallet(walletId);
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Delete multiple wallets
  const deleteWallets = useCallback(async (walletIds) => {
    try {
      await window.electron.invoke('wallet:deleteMany', { walletIds });
      store.removeWallets(walletIds);
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Export wallet
  const exportWallet = useCallback(async (walletId, password) => {
    try {
      const encrypted = await window.electron.invoke('wallet:export', { 
        walletId, 
        password 
      });
      return encrypted;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Create group
  const createGroup = useCallback(async (groupData) => {
    try {
      const group = await window.electron.invoke('wallet:createGroup', groupData);
      store.addGroup(group);
      return group;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Update group
  const updateGroup = useCallback(async (groupId, updates) => {
  try {
    const updated = await window.electron.invoke('wallet:updateGroup', { 
      id: groupId,
      ...updates
    });
      store.updateGroup(groupId, updated);
      return updated;
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Delete group
  const deleteGroup = useCallback(async (groupId) => {
    try {
      await window.electron.invoke('wallet:deleteGroup', { groupId });
      store.removeGroup(groupId);
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Assign wallets to group
  const assignToGroup = useCallback(async (walletIds, groupId) => {
    try {
      await window.electron.invoke('wallet:assignToGroup', { 
        walletIds, 
        groupId 
      });
      
      walletIds.forEach(walletId => {
        store.updateWallet(walletId, { groupId });
      });
    } catch (error) {
      store.setError(error.message);
      throw error;
    }
  }, []);

  // Validate private key
  const validatePrivateKey = useCallback(async (privateKey) => {
    try {
      return await window.electron.invoke('wallet:validatePrivateKey', { privateKey });
    } catch (error) {
      return false;
    }
  }, []);

  // Validate mnemonic
  const validateMnemonic = useCallback(async (mnemonic) => {
    try {
      return await window.electron.invoke('wallet:validateMnemonic', { mnemonic });
    } catch (error) {
      return false;
    }
  }, []);

  return {
    // State
    wallets: store.wallets,
    groups: store.groups,
    selectedWallets: store.selectedWallets,
    selectedGroup: store.selectedGroup,
    loading: store.loading,
    error: store.error,
    searchQuery: store.searchQuery,
    sortBy: store.sortBy,
    sortOrder: store.sortOrder,
    filterTags: store.filterTags,
    stats: store.stats,

    // Getters
    filteredWallets: store.getFilteredWallets,
    selectedWalletObjects: store.getSelectedWalletObjects(),
    allTags: store.getAllTags(),

    // Actions
    loadWallets,
    loadGroups,
    createWallet,
    createBulkWallets,
    importFromPrivateKey,
    importFromMnemonic,
    importMultipleFromMnemonic,
    importFromJSON,
    updateWallet,
    deleteWallet,
    deleteWallets,
    exportWallet,
    createGroup,
    updateGroup,
    deleteGroup,
    assignToGroup,
    validatePrivateKey,
    validateMnemonic,

    // Selection
    selectWallet: store.selectWallet,
    deselectWallet: store.deselectWallet,
    toggleWalletSelection: store.toggleWalletSelection,
    selectAllWallets: store.selectAllWallets,
    clearSelection: store.clearSelection,

    // Filters
    setSearchQuery: store.setSearchQuery,
    setSortBy: store.setSortBy,
    setSortOrder: store.setSortOrder,
    setFilterTags: store.setFilterTags,
    setSelectedGroup: store.setSelectedGroup,
    setError: store.setError
  };
};

export default useWallets;