export interface SaleRecord {
  id: string;
  orderNumber: string;
  product: string;
  price: number;
  formattedPrice: string;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
  dayOfWeek: string;
  month: string;
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'scatter';

export interface ColumnMeta {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  uniqueValues?: string[];
  min?: number;
  max?: number;
}

export interface GenericRecord {
  [key: string]: any;
}

export interface DatasetInfo {
  name: string;
  source: 'provided' | 'uploaded' | 'preset';
  timestamp: number;
  rowCount: number;
  columns: ColumnMeta[];
  records: GenericRecord[];
  isSaleSchema: boolean;
}

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  selectedPaymentMethods: string[];
  selectedProducts: string[];
  priceRange: [number, number];
  searchQuery: string;
}
