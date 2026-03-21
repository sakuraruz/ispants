import { useState, useCallback } from 'react';
import { api } from '../services/api';
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
      const data = await api.getAttributes();
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
      const data = await api.buildPivot(request);
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
      const data = await api.recommendPivot({ text: context || '' });
      setRecommendations(data);
      return data;
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
      const pivotRequest = await api.processNaturalLanguage({ text: query });
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