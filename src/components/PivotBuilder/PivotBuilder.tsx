import React, { useState, useEffect } from 'react';
import { Plus, Save, FolderOpen, Sparkles, RefreshCw } from 'lucide-react';
import { usePivot } from '../../hooks/usePivot';
import { AttributeSelector } from './AttributeSelector';
import { PivotTable } from './PivotTable';
import { NaturalLanguageInput } from '../AIPanel/NaturalLanguageInput';
import { AIPanel } from '../AIPanel/AIPanel';
import { AggregationType } from '../../types';

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

  useEffect(() => {
    loadAttributes();
  }, []);

  useEffect(() => {
    if (attributes.length > 0 && rows.length === 0 && columns.length === 0 && values.length === 0) {
      getRecommendations();
    }
  }, [attributes]);

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
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showAIPanel 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI-помощник
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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
            
            <button
              onClick={handleBuildPivot}
              disabled={!canBuild || isLoading}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Построить таблицу
            </button>
            
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
              {isLoading && !pivotData ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Построение таблицы...</p>
                  </div>
                </div>
              ) : pivotData ? (
                <PivotTable data={pivotData} />
              ) : (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      Выберите поля и нажмите "Построить таблицу"
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Или используйте AI-помощник для автоматического построения
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats */}
            {pivotData && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  📊 {pivotData.rows.length} строк × {pivotData.columns.length} колонок
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
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  // TODO: Implement save
                  setShowSaveDialog(false);
                }}
                disabled={!saveName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}