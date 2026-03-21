import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from './Button';

interface CSVUploaderProps {
  onDataLoaded: (data: any[], columns: Column[]) => void;
  isDisabled?: boolean;
}

interface Column {
  id: string;
  name: string;
  type: 'number' | 'string' | 'date';
  width: number;
}

export function CSVUploader({ onDataLoaded, isDisabled = false }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });
  const [fileName, setFileName] = useState<string | null>(null);

  const detectColumnType = (values: string[]): 'number' | 'string' | 'date' => {
    // Проверяем первые 100 значений
    const sampleValues = values.slice(0, 100);
    
    // Проверка на числа
    const numberCount = sampleValues.filter(v => {
      const num = parseFloat(v);
      return !isNaN(num) && isFinite(num);
    }).length;
    
    if (numberCount > sampleValues.length * 0.8) {
      return 'number';
    }
    
    // Проверка на даты (простая)
    const dateRegex = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}/;
    const dateCount = sampleValues.filter(v => dateRegex.test(v)).length;
    
    if (dateCount > sampleValues.length * 0.8) {
      return 'date';
    }
    
    return 'string';
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Парсим заголовки
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Парсим данные
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const processFile = useCallback(async (file: File) => {
    if (isDisabled) return;
    
    setUploadStatus({ type: 'loading', message: 'Чтение файла...' });
    setFileName(file.name);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error('Файл не содержит данных');
      }
      
      // Определяем колонки
      const sampleRow = data[0];
      const columns: Column[] = Object.keys(sampleRow).map(key => {
        const values = data.map(row => String(row[key] || ''));
        const type = detectColumnType(values);
        
        return {
          id: key,
          name: key,
          type: type,
          width: Math.min(200, Math.max(100, key.length * 10 + 50))
        };
      });
      
      setUploadStatus({ type: 'success', message: `Загружено ${data.length} строк, ${columns.length} колонок` });
      onDataLoaded(data, columns);
      
      // Сбрасываем статус через 3 секунды
      setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      setUploadStatus({ type: 'error', message: `Ошибка: ${error instanceof Error ? error.message : 'Не удалось загрузить файл'}` });
      setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 5000);
    }
  }, [isDisabled, onDataLoaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type === 'text/csv') {
      processFile(files[0]);
    } else {
      setUploadStatus({ type: 'error', message: 'Пожалуйста, загрузите файл в формате CSV' });
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isDisabled && document.getElementById('csv-upload')?.click()}
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isDisabled}
        />
        
        {uploadStatus.type === 'loading' && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            <p className="text-gray-600">{uploadStatus.message}</p>
          </div>
        )}
        
        {uploadStatus.type === 'success' && (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-green-600 font-medium">{uploadStatus.message}</p>
            {fileName && (
              <p className="text-sm text-gray-500">Файл: {fileName}</p>
            )}
          </div>
        )}
        
        {uploadStatus.type === 'error' && (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-600 font-medium">{uploadStatus.message}</p>
          </div>
        )}
        
        {!uploadStatus.type && (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Перетащите CSV файл сюда или <span className="text-green-600 font-medium">нажмите для выбора</span>
            </p>
            <p className="text-sm text-gray-400">
              Поддерживаются файлы с разделителями запятая (,) или точка с запятой (;)
            </p>
            {fileName && !uploadStatus.type && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                <FileText className="w-4 h-4" />
                {fileName}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName(null);
                  }}
                  className="hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}