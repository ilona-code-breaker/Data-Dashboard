import Papa from 'papaparse';
import { ColumnMeta, DatasetInfo, GenericRecord, SaleRecord } from '../types';

export const PROVIDED_RAW_CSV = `Order Number,Product,Price,Date,Payment Method
TT-1001,Slim-Fit Denim Jeans,$88.00,2025-08-15,Credit Card
TT-1001,Technical Performance Joggers,$75.00,2025-08-15,Credit Card
TT-1002,Classic Fit Chinos,$78.00,2025-08-15,eWallet
TT-1003,Flannel-Lined Canvas Work Pants,$98.00,2025-08-16,Cash
TT-1004,Double-Pleated Khaki Trousers,$82.00,2025-08-16,Credit Card
TT-1005,Relaxed Fit Corduroy Trousers,$85.00,2025-08-17,Debit Card
TT-1005,Multi-Pocket Cargo Shorts,$58.00,2025-08-17,eWallet
TT-1006,Premium Tailored Trousers,$175.00,2025-08-18,Credit Card
TT-1007,Classic Denim Overalls,$115.00,2025-08-18,eWallet
TT-1008,Drawstring Linen Trousers,$92.00,2025-08-19,Debit Card
TT-1009,Slim-Fit Denim Jeans,$88.00,2025-08-19,Credit Card
TT-1009,Classic Fit Chinos,$78.00,2025-08-19,Cash
TT-1010,Tailored Wool Dress Trousers,$145.00,2025-08-20,Cash
TT-1011,Technical Performance Joggers,$75.00,2025-08-20,eWallet
TT-1012,Multi-Pocket Cargo Shorts,$58.00,2025-08-21,Cash
TT-1013,Striped Seersucker Trousers,$95.00,2025-08-21,Debit Card
TT-1014,Slim-Fit Denim Jeans,$88.00,2025-08-22,Debit Card
TT-1015,Flannel-Lined Canvas Work Pants,$98.00,2025-08-22,eWallet
TT-1015,Classic Fit Chinos,$78.00,2025-08-22,Debit Card
TT-1016,Drawstring Linen Trousers,$92.00,2025-08-23,Credit Card
TT-1017,Premium Tailored Trousers,$175.00,2025-08-24,Credit Card
TT-1018,Double-Pleated Khaki Trousers,$82.00,2025-08-24,Cash
TT-1018,Relaxed Fit Corduroy Trousers,$85.00,2025-08-24,Cash
TT-1019,Technical Performance Joggers,$75.00,2025-08-25,Debit Card
TT-1020,Classic Denim Overalls,$115.00,2025-08-25,Credit Card
TT-1021,Multi-Pocket Cargo Shorts,$58.00,2025-08-26,Credit Card
TT-1022,Classic Fit Chinos,$78.00,2025-08-26,Debit Card
TT-1023,Slim-Fit Denim Jeans,$88.00,2025-08-27,Debit Card
TT-1024,Tailored Wool Dress Trousers,$145.00,2025-08-27,eWallet
TT-1025,Flannel-Lined Canvas Work Pants,$98.00,2025-08-28,eWallet
TT-1025,Multi-Pocket Cargo Shorts,$58.00,2025-08-28,Debit Card
TT-1026,Drawstring Linen Trousers,$92.00,2025-08-29,Debit Card
TT-1027,Striped Seersucker Trousers,$95.00,2025-08-29,Credit Card
TT-1028,Relaxed Fit Corduroy Trousers,$85.00,2025-08-30,eWallet
TT-1029,Premium Tailored Trousers,$175.00,2025-08-30,Debit Card
TT-1029,Classic Fit Chinos,$78.00,2025-08-30,Debit Card
TT-1030,Technical Performance Joggers,$75.00,2025-08-31,Credit Card
TT-1031,Slim-Fit Denim Jeans,$88.00,2025-09-01,eWallet
TT-1032,Double-Pleated Khaki Trousers,$82.00,2025-09-01,Credit Card
TT-1033,Classic Denim Overalls,$115.00,2025-09-02,eWallet
TT-1034,Flannel-Lined Canvas Work Pants,$98.00,2025-09-02,Cash
TT-1034,Classic Fit Chinos,$78.00,2025-09-02,Cash
TT-1035,Multi-Pocket Cargo Shorts,$58.00,2025-09-03,Debit Card
TT-1036,Drawstring Linen Trousers,$92.00,2025-09-03,Credit Card
TT-1037,Tailored Wool Dress Trousers,$145.00,2025-09-04,Debit Card
TT-1038,Striped Seersucker Trousers,$95.00,2025-09-04,eWallet
TT-1039,Technical Performance Joggers,$75.00,2025-09-05,Cash
TT-1040,Slim-Fit Denim Jeans,$88.00,2025-09-05,Debit Card
TT-1040,Relaxed Fit Corduroy Trousers,$85.00,2025-09-05,eWallet
TT-1041,Classic Fit Chinos,$78.00,2025-09-06,Cash
TT-1042,Premium Tailored Trousers,$175.00,2025-09-06,Credit Card
TT-1043,Flannel-Lined Canvas Work Pants,$98.00,2025-09-07,Credit Card
TT-1044,Double-Pleated Khaki Trousers,$82.00,2025-09-08,Cash
TT-1045,Multi-Pocket Cargo Shorts,$58.00,2025-09-08,eWallet
TT-1046,Classic Denim Overalls,$115.00,2025-09-09,Cash
TT-1047,Tailored Wool Dress Trousers,$145.00,2025-09-09,eWallet
TT-1047,Classic Fit Chinos,$78.00,2025-09-09,Cash
TT-1048,Drawstring Linen Trousers,$92.00,2025-09-10,Credit Card
TT-1049,Slim-Fit Denim Jeans,$88.00,2025-09-10,Cash
TT-1050,Technical Performance Joggers,$75.00,2025-09-11,Debit Card
TT-1051,Striped Seersucker Trousers,$95.00,2025-09-12,Debit Card
TT-1052,Relaxed Fit Corduroy Trousers,$85.00,2025-09-12,eWallet
TT-1053,Premium Tailored Trousers,$175.00,2025-09-13,eWallet
TT-1054,Flannel-Lined Canvas Work Pants,$98.00,2025-09-13,Cash
TT-1054,Multi-Pocket Cargo Shorts,$58.00,2025-09-13,Credit Card
TT-1055,Double-Pleated Khaki Trousers,$82.00,2025-09-14,eWallet
TT-1056,Classic Fit Chinos,$78.00,2025-09-14,Debit Card
TT-1057,Slim-Fit Denim Jeans,$88.00,2025-09-15,eWallet
TT-1058,Classic Denim Overalls,$115.00,2025-09-16,Debit Card
TT-1059,Drawstring Linen Trousers,$92.00,2025-09-16,Debit Card
TT-1059,Technical Performance Joggers,$75.00,2025-09-16,Debit Card
TT-1060,Tailored Wool Dress Trousers,$145.00,2025-09-17,Cash
TT-1061,Striped Seersucker Trousers,$95.00,2025-09-17,Credit Card
TT-1062,Relaxed Fit Corduroy Trousers,$85.00,2025-09-18,eWallet
TT-1063,Premium Tailored Trousers,$175.00,2025-09-18,Credit Card
TT-1064,Slim-Fit Denim Jeans,$88.00,2025-09-19,Credit Card
TT-1065,Flannel-Lined Canvas Work Pants,$98.00,2025-09-19,eWallet
TT-1065,Classic Fit Chinos,$78.00,2025-09-19,eWallet
TT-1066,Double-Pleated Khaki Trousers,$82.00,2025-09-20,eWallet
TT-1067,Multi-Pocket Cargo Shorts,$58.00,2025-09-21,eWallet
TT-1068,Technical Performance Joggers,$75.00,2025-09-21,Credit Card
TT-1069,Classic Denim Overalls,$115.00,2025-09-22,eWallet
TT-1070,Drawstring Linen Trousers,$92.00,2025-09-22,Cash
TT-1071,Tailored Wool Dress Trousers,$145.00,2025-09-23,Credit Card
TT-1072,Slim-Fit Denim Jeans,$88.00,2025-09-23,eWallet
TT-1072,Striped Seersucker Trousers,$95.00,2025-09-23,eWallet
TT-1073,Relaxed Fit Corduroy Trousers,$85.00,2025-09-24,Credit Card
TT-1074,Classic Fit Chinos,$78.00,2025-09-24,Debit Card
TT-1075,Premium Tailored Trousers,$175.00,2025-09-25,Cash
TT-1076,Flannel-Lined Canvas Work Pants,$98.00,2025-09-26,Cash
TT-1077,Double-Pleated Khaki Trousers,$82.00,2025-09-26,Cash
TT-1078,Multi-Pocket Cargo Shorts,$58.00,2025-09-27,Cash
TT-1079,Technical Performance Joggers,$75.00,2025-09-27,Debit Card
TT-1079,Drawstring Linen Trousers,$92.00,2025-09-27,Cash
TT-1080,Classic Denim Overalls,$115.00,2025-09-28,Debit Card
TT-1081,Tailored Wool Dress Trousers,$145.00,2025-09-28,Cash
TT-1082,Slim-Fit Denim Jeans,$88.00,2025-09-29,Cash
TT-1083,Striped Seersucker Trousers,$95.00,2025-09-29,eWallet
TT-1084,Relaxed Fit Corduroy Trousers,$85.00,2025-09-30,eWallet
TT-1084,Classic Fit Chinos,$78.00,2025-09-30,Debit Card
TT-1085,Premium Tailored Trousers,$175.00,2025-10-01,Credit Card
TT-1086,Double-Pleated Khaki Trousers,$82.00,2025-10-01,Credit Card
TT-1087,Flannel-Lined Canvas Work Pants,$98.00,2025-10-02,eWallet
TT-1088,Technical Performance Joggers,$75.00,2025-10-02,Cash
TT-1089,Multi-Pocket Cargo Shorts,$58.00,2025-10-03,Credit Card
TT-1090,Drawstring Linen Trousers,$92.00,2025-10-03,Credit Card
TT-1091,Classic Denim Overalls,$115.00,2025-10-04,Cash
TT-1092,Tailored Wool Dress Trousers,$145.00,2025-10-04,Cash
TT-1092,Classic Fit Chinos,$78.00,2025-10-04,Debit Card
TT-1093,Slim-Fit Denim Jeans,$88.00,2025-10-05,Debit Card
TT-1094,Striped Seersucker Trousers,$95.00,2025-10-05,Cash
TT-1095,Relaxed Fit Corduroy Trousers,$85.00,2025-10-06,eWallet
TT-1096,Premium Tailored Trousers,$175.00,2025-10-06,Cash
TT-1097,Flannel-Lined Canvas Work Pants,$98.00,2025-10-07,Credit Card
TT-1097,Slim-Fit Denim Jeans,$88.00,2025-10-07,Debit Card
TT-1098,Double-Pleated Khaki Trousers,$82.00,2025-10-07,eWallet`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parsePriceValue(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function parseDateInfo(dateStr: string) {
  if (!dateStr) return { dayOfWeek: 'Unknown', month: 'Unknown' };
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return { dayOfWeek: 'Unknown', month: 'Unknown' };
    }
    const dayOfWeek = DAYS[d.getDay()];
    const month = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    return { dayOfWeek, month };
  } catch {
    return { dayOfWeek: 'Unknown', month: 'Unknown' };
  }
}

