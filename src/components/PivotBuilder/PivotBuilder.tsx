// src/components/PivotBuilder/PivotBuilder.tsx (обновленная версия)
import React, { useState, useEffect } from 'react';
import { Save, Sparkles, RefreshCw, Database } from 'lucide-react';
import { usePivot } from '../../hooks/usePivot';
import { VirtualTable } from '../VirtualTable/VirtualTable';
import { NaturalLanguageInput } from '../AIPanel/NaturalLanguageInput';
import { CSVUploader } from '../UI/CSVUploader';
import { DatabaseLoader } from '../DataLoader'; // НОВЫЙ ИМПОРТ
import { Button } from '../UI/Button';
import { FilterDialog } from './FilterDialog';
import { FormulaBar, Formula } from '../FormulaBar';
import { AggregationType, Filter as FilterType } from '../../types';

interface Column {
  id: string;
  name: string;
  type: 'number' | 'string' | 'date';
  width: number;
}

export function PivotBuilder() {
  const {
    attributes,
    pivotData,
    isLoading,
    error,
    loadAttributes,
    buildPivot,
    processNaturalLanguage
  } = usePivot();

  const [rows, setRows] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<Record<string, AggregationType>>({});
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: string; order: 'asc' | 'desc' } | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [dataSource, setDataSource] = useState<'db' | 'csv' | null>(null);
  
  // State for CSV data
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [csvColumns, setCsvColumns] = useState<Column[] | null>(null);
  
  // State for DB data
  const [dbData, setDbData] = useState<any[] | null>(null);
  const [dbColumns, setDbColumns] = useState<Column[] | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);

  useEffect(() => {
    loadAttributes();
  }, []);

  // Используем либо CSV данные, либо данные из БД
  const currentData = csvData || dbData;
  const currentColumns = csvColumns || dbColumns;

  const handleCSVDataLoaded = (data: any[], columns: Column[]) => {
    setCsvData(data);
    setCsvColumns(columns);
    setDbData(null);
    setDbColumns(null);
    setDataSource('csv');
  };

  const handleDBDataLoaded = (data: any[], columns: Column[]) => {
    setDbData(data);
    setDbColumns(columns);
    setCsvData(null);
    setCsvColumns(null);
    setDataSource('db');
  };

  const handleFormulasChange = (newFormulas: Formula[]) => {
    setFormulas(newFormulas);
    console.log('Формулы обновлены:', newFormulas);
  };

  const handleNaturalLanguageQuery = async (query: string) => {
    const mockResponse = `Анализ запроса: "${query}"

📊 Рекомендуемая структура таблицы:
- Строки: Регион, Город
- Значения: Сумма продаж (сумма)

📈 Статистика:
- Общая сумма продаж: 9,500,000 ₽
- Средняя сумма продаж: 791,667 ₽
- Количество транзакций: 12

📐 Активные формулы:
${formulas.length > 0 ? formulas.map(f => `- ${f.name}: ${f.expression}`).join('\n') : '- Нет активных формул'}`;
    
    setAiResponse(mockResponse);
    
    const result = await processNaturalLanguage(query);
    setRows(result.pivotRequest.rows);
    setColumns(result.pivotRequest.columns);
    setValues(result.pivotRequest.values.map(v => v.field));
    
    const newAggregations: Record<string, AggregationType> = {};
    result.pivotRequest.values.forEach(v => {
      newAggregations[v.field] = v.aggregation;
    });
    setAggregations(newAggregations);
    
    if (currentData) {
      await buildPivot({
        rows: result.pivotRequest.rows,
        columns: result.pivotRequest.columns,
        values: result.pivotRequest.values,
        filters: filters.length > 0 ? filters : undefined
      });
    }
  };

  const handleApplyFilters = async (newFilters: FilterType[]) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
    console.log('Фильтры применены:', newFilters);
  };

  const handleSort = async (field: string, order: 'asc' | 'desc') => {
    setSortConfig({ field, order });
    console.log('Сортировка применена:', { field, order });
  };

  const closeAiResponse = () => {
    setAiResponse(null);
  };

  const availableFields = currentColumns?.map(col => ({
    id: col.id,
    name: col.name,
    type: col.type
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Гибкий UI для сводных таблиц
            </h1>
            <p className="text-sm text-gray-500">
              Анализируйте данные из PostgreSQL с помощью ИИ
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentData}
            >
              <Save className="w-4 h-4 mr-1" />
              Сохранить
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Data Source Selection - НОВЫЙ БЛОК */}
        <div className="mb-6">
          <DatabaseLoader 
            onDataLoaded={handleDBDataLoaded}
            isLoading={isDbLoading}
            setIsLoading={setIsDbLoading}
          />
        </div>

        {/* CSV Upload (как альтернатива) */}
        <div className="mb-6">
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              📁 Или загрузить CSV файл
            </summary>
            <div className="mt-3">
              <CSVUploader onDataLoaded={handleCSVDataLoaded} isDisabled={isLoading || isDbLoading} />
            </div>
          </details>
        </div>

        {/* Formulas Section */}
        {currentData && (
          <div className="mb-6">
            <FormulaBar
              formulas={formulas}
              onFormulasChange={handleFormulasChange}
              availableFields={availableFields}
              isReadOnly={false}
            />
          </div>
        )}

        {/* AI Assistant */}
        {currentData && (
          <div className="mb-6">
            <NaturalLanguageInput
              onSubmit={handleNaturalLanguageQuery}
              isLoading={isLoading}
              aiResponse={aiResponse}
              onCloseResponse={closeAiResponse}
            />
          </div>
        )}

        {/* Active Filters Bar */}
        {filters.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Активные фильтры:</span>
              <button
                onClick={() => handleApplyFilters([])}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Очистить все
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, idx) => (
                <div key={idx} className="px-2 py-1 bg-white border border-blue-200 rounded text-sm text-gray-700">
                  <span className="font-medium">{filter.field}</span>
                  <span className="mx-1 text-gray-400">
                    {filter.operator === 'contains' ? 'содержит' : 
                     filter.operator === 'eq' ? '=' : 
                     filter.operator === 'neq' ? '≠' :
                     filter.operator === 'gt' ? '>' : 
                     filter.operator === 'gte' ? '≥' :
                     filter.operator === 'lt' ? '<' : 
                     filter.operator === 'lte' ? '≤' :
                     filter.operator === 'between' ? 'от' : ''}
                  </span>
                  <span>{String(filter.value)}</span>
                  {filter.operator === 'between' && filter.value2 && (
                    <span className="ml-1">до {String(filter.value2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Sort Bar */}
        {sortConfig && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-700">
                  Сортировка: {sortConfig.field} ({sortConfig.order === 'asc' ? 'по возрастанию' : 'по убыванию'})
                </span>
              </div>
              <button
                onClick={() => setSortConfig(null)}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                Очистить
              </button>
            </div>
          </div>
        )}

        {/* Active Formulas Bar */}
        {formulas.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Активные формулы:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {formulas.map((formula) => (
                <div key={formula.id} className="px-2 py-1 bg-white border border-green-200 rounded text-sm text-gray-700">
                  <span className="font-mono text-green-600 mr-1">
                    {formula.aggregation === 'sum' && '∑'}
                    {formula.aggregation === 'avg' && 'x̄'}
                    {formula.aggregation === 'count' && '#'}
                    {formula.aggregation === 'min' && '↓'}
                    {formula.aggregation === 'max' && '↑'}
                  </span>
                  <span className="font-medium">{formula.name}</span>
                  <span className="text-gray-400 text-xs ml-1">{formula.expression}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-2">
              ℹ️ Формулы будут вычисляться на бэкенде. Настройки сохранены локально.
            </p>
          </div>
        )}

        {/* Data Source Indicator */}
        {dataSource && (
          <div className="mb-4 p-2 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Источник данных: {dataSource === 'db' ? 'PostgreSQL' : 'CSV файл'}</span>
            {dataSource === 'db' && (
              <span className="text-xs text-green-600">
                ✓ {currentData?.length || 0} строк загружено
              </span>
            )}
          </div>
        )}

        {/* Table Area */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <div>
              {currentData && currentColumns ? (
                <div className="h-[600px]">
                  <VirtualTable
                    data={currentData}
                    columns={currentColumns}
                    onDataChange={setCsvData}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onOpenFilters={() => setShowFilterDialog(true)}
                    activeFiltersCount={filters.length}
                  />
                </div>
              ) : isLoading || isDbLoading ? (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Загрузка данных...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Выберите источник данных для начала работы
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      PostgreSQL или загрузите CSV файл
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        onApply={handleApplyFilters}
        columns={currentColumns || []}
        initialFilters={filters}
      />
      
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Сохранить состояние
            </h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Название..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)} fullWidth>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  const stateToSave = {
                    formulas,
                    filters,
                    sortConfig,
                    rows,
                    columns,
                    values,
                    aggregations,
                    dataSource
                  };
                  console.log('Сохранённое состояние:', stateToSave);
                  setShowSaveDialog(false);
                }}
                disabled={!saveName.trim()}
                fullWidth
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}