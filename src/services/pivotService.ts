// src/services/pivotService.ts
import { api } from './api';
import { 
    PivotRequest, 
    PivotResponse, 
    Attribute,
    NaturalLanguageResponse,
    RecommendedPivot,
    AnalysisResponse,
    TableDataResponse,
    TableInfo,
    Formula
} from '../types';

export class PivotService {
    private static instance: PivotService;
    
    private constructor() {}
    
    static getInstance(): PivotService {
        if (!PivotService.instance) {
            PivotService.instance = new PivotService();
        }
        return PivotService.instance;
    }
    
    // ==================== ОСНОВНЫЕ МЕТОДЫ ====================
    
    async getAttributes(): Promise<Attribute[]> {
        try {
            return await api.getAttributes();
        } catch (error) {
            console.error('Ошибка получения атрибутов:', error);
            return this.getDemoAttributes();
        }
    }
    
    async buildPivot(request: PivotRequest): Promise<PivotResponse> {
        try {
            return await api.buildPivot(request);
        } catch (error) {
            console.error('Ошибка построения сводной таблицы:', error);
            return this.getDemoPivotData(request);
        }
    }
    
    // ==================== ИИ МЕТОДЫ ====================
    
    async processNaturalLanguage(query: string): Promise<NaturalLanguageResponse> {
        try {
            return await api.processNaturalLanguage(query);
        } catch (error) {
            console.error('Ошибка обработки естественного языка:', error);
            return {
                query,
                insights: "Москва лидирует с 45% продаж. Рекомендуется усилить маркетинг в регионах.",
                data: [
                    { region: "Москва", sum: 15100000 },
                    { region: "СПб", sum: 10800000 }
                ],
                pivotRequest: {
                    rows: ["region"],
                    columns: [],
                    values: [{ field: "sales_amount", aggregation: "sum" }]
                }
            };
        }
    }
    
    async getRecommendation(query: string): Promise<RecommendedPivot> {
        try {
            return await api.getRecommendation(query);
        } catch (error) {
            console.error('Ошибка получения рекомендации:', error);
            return {
                rows: ["region"],
                columns: ["quarter"],
                values: [{ field: "sales_amount", aggregation: "sum" }],
                explanation: "Анализ продаж по регионам и кварталам",
                confidence: 0.85
            };
        }
    }
    
    async analyzeData(data: any): Promise<AnalysisResponse> {
        try {
            return await api.analyzeData(data);
        } catch (error) {
            console.error('Ошибка анализа данных:', error);
            return {
                summary: "Анализ данных завершён",
                insights: [
                    "Москва лидирует с 45% продаж",
                    "СПб показал рост 15% по сравнению с прошлым кварталом"
                ],
                recommendations: [
                    "Увеличить маркетинговый бюджет в регионах",
                    "Провести акции в СПб"
                ],
                anomalies: []
            };
        }
    }
    
    // ==================== РАБОТА С БД ====================
    
    async loadTableData(tableName: string, page: number = 0, size: number = 500): Promise<TableDataResponse> {
        try {
            return await api.loadTableData(tableName, page, size);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            throw error;
        }
    }
    
    async getAvailableTables(): Promise<string[]> {
        try {
            return await api.getAvailableTables();
        } catch (error) {
            console.error('Ошибка получения списка таблиц:', error);
            return ['sales_data'];
        }
    }
    
    async getTableInfo(tableName: string): Promise<TableInfo> {
        try {
            return await api.getTableInfo(tableName);
        } catch (error) {
            console.error('Ошибка получения информации о таблице:', error);
            throw error;
        }
    }
    
    async setActiveTable(tableName: string): Promise<{ status: string; currentTable: string }> {
        try {
            return await api.setActiveTable(tableName);
        } catch (error) {
            console.error('Ошибка смены таблицы:', error);
            throw error;
        }
    }
    
    // ==================== ФОРМУЛЫ ====================
    
    async applyFormula(formula: Formula, data: any[]): Promise<any[]> {
        try {
            return await api.applyFormula(formula, data);
        } catch (error) {
            console.error('Ошибка применения формулы:', error);
            return data;
        }
    }
    
    async getFormulaTemplates(): Promise<Formula[]> {
        try {
            return await api.getFormulaTemplates();
        } catch (error) {
            console.error('Ошибка получения шаблонов формул:', error);
            return [
                { id: '1', name: 'Маржинальность', expression: '(profit / sales) * 100', aggregation: 'sum' },
                { id: '2', name: 'Рост продаж', expression: '(current - previous) / previous * 100', aggregation: 'sum' }
            ];
        }
    }
    
    // ==================== ПРОВЕРКА ЗДОРОВЬЯ ====================
    
    async health(): Promise<{ status: string; message?: string }> {
        try {
            return await api.health();
        } catch (error) {
            return { status: 'error', message: 'Сервер не отвечает' };
        }
    }
    
    // ==================== ДЕМО-ДАННЫЕ ====================
    
    private getDemoAttributes(): Attribute[] {
        return [
            { name: 'region', displayName: 'Регион', type: 'dimension', dataType: 'string' },
            { name: 'city', displayName: 'Город', type: 'dimension', dataType: 'string' },
            { name: 'product_category', displayName: 'Категория', type: 'dimension', dataType: 'string' },
            { name: 'quarter', displayName: 'Квартал', type: 'dimension', dataType: 'string' },
            { name: 'sales_amount', displayName: 'Сумма продаж', type: 'measure', dataType: 'number' },
            { name: 'profit', displayName: 'Прибыль', type: 'measure', dataType: 'number' },
            { name: 'quantity', displayName: 'Количество', type: 'measure', dataType: 'number' }
        ];
    }
    
    private getDemoPivotData(request: PivotRequest): PivotResponse {
        const regions = ['Москва', 'СПб', 'Казань', 'Новосибирск'];
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        
        const rows = regions.map(region => ({
            label: region,
            values: quarters.map(() => Math.floor(Math.random() * 1000000))
        }));
        
        return {
            columns: quarters,
            rows: rows,
            totals: {
                rowTotals: rows.map(row => row.values.reduce((a, b) => a + b, 0)),
                columnTotals: quarters.map((_, i) => rows.reduce((sum, row) => sum + row.values[i], 0)),
                grandTotal: rows.reduce((sum, row) => sum + row.values.reduce((a, b) => a + b, 0), 0)
            }
        };
    }
}

export const pivotService = PivotService.getInstance();