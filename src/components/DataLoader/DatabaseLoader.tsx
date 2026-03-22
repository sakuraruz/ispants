// src/components/DataLoader/DatabaseLoader.tsx
import React, { useState } from 'react';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';

interface Column {
  id: string;
  name: string;
  type: 'number' | 'string' | 'date';
  width: number;
}

interface DatabaseLoaderProps {
  onDataLoaded: (data: any[], columns: Column[]) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

export function DatabaseLoader({ onDataLoaded, isLoading, setIsLoading }: DatabaseLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<string>('');

  const loadAllData = async () => {
    if (setIsLoading) setIsLoading(true);
    setError(null);
    setLoadProgress('Загрузка атрибутов...');
    
    try {
      // 1. Получаем атрибуты
      const attributesResponse = await fetch('/api/attributes');
      const attributes = await attributesResponse.json();
      
      // 2. Загружаем все данные (без пагинации, но с большим лимитом)
      setLoadProgress('Загрузка данных из базы (100 000 строк)...');
      const dataResponse = await fetch('/api/dataset?page=0&size=100000');
      const dataset = await dataResponse.json();
      
      const data = dataset.data || [];
      
      setLoadProgress(`Загружено ${data.length.toLocaleString()} строк`);
      
      // 3. Создаем колонки
      const columns: Column[] = attributes.map((attr: any) => ({
        id: attr.name,
        name: attr.displayName || attr.name,
        type: attr.dataType === 'number' ? 'number' : 'string',
        width: Math.min(200, Math.max(100, (attr.displayName || attr.name).length * 10 + 50))
      }));
      
      onDataLoaded(data, columns);
      setLoadProgress('');
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные из базы данных');
      setLoadProgress('');
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
          <Button
            variant="primary"
            onClick={loadAllData}
            disabled={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loadProgress || 'Загрузка...'}
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Загрузить все данные из PostgreSQL (100 000 строк)
              </>
            )}
          </Button>
          
          {loadProgress && !isLoading && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
              {loadProgress}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              ℹ️ Загружается 100 000 строк данных о продажах. 
              Это может занять несколько секунд.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}