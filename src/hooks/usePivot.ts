// src/hooks/usePivot.ts
import { useState, useCallback } from 'react';
import { pivotService } from '../services/pivotService';
import { 
  PivotRequest, 
  PivotResponse, 
  Attribute,
  NaturalLanguageResponse,
  RecommendedPivot,
  AnalysisResponse,
  TableDataResponse,
  Filter,
  Sort
} from '../types';

export function usePivot() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [pivotData, setPivotData] = useState<PivotResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<NaturalLanguageResponse | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendedPivot | null>(null);
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  // 1. Загрузка атрибутов
  const loadAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pivotService.getAttributes();
      setAttributes(data);
    } catch (err) {
      setError('Ошибка загрузки атрибутов');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Построение сводной таблицы
  const buildPivot = useCallback(async (request: PivotRequest): Promise<PivotResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pivotService.buildPivot(request);
      setPivotData(data);
      return data;
    } catch (err) {
      setError('Ошибка построения сводной таблицы');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Обработка естественного языка (ИИ) — РЕАЛЬНЫЙ ВЫЗОВ
  const processNaturalLanguage = useCallback(async (query: string): Promise<NaturalLanguageResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      // Реальный вызов к бэкенду
      const result = await pivotService.processNaturalLanguage(query);
      setAiResponse(result);
      
      // Если ИИ вернул структуру для сводной таблицы, строим её
      if (result.pivotRequest) {
        await buildPivot(result.pivotRequest);
      }
      
      return result;
    } catch (err) {
      setError('Ошибка обработки запроса');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [buildPivot]);

  // 4. Получение рекомендации от ИИ
  const getRecommendation = useCallback(async (query: string): Promise<RecommendedPivot | null> => {
    setIsLoading(true);
    try {
      const rec = await pivotService.getRecommendation(query);
      setRecommendation(rec);
      return rec;
    } catch (err) {
      setError('Ошибка получения рекомендации');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. Анализ данных (ИИ)
  const analyzeData = useCallback(async (data: any): Promise<AnalysisResponse | null> => {
    try {
      const analysis = await pivotService.analyzeData(data);
      return analysis;
    } catch (err) {
      console.error('Ошибка анализа данных:', err);
      return null;
    }
  }, []);

  // 6. Загрузка данных из таблицы PostgreSQL
  const loadTableData = useCallback(async (tableName: string, page: number = 0, size: number = 500): Promise<TableDataResponse> => {
    setIsLoading(true);
    try {
      const data = await pivotService.loadTableData(tableName, page, size);
      setTableData(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 7. Получение списка доступных таблиц
  const fetchAvailableTables = useCallback(async (): Promise<string[]> => {
    try {
      const tables = await pivotService.getAvailableTables();
      setAvailableTables(tables);
      return tables;
    } catch (err) {
      console.error('Ошибка получения списка таблиц:', err);
      return [];
    }
  }, []);

  // 8. Смена активной таблицы
  const setActiveTable = useCallback(async (tableName: string): Promise<void> => {
    setIsLoading(true);
    try {
      await pivotService.setActiveTable(tableName);
      // После смены таблицы перезагружаем атрибуты
      await loadAttributes();
    } catch (err) {
      setError('Ошибка смены таблицы');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadAttributes]);

  // 9. Применение фильтров
  const applyFilters = useCallback(async (filters: Filter[]): Promise<PivotResponse> => {
    if (!pivotData) {
      throw new Error('Нет данных для фильтрации');
    }
    
    setIsLoading(true);
    try {
      const request: PivotRequest = {
        rows: [], // можно сохранять из текущего состояния
        columns: [],
        values: [],
        filters
      };
      const result = await buildPivot(request);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [pivotData, buildPivot]);

  // 10. Применение сортировки
  const applySort = useCallback(async (sort: Sort[]): Promise<PivotResponse> => {
    if (!pivotData) {
      throw new Error('Нет данных для сортировки');
    }
    
    setIsLoading(true);
    try {
      const request: PivotRequest = {
        rows: [],
        columns: [],
        values: [],
        sort
      };
      const result = await buildPivot(request);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [pivotData, buildPivot]);

  // 11. Проверка здоровья сервера
  const checkHealth = useCallback(async (): Promise<{ status: string; message?: string }> => {
    try {
      return await pivotService.health();
    } catch (err) {
      return { status: 'error', message: 'Сервер не отвечает' };
    }
  }, []);

  // 12. Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 13. Сброс состояния
  const reset = useCallback(() => {
    setPivotData(null);
    setAiResponse(null);
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    // Состояния
    attributes,
    pivotData,
    isLoading,
    error,
    aiResponse,
    recommendation,
    tableData,
    availableTables,
    
    // Основные методы
    loadAttributes,
    buildPivot,
    processNaturalLanguage,
    getRecommendation,
    analyzeData,
    
    // Работа с БД
    loadTableData,
    fetchAvailableTables,
    setActiveTable,
    
    // Фильтры и сортировка
    applyFilters,
    applySort,
    
    // Утилиты
    checkHealth,
    clearError,
    reset
  };
}