import { useState, useCallback } from 'react';
import { pivotService } from '../services/pivotService';
import { 
  PivotRequest, 
  PivotResponse, 
  Attribute, 
  AggregationType,
  RecommendedPivot 
} from '../types';

export function usePivot() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [pivotData, setPivotData] = useState<PivotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedPivot | null>(null);

  const loadAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use pivotService which returns mock data if backend fails
      const data = await pivotService.getAttributes();
      setAttributes(data);
    } catch (err) {
      setError('Ошибка загрузки атрибутов');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buildPivot = useCallback(async (request: PivotRequest) => {
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

  const getRecommendations = useCallback(async (context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock recommendation for now
      const mockRecommendation: RecommendedPivot = {
        rows: ['Регион'],
        columns: ['Категория'],
        values: [{ field: 'Сумма продаж', aggregation: 'sum' }],
        confidence: 0.85,
        explanation: 'Показывает распределение продаж по регионам и категориям.'
      };
      setRecommendations(mockRecommendation);
      return mockRecommendation;
    } catch (err) {
      setError('Ошибка получения рекомендаций');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processNaturalLanguage = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock natural language processing
      const pivotRequest: PivotRequest = {
        rows: ['Регион'],
        columns: [],
        values: [{ field: 'Сумма продаж', aggregation: 'sum' }]
      };
      const result = await buildPivot(pivotRequest);
      return { pivotRequest, result };
    } catch (err) {
      setError('Ошибка обработки запроса');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [buildPivot]);

  return {
    attributes,
    pivotData,
    isLoading,
    error,
    recommendations,
    loadAttributes,
    buildPivot,
    getRecommendations,
    processNaturalLanguage
  };
}