export function inferColumnMetadata(records: GenericRecord[]): ColumnMeta[] {
  if (!records || records.length === 0) return [];
  const keys = Object.keys(records[0]);

  return keys.map((key) => {
    let numericCount = 0;
    let dateCount = 0;
    const values: any[] = [];
    const uniqueVals = new Set<string>();

    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const val = records[i][key];
      if (val !== undefined && val !== null && val !== '') {
        values.push(val);
        uniqueVals.add(String(val));
        const numVal = parsePriceValue(val);
        if (typeof val === 'number' || (!isNaN(numVal) && !isNaN(Number(val)) && typeof val !== 'boolean')) {
          numericCount++;
        } else if (typeof val === 'string' && /^\$?\d+(\.\d{2})?$/.test(val.trim())) {
          numericCount++;
        } else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val.trim())) {
          dateCount++;
        }
      }
    }

    const sampleSize = Math.max(1, values.length);
    let type: 'string' | 'number' | 'date' = 'string';
    if (numericCount / sampleSize > 0.7) {
      type = 'number';
    } else if (dateCount / sampleSize > 0.7) {
      type = 'date';
    }

    let min: number | undefined;
    let max: number | undefined;
    if (type === 'number') {
      const nums = records
        .map((r) => parsePriceValue(r[key]))
        .filter((n) => !isNaN(n));
      if (nums.length > 0) {
        min = Math.min(...nums);
        max = Math.max(...nums);
      }
    }

    return {
      key,
      label: key,
      type,
      uniqueValues: uniqueVals.size <= 50 ? Array.from(uniqueVals) : undefined,
      min,
      max,
    };
  });
}

