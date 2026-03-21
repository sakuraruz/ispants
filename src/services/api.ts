import axios from 'axios';
import { 
  Attribute, 
  PivotRequest, 
  PivotResponse, 
  NaturalLanguageQuery,
  RecommendedPivot 
} from '../types';

const API_BASE_URL = '/api';

export const api = {
  // Получение списка атрибутов
  getAttributes: async (): Promise<Attribute[]> => {
    const response = await axios.get(`${API_BASE_URL}/attributes`);
    return response.data;
  },
  
  // Построение сводной таблицы
  buildPivot: async (request: PivotRequest): Promise<PivotResponse> => {
    const response = await axios.post(`${API_BASE_URL}/pivot`, request);
    return response.data;
  },
  
  // AI: рекомендация структуры сводной таблицы
  recommendPivot: async (query?: NaturalLanguageQuery): Promise<RecommendedPivot> => {
    const response = await axios.post(`${API_BASE_URL}/ai/recommend`, query || {});
    return response.data;
  },
  
  // AI: обработка естественного языка
  processNaturalLanguage: async (query: NaturalLanguageQuery): Promise<PivotRequest> => {
    const response = await axios.post(`${API_BASE_URL}/ai/parse`, query);
    return response.data;
  },
  
  // Сохранение состояния таблицы
  savePivotState: async (name: string, state: any): Promise<void> => {
    await axios.post(`${API_BASE_URL}/pivot/save`, { name, state });
  },
  
  // Загрузка сохранённого состояния
  loadPivotState: async (name: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/pivot/load/${name}`);
    return response.data;
  }
};