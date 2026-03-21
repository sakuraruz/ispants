import { useState, useCallback } from 'react';
import { pivotService } from '../services/pivotService';
import { 
  PivotRequest, 
  PivotResponse, 
  Attribute
} from '../types';

export function usePivot() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [pivotData, setPivotData] = useState<PivotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    loadAttributes,
    buildPivot,
    processNaturalLanguage
  };
}