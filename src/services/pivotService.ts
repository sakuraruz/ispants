import { api } from './api';
import { PivotRequest, PivotResponse, Attribute } from '../types';

export class PivotService {
  private static instance: PivotService;
  
  private constructor() {}
  
  static getInstance(): PivotService {
    if (!PivotService.instance) {
      PivotService.instance = new PivotService();
    }
    return PivotService.instance;
  }
  
  async getAttributes(): Promise<Attribute[]> {
    try {
      return await api.getAttributes();
    } catch (error) {
      console.error('Ошибка получения атрибутов:', error);
      // Возвращаем демо-данные для разработки
      return this.getDemoAttributes();
    }
  }
  
  async buildPivot(request: PivotRequest): Promise<PivotResponse> {
    try {
      return await api.buildPivot(request);
    } catch (error) {
      console.error('Ошибка построения сводной таблицы:', error);
      // Возвращаем демо-данные для разработки
      return this.getDemoPivotData(request);
    }
  }
  
  private getDemoAttributes(): Attribute[] {
    return [
      { name: 'Регион', type: 'dimension', dataType: 'string' },
      { name: 'Город', type: 'dimension', dataType: 'string' },
      { name: 'Категория', type: 'dimension', dataType: 'string' },
      { name: 'Дата', type: 'dimension', dataType: 'date' },
      { name: 'Сумма продаж', type: 'measure', dataType: 'number' },
      { name: 'Количество', type: 'measure', dataType: 'number' },
      { name: 'Прибыль', type: 'measure', dataType: 'number' },
      { name: 'Менеджер', type: 'dimension', dataType: 'string' }
    ];
  }
  
  private getDemoPivotData(request: PivotRequest): PivotResponse {
    const regions = ['Москва', 'СПб', 'Казань', 'Новосибирск'];
    const categories = ['Электроника', 'Одежда', 'Продукты', 'Мебель'];
    
    const rows = regions.map(region => ({
      label: region,
      values: categories.map(() => Math.floor(Math.random() * 1000000))
    }));
    
    return {
      columns: categories,
      rows: rows,
      totals: {
        rowTotals: rows.map(row => row.values.reduce((a, b) => a + b, 0)),
        columnTotals: categories.map((_, i) => rows.reduce((sum, row) => sum + row.values[i], 0)),
        grandTotal: rows.reduce((sum, row) => sum + row.values.reduce((a, b) => a + b, 0), 0)
      }
    };
  }
}

export const pivotService = PivotService.getInstance();