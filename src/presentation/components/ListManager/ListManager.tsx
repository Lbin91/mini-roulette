import React, { useState, useRef, useEffect } from 'react';
import { useRouletteStore } from '../../../application/store/useRouletteStore';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { exportListToCSV, parseCSV } from '../../../infrastructure/file/csvHelper';
import { FaTrash, FaPlus, FaFileExport, FaFileImport, FaEdit, FaCheck } from 'react-icons/fa';

export const ListManager: React.FC = () => {
  const {
    lists,
    settings,
    addList,
    deleteList,
    selectList,
    updateList,
    addItemToList,
    removeItemFromList
  } = useRouletteStore();

  const [newListName, setNewListName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedList = lists.find(l => l.id === settings.selectedListId) || lists[0];

  // Auto-select first list if none selected but lists exist
  useEffect(() => {
    if (!settings.selectedListId && lists.length > 0) {
      selectList(lists[0].id);
    }
  }, [lists, settings.selectedListId, selectList]);

  const handleAddList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: crypto.randomUUID(),
      name: newListName,
      items: []
    };
    addList(newList);
    selectList(newList.id);
    setNewListName('');
  };

  const handleDeleteList = (id: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      deleteList(id);
    }
  };

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedList || !newItemText.trim()) return;
    addItemToList(selectedList.id, {
      id: crypto.randomUUID(),
      text: newItemText
    });
    setNewItemText('');
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const items = await parseCSV(file);
      const newList = {
        id: crypto.randomUUID(),
        name: file.name.replace('.csv', ''),
        items: items.map(text => ({ id: crypto.randomUUID(), text }))
      };
      addList(newList);
      selectList(newList.id);
    } catch (error) {
      alert('Failed to parse CSV');
      console.error(error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- New Features Logic ---
  const { setWholeData } = useRouletteStore();
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleGlobalExport = () => {
    import('../../../infrastructure/file/jsonHelper').then(({ exportDataToJSON }) => {
      // Export current state
      exportDataToJSON({ lists, settings });
    });
  };

  const handleGlobalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('This will overwrite all current lists and settings. Are you sure?')) {
      if (globalFileInputRef.current) globalFileInputRef.current.value = '';
      return;
    }

    import('../../../infrastructure/file/jsonHelper').then(({ parseJSON }) => {
      parseJSON(file).then(data => {
        setWholeData(data);
        alert('Data restored successfully!');
      }).catch(err => {
        alert('Failed to import data: ' + err.message);
      });
    });

    if (globalFileInputRef.current) globalFileInputRef.current.value = '';
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim() || !selectedList) return;

    const lines = bulkText.split(/\n/);
    let count = 0;

    lines.forEach(line => {
      const text = line.trim();
      if (text) {
        addItemToList(selectedList.id, {
          id: crypto.randomUUID(),
          text: text
        });
        count++;
      }
    });

    setBulkText('');
    setShowBulkModal(false);
    // Optional: alert(`Added ${count} items.`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>List Management</span>
        </h2>
        {/* Global Actions */}
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={globalFileInputRef}
            onChange={handleGlobalImport}
          />
          <Button variant="ghost" size="sm" onClick={handleGlobalExport} title="Backup All Data">
            <FaFileExport /> Backup
          </Button>
          <Button variant="ghost" size="sm" onClick={() => globalFileInputRef.current?.click()} title="Restore Data">
            <FaFileImport /> Restore
          </Button>
        </div>
      </div>

      {/* List Selector & Actions */}
      <div className="flex gap-2 mb-6">
        <select
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-700"
          value={selectedList?.id || ''}
          onChange={(e) => selectList(e.target.value)}
        >
          {lists.length === 0 && <option value="">No lists created</option>}
          {lists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>

        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImportCSV}
        />

        <Button variant="ghost" size="md" onClick={() => fileInputRef.current?.click()} title="Import CSV List" className="border">
          <span className="text-xs">CSV</span> <FaFileImport />
        </Button>
      </div>

      {/* Create New List */}
      <div className="flex gap-2 mb-6 border-b pb-6">
        <Input
          placeholder="New List Name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
        />
        <Button onClick={handleAddList} disabled={!newListName.trim()}>Create</Button>
      </div>

      {selectedList ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* List Title Actions */}
          <div className="flex items-center justify-between mb-4 h-10">
            {isEditingTitle ? (
              <div className="flex gap-2 flex-1 mr-2">
                <Input
                  autoFocus
                  value={editTitleText}
                  onChange={(e) => setEditTitleText(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateList({ ...selectedList, name: editTitleText });
                      setIsEditingTitle(false);
                    }
                  }}
                />
                <Button size="sm" onClick={() => {
                  updateList({ ...selectedList, name: editTitleText });
                  setIsEditingTitle(false);
                }}><FaCheck /></Button>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-gray-700 truncate flex-1 flex items-center gap-2">
                {selectedList.name}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{selectedList.items.length}</span>
              </h3>
            )}

            <div className="flex gap-1">
              {!isEditingTitle && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditTitleText(selectedList.name);
                  setIsEditingTitle(true);
                }}>
                  <FaEdit />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => exportListToCSV(selectedList)} title="Export CSV">
                <FaFileExport /> CSV
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteList(selectedList.id)} title="Delete List">
                <FaTrash />
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 p-2 mb-4 space-y-2">
            {selectedList.items.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm group hover:shadow-md transition-shadow">
                <span className="truncate flex-1 text-gray-700">{item.text}</span>
                <button
                  onClick={() => removeItemFromList(selectedList.id, item.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2 focus:opacity-100"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
            {selectedList.items.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <p>No items in this list.</p>
                <p>Add items below!</p>
              </div>
            )}
          </div>

          {/* Add Item */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder="Add item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={!newItemText.trim()}>
              <FaPlus />
            </Button>
            <Button type="button" variant="ghost" className="border" onClick={() => setShowBulkModal(true)} title="Bulk Add">
              Many...
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select or create a list to start.
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-xl p-6 flex flex-col animate-fadeIn">
          <h3 className="text-lg font-bold mb-2">Bulk Add Items</h3>
          <p className="text-sm text-gray-500 mb-4">Paste items below, one per line.</p>
          <textarea
            className="flex-1 w-full bg-gray-50 border rounded-lg p-4 focus:ring-2 focus:ring-orange-500 outline-none resize-none mb-4"
            placeholder={"Apple\nBanana\nCherry..."}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowBulkModal(false)}>Cancel</Button>
            <Button onClick={handleBulkAdd} disabled={!bulkText.trim()}>Add All</Button>
          </div>
        </div>
      )}
    </div>
  );
};