export function checkIsSaleSchema(records: GenericRecord[]): boolean {
  if (!records || records.length === 0) return false;
  const first = records[0];
  const keys = Object.keys(first).map((k) => k.toLowerCase().replace(/[\s_-]/g, ''));
  const hasProduct = keys.some((k) => k.includes('product') || k.includes('item'));
  const hasPrice = keys.some((k) => k.includes('price') || k.includes('amount') || k.includes('revenue') || k.includes('total'));
  const hasDate = keys.some((k) => k.includes('date'));
  return hasProduct && (hasPrice || hasDate);
}

export function normalizeToSaleRecords(records: GenericRecord[]): SaleRecord[] {
  if (!records || records.length === 0) return [];
  const keys = Object.keys(records[0]);

  // Find matching column names
  const orderKey = keys.find((k) => /order|invoice|id|txn|trans/i.test(k)) || keys[0];
  const productKey = keys.find((k) => /product|item|name|description/i.test(k)) || keys[1] || keys[0];
  const priceKey = keys.find((k) => /price|amount|revenue|cost|total/i.test(k)) || keys[2] || keys[0];
  const dateKey = keys.find((k) => /date|time|day|timestamp/i.test(k)) || keys[3] || keys[0];
  const paymentKey = keys.find((k) => /payment|method|pay|type|channel/i.test(k)) || keys[4] || keys[0];

  return records.map((r, idx) => {
    const rawPrice = r[priceKey];
    const numPrice = parsePriceValue(rawPrice);
    const dateStr = String(r[dateKey] || '');
    const { dayOfWeek, month } = parseDateInfo(dateStr);

    return {
      id: `rec-${idx}-${r[orderKey] || idx}`,
      orderNumber: String(r[orderKey] || `ORD-${idx + 1}`),
      product: String(r[productKey] || 'Unspecified Item'),
      price: numPrice,
      formattedPrice: `$${numPrice.toFixed(2)}`,
      date: dateStr,
      paymentMethod: String(r[paymentKey] || 'Standard'),
      dayOfWeek,
      month,
    };
  });
}

