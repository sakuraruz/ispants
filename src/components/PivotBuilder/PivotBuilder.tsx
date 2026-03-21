import React, { useState, useEffect, useMemo } from 'react';
import { Save, FolderOpen, Sparkles, RefreshCw, Database } from 'lucide-react';
import PivotTableUI from 'react-pivottable';
import 'react-pivottable/pivottable.css';
import { usePivot } from '../../hooks/usePivot';
import { PivotTable } from './PivotTable';
import { VirtualTable } from '../VirtualTable/VirtualTable';
import { NaturalLanguageInput } from '../AIPanel/NaturalLanguageInput';
import { CSVUploader } from '../UI/CSVUploader';
import { Button } from '../UI/Button';
import { AggregationType } from '../../types';

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
  
  // State for CSV data
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [csvColumns, setCsvColumns] = useState<Column[] | null>(null);
  const [showTableView, setShowTableView] = useState<'pivot' | 'table'>('pivot');

  // State for react-pivottable
  const [pivotState, setPivotState] = useState<any>({});

  useEffect(() => {
    loadAttributes();
  }, []);

  const handleCSVDataLoaded = (data: any[], columns: Column[]) => {
    setCsvData(data);
    setCsvColumns(columns);
    setShowTableView('table');
  };

  const handleNaturalLanguageQuery = async (query: string) => {
    const result = await processNaturalLanguage(query);
    setRows(result.pivotRequest.rows);
    setColumns(result.pivotRequest.columns);
    setValues(result.pivotRequest.values.map(v => v.field));
    
    const newAggregations: Record<string, AggregationType> = {};
    result.pivotRequest.values.forEach(v => {
      newAggregations[v.field] = v.aggregation;
    });
    setAggregations(newAggregations);
    
    // Automatically build pivot after AI query
    if (csvData) {
      await buildPivot({
        rows: result.pivotRequest.rows,
        columns: result.pivotRequest.columns,
        values: result.pivotRequest.values
      });
    }
  };

  // Prepare data for react-pivottable
  const pivotTableData = useMemo(() => {
    if (!csvData || csvData.length === 0) return [];
    if (!csvColumns) return [];
    const headers = csvColumns.map(col => col.name);
    const rowsData = csvData.map(row => headers.map(h => row[h]));
    return [headers, ...rowsData];
  }, [csvData, csvColumns]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Гибкий UI для сводных таблиц
            </h1>
            <p className="text-sm text-gray-500">
              Анализируйте данные с помощью ИИ
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="w-4 h-4 mr-1" />
              Сохранить
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* CSV Upload Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              Загрузка данных
            </h2>
            {csvData && (
              <div className="flex gap-2">
                <Button
                  variant={showTableView === 'pivot' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowTableView('pivot')}
                >
                  Сводная таблица
                </Button>
                <Button
                  variant={showTableView === 'table' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowTableView('table')}
                >
                  Таблица данных
                </Button>
              </div>
            )}
          </div>
          <CSVUploader onDataLoaded={handleCSVDataLoaded} isDisabled={isLoading} />
        </div>

        {/* AI Assistant */}
        {csvData && (
          <div className="mb-6">
            <NaturalLanguageInput
              onSubmit={handleNaturalLanguageQuery}
              isLoading={isLoading}
            />
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
              {showTableView === 'table' && csvData && csvColumns ? (
                <div className="h-[600px]">
                  <VirtualTable
                    data={csvData}
                    columns={csvColumns}
                    onDataChange={setCsvData}
                  />
                </div>
              ) : showTableView === 'pivot' && csvData && csvColumns ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <PivotTableUI
                    data={pivotTableData}
                    onChange={setPivotState}
                    {...pivotState}
                    rows={rows}
                    cols={columns}
                    vals={values}
                    aggregatorName={values.length > 0 ? 'Sum' : 'Count'}
                  />
                </div>
              ) : isLoading && !pivotData ? (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Построение таблицы...</p>
                  </div>
                </div>
              ) : pivotData ? (
                <PivotTable data={pivotData} />
              ) : csvData ? (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Данные загружены. Используйте AI-помощник для построения таблицы
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Всего строк: {csvData.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Загрузите CSV файл и используйте AI-помощник
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats */}
            {csvData && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  📊 Загружено: {csvData.length.toLocaleString()} строк
                </div>
                <div>
                  🔄 Обновлено: {new Date().toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Dialog */}
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
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                fullWidth
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
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