import { AggregationType } from '../types';

export function aggregateValues(
  values: any[], 
  aggregation: AggregationType
): any {
  const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  const stringValues = values.filter(v => typeof v === 'string');
  
  switch (aggregation) {
    case 'sum':
      return numericValues.reduce((a, b) => a + b, 0);
      
    case 'avg':
      return numericValues.length > 0 
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length 
        : 0;
        
    case 'count':
      return values.length;
      
    case 'countUnique':
      return new Set(values).size;
      
    case 'min':
      return numericValues.length > 0 ? Math.min(...numericValues) : null;
      
    case 'max':
      return numericValues.length > 0 ? Math.max(...numericValues) : null;
      
    case 'first':
      return values[0];
      
    case 'last':
      return values[values.length - 1];
      
    default:
      return values[0];
  }
}

export const aggregationLabels: Record<AggregationType, string> = {
  sum: 'Сумма',
  avg: 'Среднее',
  count: 'Количество',
  countUnique: 'Уникальных',
  min: 'Минимум',
  max: 'Максимум',
  first: 'Первое',
  last: 'Последнее'
};