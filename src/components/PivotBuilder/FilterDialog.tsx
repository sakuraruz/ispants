import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Filter as FilterType } from '../../types';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterType[]) => void;
  columns: Array<{ id: string; name: string; type: string }>;
  initialFilters: FilterType[];
}

const operators = [
  { value: 'eq', label: 'Равно' },
  { value: 'neq', label: 'Не равно' },
  { value: 'gt', label: 'Больше' },
  { value: 'gte', label: 'Больше или равно' },
  { value: 'lt', label: 'Меньше' },
  { value: 'lte', label: 'Меньше или равно' },
  { value: 'contains', label: 'Содержит' },
  { value: 'between', label: 'Между' }
];

export function FilterDialog({ isOpen, onClose, onApply, columns, initialFilters }: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterType[]>(initialFilters.length > 0 ? initialFilters : [{
    field: columns[0]?.id || '',
    operator: 'contains',
    value: ''
  }]);

  if (!isOpen) return null;

  const addFilter = () => {
    setFilters([...filters, {
      field: columns[0]?.id || '',
      operator: 'contains',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterType>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const handleApply = () => {
    // Фильтруем пустые фильтры
    const validFilters = filters.filter(f => f.field && f.value);
    onApply(validFilters);
    onClose();
  };

  const getColumnType = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column?.type || 'string';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Настройка фильтров</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filters.map((filter, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(idx, { field: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(idx, { operator: e.target.value as any })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  
                  <div className="space-y-1">
                    {filter.operator === 'between' ? (
                      <>
                        <input
                          type={getColumnType(filter.field) === 'number' ? 'number' : 'text'}
                          value={filter.value || ''}
                          onChange={(e) => updateFilter(idx, { value: e.target.value })}
                          placeholder="От"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type={getColumnType(filter.field) === 'number' ? 'number' : 'text'}
                          value={filter.value2 || ''}
                          onChange={(e) => updateFilter(idx, { value2: e.target.value })}
                          placeholder="До"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </>
                    ) : (
                      <input
                        type={getColumnType(filter.field) === 'number' ? 'number' : 'text'}
                        value={filter.value || ''}
                        onChange={(e) => updateFilter(idx, { value: e.target.value })}
                        placeholder="Значение"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFilter(idx)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={addFilter}
            className="mt-3 flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
          >
            <Plus className="w-4 h-4" />
            Добавить фильтр
          </button>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              ℹ️ Фильтрация будет реализована на бэкэнде. В данный момент это заглушка.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Применить фильтры
          </Button>
        </div>
      </div>
    </div>
  );
}