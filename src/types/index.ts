export interface Attribute {
    name: string;
    type: 'dimension' | 'measure';
    dataType?: 'string' | 'number' | 'date';
    uniqueValues?: number;
  }
  
  export interface PivotRequest {
    rows: string[];
    columns: string[];
    values: Array<{
      field: string;
      aggregation: AggregationType;
    }>;
    filters?: Filter[];
  }
  
  export interface PivotResponse {
    columns: string[];
    rows: PivotRow[];
    totals?: Totals;
}

export interface PivotRow {
    label: string;
    values: any[];
    subtotal?: any[];
}

export interface Totals {
    rowTotals: any[];
    columnTotals: any[];
    grandTotal: any;
}
  
  export type AggregationType = 
    | 'sum' 
    | 'avg' 
    | 'count' 
    | 'countUnique' 
    | 'min' 
    | 'max' 
    | 'first' 
    | 'last';
  
  export interface Filter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'between';
    value: any;
    value2?: any;
  }
  
  export interface NaturalLanguageQuery {
    text: string;
    context?: string;
  }
  
  export interface RecommendedPivot {
    rows: string[];
    columns: string[];
    values: Array<{ field: string; aggregation: AggregationType }>;
    confidence: number;
    explanation: string;
  }
  
  export interface SavedPivotState {
    id: string;
    name: string;
    rows: string[];
    columns: string[];
    values: Array<{ field: string; aggregation: AggregationType }>;
    filters?: Filter[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Filter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'between';
  value: any;
  value2?: any;
}