import React, { useState, useEffect } from 'react';
import { Plus, Save, FolderOpen, Sparkles, RefreshCw, Database } from 'lucide-react';
import { usePivot } from '../../hooks/usePivot';
import { AttributeSelector } from './AttributeSelector';
import { PivotTable } from './PivotTable';
import { VirtualTable } from '../VirtualTable/VirtualTable';
import { NaturalLanguageInput } from '../AIPanel/NaturalLanguageInput';
import { AIPanel } from '../AIPanel/AIPanel';
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
    recommendations,
    loadAttributes,
    buildPivot,
    getRecommendations,
    processNaturalLanguage
  } = usePivot();

  const [rows, setRows] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<Record<string, AggregationType>>({});
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Состояния для CSV данных
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [csvColumns, setCsvColumns] = useState<Column[] | null>(null);
  const [showTableView, setShowTableView] = useState<'pivot' | 'table'>('pivot');

  useEffect(() => {
    loadAttributes();
  }, []);

  useEffect(() => {
    if (attributes.length > 0 && rows.length === 0 && columns.length === 0 && values.length === 0) {
      getRecommendations();
    }
  }, [attributes]);

  const handleCSVDataLoaded = (data: any[], columns: Column[]) => {
    setCsvData(data);
    setCsvColumns(columns);
    setShowTableView('table');
    
    // Конвертируем колонки CSV в атрибуты для сводной таблицы
    const csvAttributes = columns.map(col => ({
      name: col.name,
      type: col.type === 'number' ? 'measure' as const : 'dimension' as const,
      dataType: col.type
    }));
    
    // Обновляем атрибуты (для демо - в реальном проекте нужно через API)
    // Здесь можно добавить логику для обновления атрибутов
  };

  const handleBuildPivot = async () => {
    if (rows.length === 0 && columns.length === 0 && values.length === 0) {
      return;
    }

    await buildPivot({
      rows,
      columns,
      values: values.map(field => ({
        field,
        aggregation: aggregations[field] || 'sum'
      }))
    });
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
  };

  const handleApplyRecommendation = async (rec: typeof recommendations) => {
    if (!rec) return;
    setRows(rec.rows);
    setColumns(rec.columns);
    setValues(rec.values.map(v => v.field));
    
    const newAggregations: Record<string, AggregationType> = {};
    rec.values.forEach(v => {
      newAggregations[v.field] = v.aggregation;
    });
    setAggregations(newAggregations);
    
    await buildPivot({
      rows: rec.rows,
      columns: rec.columns,
      values: rec.values
    });
  };

  const canBuild = rows.length > 0 || columns.length > 0 || values.length > 0;

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
              variant={showAIPanel ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI-помощник
            </Button>
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

        {/* Controls and Table */}
        <div className="flex gap-6">
          {/* Sidebar - Controls */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <AttributeSelector
              title="Строки"
              attributes={attributes}
              selected={rows}
              onChange={setRows}
              type="dimension"
            />
            
            <AttributeSelector
              title="Колонки"
              attributes={attributes}
              selected={columns}
              onChange={setColumns}
              type="dimension"
            />
            
            <AttributeSelector
              title="Значения"
              attributes={attributes}
              selected={values}
              onChange={setValues}
              selectedAggregations={aggregations}
              onAggregationChange={(field, agg) => setAggregations(prev => ({ ...prev, [field]: agg }))}
              type="measure"
              allowAggregation
            />
            
            <Button
              onClick={handleBuildPivot}
              disabled={!canBuild || isLoading}
              fullWidth
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              Построить таблицу
            </Button>
            
            {showAIPanel && (
              <AIPanel
                recommendations={recommendations}
                onApplyRecommendation={handleApplyRecommendation}
                isLoading={isLoading}
              />
            )}
          </div>
          
          {/* Main Area - Table */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <NaturalLanguageInput
              onSubmit={handleNaturalLanguageQuery}
              isLoading={isLoading}
            />
            
            <div className="mt-4">
              {showTableView === 'table' && csvData && csvColumns ? (
                <div className="h-[600px]">
                  <VirtualTable
                    data={csvData}
                    columns={csvColumns}
                    onDataChange={setCsvData}
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
                      Данные загружены. Выберите поля и нажмите "Построить таблицу"
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
                      Загрузите CSV файл или выберите поля и нажмите "Построить таблицу"
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Или используйте AI-помощник для автоматического построения
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
                  // TODO: Implement save
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