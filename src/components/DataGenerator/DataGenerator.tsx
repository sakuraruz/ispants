import React, { useState } from 'react';
import { Database, Loader2, Settings } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../UI/Card';
import { Input } from '../UI/Input';

interface DataGeneratorProps {
  onGenerate: (rows: number, columns: number) => void;
  isLoading: boolean;
}

export function DataGenerator({ onGenerate, isLoading }: DataGeneratorProps) {
  const [rows, setRows] = useState(10000);
  const [columns, setColumns] = useState(20);
  const [showCustom, setShowCustom] = useState(false);

  const presets = [
    { rows: 10000, columns: 20, name: 'Маленький', desc: '10K строк × 20 колонок' },
    { rows: 100000, columns: 50, name: 'Средний', desc: '100K строк × 50 колонок' },
    { rows: 500000, columns: 75, name: 'Большой', desc: '500K строк × 75 колонок' },
    { rows: 1000000, columns: 100, name: 'Огромный', desc: '1M строк × 100 колонок' }
  ];

  const handleGenerate = () => {
    if (rows > 0 && columns > 0 && rows <= 2000000 && columns <= 200) {
      console.log('Генерируем данные:', { rows, columns });
      onGenerate(rows, columns);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Database className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Генератор данных о городах</CardTitle>
          <CardDescription>
            Выберите размер таблицы для анализа. Данные о городах России будут сгенерированы автоматически.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setRows(preset.rows);
                  setColumns(preset.columns);
                  setShowCustom(false);
                }}
                className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{preset.name}</h3>
                <p className="text-sm text-gray-500">{preset.desc}</p>
              </button>
            ))}
          </div>
          
          {/* Custom settings toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <Settings className="w-4 h-4" />
            {showCustom ? 'Скрыть настройки' : 'Показать настройки'}
          </button>
          
          {/* Custom settings */}
          {showCustom && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество строк (до 2 млн)
                </label>
                <Input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(Math.min(2000000, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={2000000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ~{(rows * columns / 1000000).toFixed(1)} млн ячеек
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество колонок (до 200)
                </label>
                <Input
                  type="number"
                  value={columns}
                  onChange={(e) => setColumns(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={200}
                />
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {rows.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">строк</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {columns.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">колонок</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-gray-500">
              Общий объём: {(rows * columns / 1000000).toFixed(2)} млн ячеек
            </div>
          </div>
          
          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            fullWidth
            size="lg"
            className="text-lg py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Генерация данных...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                Сгенерировать таблицу
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-400 mt-4">
            Данные генерируются случайным образом. Время генерации зависит от выбранного размера.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}