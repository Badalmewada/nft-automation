// src/components/wallets/WalletGroupManager.jsx
import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Users,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import useWallets from '../../hooks/useWallets';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import Dropdown from '../common/Dropdown';

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#14B8A6', label: 'Teal' }
];

const ICON_OPTIONS = [
  { value: 'folder', label: 'Folder' },
  { value: 'users', label: 'Users' },
  { value: 'star', label: 'Star' },
  { value: 'target', label: 'Target' },
  { value: 'zap', label: 'Zap' },
  { value: 'shield', label: 'Shield' }
];

const WalletGroupManager = () => {
  const {
    groups,
    wallets,
    selectedGroup,
    setSelectedGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    stats,
    loading
  } = useWallets();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      await deleteGroup(groupToDelete.id);
      setDeleteConfirmOpen(false);
      setGroupToDelete(null);
      if (selectedGroup === groupToDelete.id) {
        setSelectedGroup(null);
      }
    }
  };

  const ungroupedCount = stats.byGroup['ungrouped'] || 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Groups
          </h2>
          <Button
            size="sm"
            onClick={handleCreateGroup}
            className="flex items-center gap-1"
          >
            <FolderPlus size={16} />
            New
          </Button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {groups.length} groups • {stats.total} wallets
        </div>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        {/* All Wallets */}
        <GroupItem
          group={{
            id: null,
            name: 'All Wallets',
            color: '#6B7280',
            icon: 'folder',
            isDefault: true
          }}
          count={stats.total}
          selected={selectedGroup === null}
          onClick={() => setSelectedGroup(null)}
        />

        {/* Ungrouped */}
        {ungroupedCount > 0 && (
          <GroupItem
            group={{
              id: 'ungrouped',
              name: 'Ungrouped',
              color: '#9CA3AF',
              icon: 'folder',
              isDefault: true
            }}
            count={ungroupedCount}
            selected={selectedGroup === 'ungrouped'}
            onClick={() => setSelectedGroup('ungrouped')}
          />
        )}

        {/* Custom groups */}
        {groups.map(group => (
          <GroupItem
            key={group.id}
            group={group}
            count={stats.byGroup[group.id] || 0}
            selected={selectedGroup === group.id}
            onClick={() => setSelectedGroup(group.id)}
            onEdit={() => handleEditGroup(group)}
            onDelete={() => handleDeleteGroup(group)}
          />
        ))}

        {groups.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Folder size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs mt-1">Create groups to organize your wallets</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <GroupFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createGroup}
        title="Create Group"
      />

      {/* Edit Group Modal */}
      <GroupFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGroup(null);
        }}
        onSave={(data) => updateGroup(editingGroup.id, data)}
        title="Edit Group"
        initialData={editingGroup}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Group"
        message={`Are you sure you want to delete "${groupToDelete?.name}"? Wallets will not be deleted, only ungrouped.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

// Group Item Component
const GroupItem = ({ group, count, selected, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`
        relative px-4 py-3 cursor-pointer transition-colors
        ${selected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Color indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: group.color }}
          />
          
          {/* Group name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {group.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {count}
              </span>
            </div>
            {group.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {group.description}
              </p>
            )}
          </div>

          {/* Actions menu */}
          {!group.isDefault && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Group Form Modal
const GroupFormModal = ({ isOpen, onClose, onSave, title, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    color: initialData?.color || '#3B82F6',
    icon: initialData?.icon || 'folder'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        metadata: {
          createdAt: initialData?.metadata?.createdAt || Date.now(),
          updatedAt: Date.now()
        }
      });
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'folder'
    });
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <Input
          label="Group Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Main Wallets"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add a description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, color: option.value })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  formData.color === option.value
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: option.value }}
                title={option.label}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {initialData ? 'Update' : 'Create'} Group
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WalletGroupManager;