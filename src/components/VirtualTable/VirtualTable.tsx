import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Filter, Download, Plus, SortAsc, SortDesc, ArrowLeft, Copy, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';

interface Column {
  id: string;
  name: string;
  width: number;
  type: 'number' | 'string' | 'date';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

interface CellValue {
  [key: string]: string | number;
}

interface VirtualTableProps {
  data: CellValue[];
  columns: Column[];
  onDataChange?: (data: CellValue[]) => void;
  isLoading?: boolean;
}

interface Filter {
  columnId: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string;
  value2?: string;
}

export function VirtualTable({ data, columns, onDataChange, isLoading = false }: VirtualTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(null);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width }), {})
  );
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply custom filters
    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const value = row[filter.columnId];
          const filterValue = filter.value;
          
          if (!value) return false;
          
          switch (filter.operator) {
            case 'equals':
              return String(value).toLowerCase() === String(filterValue).toLowerCase();
            case 'contains':
              return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'greater':
              return Number(value) > Number(filterValue);
            case 'less':
              return Number(value) < Number(filterValue);
            case 'between':
              return Number(value) >= Number(filterValue) && 
                     Number(value) <= Number(filter.value2 || filterValue);
            default:
              return true;
          }
        });
      });
    }
    
    return result;
  }, [data, searchQuery, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.columnId];
      const bValue = b[sortConfig.columnId];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  // Column virtualizer
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => columnWidths[columns[index].id] || 150,
    overscan: 5,
  });

  const handleCellEdit = useCallback((rowIndex: number, columnId: string, value: string) => {
    if (!onDataChange) return;
    
    const newData = [...data];
    const actualRowIndex = sortedData.indexOf(data[rowIndex]);
    
    if (actualRowIndex !== -1) {
      newData[actualRowIndex] = {
        ...newData[actualRowIndex],
        [columnId]: value,
      };
      onDataChange(newData);
    }
    setEditingCell(null);
  }, [data, sortedData, onDataChange]);

  const handleSort = (columnId: string) => {
    setSortConfig(current => {
      if (current?.columnId === columnId) {
        return current.direction === 'asc' 
          ? { columnId, direction: 'desc' }
          : null;
      }
      return { columnId, direction: 'asc' };
    });
  };

  const handleColumnResize = (columnId: string, delta: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: Math.max(60, (prev[columnId] || 150) + delta)
    }));
  };

  const handleReset = () => {
    setSearchQuery('');
    setSortConfig(null);
    setFilters([]);
  };

  const handleExport = () => {
    const headers = columns.map(col => col.name).join(',');
    const rows = sortedData.map(row => 
      columns.map(col => row[col.id] ?? '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const headers = columns.map(col => col.name).join('\t');
    const rows = sortedData.map(row => 
      columns.map(col => row[col.id] ?? '').join('\t')
    ).join('\n');
    
    const text = `${headers}\n${rows}`;
    await navigator.clipboard.writeText(text);
    alert('Данные скопированы в буфер обмена!');
  };

  const addFilter = () => {
    setFilters([...filters, {
      columnId: columns[0]?.id || '',
      operator: 'contains',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const calculateAggregation = (columnId: string, aggregation: string) => {
    const values = sortedData.map(row => Number(row[columnId])).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    
    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0).toLocaleString();
      case 'avg':
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
      case 'count':
        return values.length.toLocaleString();
      case 'min':
        return Math.min(...values).toLocaleString();
      case 'max':
        return Math.max(...values).toLocaleString();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Сбросить
        </Button>
        
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Поиск по таблице..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        
        <Button 
          variant={filters.length > 0 ? 'primary' : 'outline'} 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-1" />
          Фильтры {filters.length > 0 && `(${filters.length})`}
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-1" />
          Копировать
        </Button>
        
        <Button variant="primary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" />
          Экспорт CSV
        </Button>
        
        <div className="text-sm text-gray-500 ml-auto">
          Строк: <span className="font-semibold text-gray-700">{sortedData.length.toLocaleString()}</span>
          {filteredData.length !== data.length && (
            <span className="ml-1 text-gray-400">
              (из {data.length.toLocaleString()})
            </span>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Активные фильтры</h4>
            <Button variant="ghost" size="sm" onClick={addFilter}>
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {filters.map((filter, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={filter.columnId}
                  onChange={(e) => updateFilter(idx, { columnId: e.target.value })}
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
                  <option value="contains">Содержит</option>
                  <option value="equals">Равно</option>
                  <option value="greater">Больше</option>
                  <option value="less">Меньше</option>
                  <option value="between">Между</option>
                </select>
                
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(idx, { value: e.target.value })}
                  placeholder="Значение"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                
                {filter.operator === 'between' && (
                  <input
                    type="text"
                    value={filter.value2 || ''}
                    onChange={(e) => updateFilter(idx, { value2: e.target.value })}
                    placeholder="До"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
                
                <button
                  onClick={() => removeFilter(idx)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div 
        ref={tableRef}
        className="flex-1 overflow-auto relative"
        style={{ contain: 'strict' }}
      >
        {/* Header */}
        <div
          ref={headerRef}
          className="sticky top-0 z-20 bg-gray-100 border-b-2 border-gray-300"
          style={{
            display: 'flex',
            width: `${columnVirtualizer.getTotalSize()}px`,
          }}
        >
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
            const column = columns[virtualColumn.index];
            const isSorted = sortConfig?.columnId === column.id;
            
            return (
              <div
                key={column.id}
                className="relative flex items-center border-r border-gray-300 bg-gray-100 group"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '44px',
                  width: `${columnWidths[column.id] || 150}px`,
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                <button
                  onClick={() => handleSort(column.id)}
                  className="flex items-center justify-between gap-2 px-3 py-2 w-full h-full hover:bg-gray-200 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-700 truncate">
                    {column.name}
                  </span>
                  {isSorted && (
                    sortConfig.direction === 'asc' 
                      ? <SortAsc className="w-4 h-4 text-green-600 flex-shrink-0" />
                      : <SortDesc className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </button>
                
                {/* Resize Handle */}
                <div
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-green-500 active:bg-green-600"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = columnWidths[column.id] || 150;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const delta = moveEvent.clientX - startX;
                      handleColumnResize(column.id, delta);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="w-1 h-full bg-transparent group-hover:bg-green-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = sortedData[virtualRow.index];
            if (!row) return null;
            
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 flex hover:bg-gray-50 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                  const column = columns[virtualColumn.index];
                  const cellValue = row[column.id];
                  const isEditing = editingCell?.rowIndex === virtualRow.index && 
                                   editingCell?.columnId === column.id;
                  
                  return (
                    <div
                      key={column.id}
                      className="absolute top-0 border-r border-b border-gray-200 flex items-center bg-white"
                      style={{
                        left: `${virtualColumn.start}px`,
                        width: `${columnWidths[column.id] || 150}px`,
                        height: '100%',
                      }}
                      onDoubleClick={() => setEditingCell({ rowIndex: virtualRow.index, columnId: column.id })}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={String(cellValue ?? '')}
                          autoFocus
                          className="w-full h-full px-2 border-2 border-green-500 focus:outline-none text-sm"
                          onBlur={(e) => handleCellEdit(virtualRow.index, column.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(virtualRow.index, column.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                        />
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-900 truncate w-full">
                          {cellValue !== undefined && cellValue !== null ? String(cellValue) : '-'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {sortedData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Нет данных для отображения</p>
          </div>
        )}
      </div>

      {/* Footer with aggregations */}
      {columns.some(col => col.aggregation) && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div
            className="flex"
            style={{
              width: `${columnVirtualizer.getTotalSize()}px`,
            }}
          >
            {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
              const column = columns[virtualColumn.index];
              const aggValue = column.aggregation 
                ? calculateAggregation(column.id, column.aggregation)
                : null;
              
              return (
                <div
                  key={column.id}
                  className="relative border-r border-gray-200"
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: `${columnWidths[column.id] || 150}px`,
                    transform: `translateX(${virtualColumn.start}px)`,
                    height: '36px',
                  }}
                >
                  {aggValue && (
                    <div className="px-3 py-2 text-xs font-medium text-gray-600">
                      <span className="text-gray-400">
                        {column.aggregation === 'sum' && 'Сумма:'}
                        {column.aggregation === 'avg' && 'Среднее:'}
                        {column.aggregation === 'count' && 'Кол-во:'}
                        {column.aggregation === 'min' && 'Мин:'}
                        {column.aggregation === 'max' && 'Макс:'}
                      </span>{' '}
                      <span className="font-semibold text-gray-800">{aggValue}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}