export function parseCSVData(csvString: string, datasetName = 'Uploaded Dataset'): DatasetInfo {
  const parsed = Papa.parse<GenericRecord>(csvString.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const records = parsed.data || [];
  const columns = inferColumnMetadata(records);
  const isSale = checkIsSaleSchema(records);

  return {
    name: datasetName,
    source: datasetName.includes('Provided') ? 'provided' : 'uploaded',
    timestamp: Date.now(),
    rowCount: records.length,
    columns,
    records,
    isSaleSchema: isSale,
  };
}

export function parseJSONData(jsonInput: string | any[], datasetName = 'Uploaded JSON'): DatasetInfo {
  let records: GenericRecord[] = [];
  if (typeof jsonInput === 'string') {
    const parsed = JSON.parse(jsonInput);
    if (Array.isArray(parsed)) {
      records = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // If object has an array property like "data", "rows", "records", "sales"
      const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrayKey) {
        records = parsed[arrayKey];
      } else {
        records = [parsed];
      }
    }
  } else if (Array.isArray(jsonInput)) {
    records = jsonInput;
  }

  const columns = inferColumnMetadata(records);
  const isSale = checkIsSaleSchema(records);

  return {
    name: datasetName,
    source: 'uploaded',
    timestamp: Date.now(),
    rowCount: records.length,
    columns,
    records,
    isSaleSchema: isSale,
  };
}

// Initial provided dataset setup
export const INITIAL_DATASET: DatasetInfo = parseCSVData(
  PROVIDED_RAW_CSV,
  'Provided Apparel Orders (107 Rows)'
);
