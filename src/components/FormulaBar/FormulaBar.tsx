// src/components/FormulaBar/FormulaBar.tsx
import React, { useState } from 'react';
import { FunctionSquare, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';

export interface Formula {
  id: string;
  name: string;
  expression: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: string;
}

interface FormulaBarProps {
  formulas?: Formula[];
  onFormulasChange?: (formulas: Formula[]) => void;
  availableFields?: Array<{ id: string; name: string; type: string }>;
  isReadOnly?: boolean;
}

const AGGREGATION_LABELS: Record<string, string> = {
  sum: 'СУММА',
  avg: 'СРЗНАЧ',
  count: 'СЧЁТ',
  min: 'МИН',
  max: 'МАКС'
};

const AGGREGATION_SYMBOLS: Record<string, string> = {
  sum: '∑',
  avg: 'x̄',
  count: '#',
  min: '↓',
  max: '↑'
};

const DEFAULT_FORMULAS: Formula[] = [
  { id: '1', name: 'Итого продаж', expression: '=СУММА(Продажи)', field: 'Продажи', aggregation: 'sum' },
  { id: '2', name: 'Средний чек', expression: '=СРЗНАЧ(Сумма)', field: 'Сумма', aggregation: 'avg' },
  { id: '3', name: 'Количество сделок', expression: '=СЧЁТ(Сделка)', field: 'Сделка', aggregation: 'count' },
];

export function FormulaBar({ 
  formulas: externalFormulas, 
  onFormulasChange,
  availableFields = [],
  isReadOnly = false 
}: FormulaBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFormulas, setLocalFormulas] = useState<Formula[]>(externalFormulas || DEFAULT_FORMULAS);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFormula, setNewFormula] = useState<Partial<Formula>>({
    name: '',
    field: '',
    aggregation: 'sum',
    expression: ''
  });

  const formulas = externalFormulas || localFormulas;

  const updateFormulas = (newFormulas: Formula[]) => {
    setLocalFormulas(newFormulas);
    onFormulasChange?.(newFormulas);
  };

  const addFormula = () => {
    if (!newFormula.name || !newFormula.field) return;
    
    const formula: Formula = {
      id: Date.now().toString(),
      name: newFormula.name!,
      field: newFormula.field!,
      aggregation: newFormula.aggregation as Formula['aggregation'],
      expression: `=${AGGREGATION_LABELS[newFormula.aggregation!]}(${newFormula.field})`
    };
    
    updateFormulas([...formulas, formula]);
    setNewFormula({ name: '', field: '', aggregation: 'sum', expression: '' });
    setShowAddDialog(false);
  };

  const removeFormula = (id: string) => {
    updateFormulas(formulas.filter(f => f.id !== id));
  };

  const editFormula = (formula: Formula) => {
    setEditingFormula(formula);
  };

  const saveEdit = () => {
    if (editingFormula) {
      updateFormulas(formulas.map(f => f.id === editingFormula.id ? editingFormula : f));
      setEditingFormula(null);
    }
  };

  if (isReadOnly) {
    return (
      <Card variant="bordered" padding="none" className="bg-gray-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-gray-400">
            <FunctionSquare className="w-4 h-4" />
            <span className="text-sm">Формулы будут доступны после подключения бэкенда</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" padding="none" className="bg-white">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FunctionSquare className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">Вычисляемые поля (формулы)</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {formulas.length}
          </span>
          <div className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Заглушка
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddDialog(true);
            }}
            className="p-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <CardContent className="p-3">
          {formulas.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <FunctionSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет вычисляемых полей</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddDialog(true)}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Добавить формулу
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {formulas.map(formula => (
                <div 
                  key={formula.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  {editingFormula?.id === formula.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingFormula.name}
                        onChange={(e) => setEditingFormula({ ...editingFormula, name: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Название"
                        autoFocus
                      />
                      <select
                        value={editingFormula.aggregation}
                        onChange={(e) => setEditingFormula({ 
                          ...editingFormula, 
                          aggregation: e.target.value as Formula['aggregation'],
                          expression: `=${AGGREGATION_LABELS[e.target.value]}(${editingFormula.field})`
                        })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="sum">СУММА</option>
                        <option value="avg">СРЗНАЧ</option>
                        <option value="count">СЧЁТ</option>
                        <option value="min">МИН</option>
                        <option value="max">МАКС</option>
                      </select>
                      <select
                        value={editingFormula.field}
                        onChange={(e) => setEditingFormula({ 
                          ...editingFormula, 
                          field: e.target.value,
                          expression: `=${AGGREGATION_LABELS[editingFormula.aggregation]}(${e.target.value})`
                        })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="">Выберите поле</option>
                        {availableFields.map(field => (
                          <option key={field.id} value={field.name}>{field.name}</option>
                        ))}
                      </select>
                      <Button variant="primary" size="sm" onClick={saveEdit}>Сохранить</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingFormula(null)}>Отмена</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                            {AGGREGATION_SYMBOLS[formula.aggregation]}
                          </span>
                          <span className="font-medium text-gray-900">{formula.name}</span>
                          <code className="text-xs text-gray-500 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                            {formula.expression}
                          </code>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Поле: {formula.field} | Агрегация: {AGGREGATION_LABELS[formula.aggregation]}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => editFormula(formula)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Редактировать"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => removeFormula(formula.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              ℹ️ Вычисление формул будет выполняться на бэкенде (PostgreSQL/Java). 
              В данный момент это визуальная заглушка для настройки формул.
            </p>
          </div>
        </CardContent>
      )}

      {/* Add Formula Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FunctionSquare className="w-5 h-5 text-green-600" />
              Добавить вычисляемое поле
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название поля
                </label>
                <input
                  type="text"
                  value={newFormula.name}
                  onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                  placeholder="Например: Итого продаж"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Исходное поле
                </label>
                <select
                  value={newFormula.field}
                  onChange={(e) => setNewFormula({ ...newFormula, field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Выберите поле</option>
                  {availableFields.map(field => (
                    <option key={field.id} value={field.name}>{field.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип агрегации
                </label>
                <select
                  value={newFormula.aggregation}
                  onChange={(e) => setNewFormula({ 
                    ...newFormula, 
                    aggregation: e.target.value as Formula['aggregation'],
                    expression: `=${AGGREGATION_LABELS[e.target.value]}(${newFormula.field || 'поле'})`
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="sum">СУММА</option>
                  <option value="avg">СРЗНАЧ</option>
                  <option value="count">СЧЁТ</option>
                  <option value="min">МИН</option>
                  <option value="max">МАКС</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Формула (предпросмотр):</p>
                <code className="text-sm font-mono text-green-700">
                  {newFormula.expression || '=АГРЕГАЦИЯ(поле)'}
                </code>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} fullWidth>
                Отмена
              </Button>
              <Button 
                onClick={addFormula} 
                disabled={!newFormula.name || !newFormula.field}
                fullWidth
              >
                Добавить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}