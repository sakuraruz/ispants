// src/components/DataLoader/DatabaseLoader.tsx
import React, { useState } from 'react';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';

interface DatabaseLoaderProps {
  onDataLoaded: (data: any[], columns: Column[]) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

interface Column {
  id: string;
  name: string;
  type: 'number' | 'string' | 'date';
  width: number;
}

export function DatabaseLoader({ onDataLoaded, isLoading, setIsLoading }: DatabaseLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const loadDataFromDatabase = async () => {
    if (setIsLoading) setIsLoading(true);
    setError(null);
    
    try {
      // 1. Получаем атрибуты (структуру таблицы)
      const attributesResponse = await fetch('/api/attributes');
      const attributes = await attributesResponse.json();
      
      // 2. Получаем данные из dataset
      const dataResponse = await fetch(`/api/dataset?page=${page}&size=1000`);
      const dataset = await dataResponse.json();
      
      // 3. Преобразуем данные в формат для таблицы
      const data = dataset.data || [];
      
      // 4. Создаем колонки из атрибутов
      const columns: Column[] = attributes.map((attr: any) => ({
        id: attr.name,
        name: attr.displayName || attr.name,
        type: attr.dataType === 'number' ? 'number' : 'string',
        width: Math.min(200, Math.max(100, (attr.displayName || attr.name).length * 10 + 50))
      }));
      
      // 5. Сохраняем общее количество строк (если есть)
      if (dataset.totalCount) {
        setTotalRows(dataset.totalCount);
      }
      
      onDataLoaded(data, columns);
      
    } catch (err) {
      console.error('Ошибка загрузки данных из БД:', err);
      setError('Не удалось загрузить данные из базы данных');
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const loadDemoData = async () => {
    if (setIsLoading) setIsLoading(true);
    setError(null);
    
    try {
      // Загружаем демо-данные из CSV (как fallback)
      const response = await fetch('/demo-data.csv');
      const csvText = await response.text();
      
      // Парсим CSV (можно использовать существующий парсер)
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim() || '';
        });
        data.push(row);
      }
      
      const columns: Column[] = headers.map(h => ({
        id: h,
        name: h,
        type: 'string',
        width: 150
      }));
      
      onDataLoaded(data, columns);
    } catch (err) {
      console.error('Ошибка загрузки демо-данных:', err);
      setError('Не удалось загрузить демо-данные');
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <Card variant="bordered" className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-green-600" />
          Источник данных
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={loadDataFromDatabase}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Загрузить из PostgreSQL
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadDemoData}
              disabled={isLoading}
              fullWidth
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Демо-данные (CSV)
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              ℹ️ Данные загружаются из PostgreSQL. 
              Таблица содержит информацию о продажах по регионам и кварталам.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}