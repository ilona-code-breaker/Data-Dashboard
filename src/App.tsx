/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  BarChart2, 
  TrendingUp, 
  Tag, 
  CreditCard, 
  ShoppingBag, 
  Sliders, 
  Table as TableIcon,
  Upload,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  DatasetInfo, 
  FilterState, 
  SaleRecord 
} from './types';
import { 
  INITIAL_DATASET, 
  normalizeToSaleRecords, 
  parsePriceValue, 
  parseCSVData, 
  parseJSONData 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MetricCards } from './components/MetricCards';
import { UploadModal } from './components/UploadModal';
import { OverviewView } from './components/views/OverviewView';
import { ProductView } from './components/views/ProductView';
import { PaymentView } from './components/views/PaymentView';
import { BasketView } from './components/views/BasketView';
import { CustomChartView } from './components/views/CustomChartView';
import { DataTableView } from './components/views/DataTableView';

type TabView = 'overview' | 'products' | 'payments' | 'basket' | 'studio' | 'table';

export default function App() {
  const [dataset, setDataset] = useState<DatasetInfo>(INITIAL_DATASET);
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    selectedPaymentMethods: [],
    selectedProducts: [],
    priceRange: [0, 1000],
    searchQuery: '',
  });

  // Global Drag and Drop support
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const isCsv = file.name.endsWith('.csv');
        const isJson = file.name.endsWith('.json');
        if (isCsv || isJson) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const content = evt.target?.result as string;
            if (content) {
              const newDs = isCsv
                ? parseCSVData(content, file.name)
                : parseJSONData(content, file.name);
              setDataset(newDs);
              resetFilters();
            }
          };
          reader.readAsText(file);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Normalized sale records if schema matches
  const saleRecords = useMemo(() => {
    return normalizeToSaleRecords(dataset.records);
  }, [dataset]);

  // Available unique values for filter controls
  const availablePaymentMethods = useMemo(() => {
    const set = new Set<string>();
    saleRecords.forEach((r) => {
      if (r.paymentMethod) set.add(r.paymentMethod);
    });
    return Array.from(set);
  }, [saleRecords]);

  const availableProducts = useMemo(() => {
    const set = new Set<string>();
    saleRecords.forEach((r) => {
      if (r.product) set.add(r.product);
    });
    return Array.from(set);
  }, [saleRecords]);

  const dateBounds = useMemo(() => {
    if (!saleRecords.length) return { min: '', max: '' };
    const dates = saleRecords.map((r) => r.date).filter(Boolean).sort();
    return { min: dates[0] || '', max: dates[dates.length - 1] || '' };
  }, [saleRecords]);

  // Filter application
  const filteredSaleRecords = useMemo(() => {
    return saleRecords.filter((r) => {
      // Date range filter
      if (filters.dateRange.start && r.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && r.date > filters.dateRange.end) return false;

      // Payment methods filter
      if (
        filters.selectedPaymentMethods.length > 0 &&
        !filters.selectedPaymentMethods.includes(r.paymentMethod)
      ) {
        return false;
      }

      // Products filter
      if (
        filters.selectedProducts.length > 0 &&
        !filters.selectedProducts.includes(r.product)
      ) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesOrder = r.orderNumber.toLowerCase().includes(q);
        const matchesProduct = r.product.toLowerCase().includes(q);
        const matchesPayment = r.paymentMethod.toLowerCase().includes(q);
        const matchesDate = r.date.toLowerCase().includes(q);
        if (!matchesOrder && !matchesProduct && !matchesPayment && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [saleRecords, filters]);

  // Filtered generic records (for custom chart studio & raw data table)
  const filteredGenericRecords = useMemo(() => {
    if (!filters.searchQuery && !filters.dateRange.start && !filters.dateRange.end && !filters.selectedPaymentMethods.length && !filters.selectedProducts.length) {
      return dataset.records;
    }

    // If sale schema, match filtered IDs
    if (dataset.isSaleSchema) {
      const allowedIndices = new Set(
        filteredSaleRecords.map((r) => {
          const parts = r.id.split('-');
          return parseInt(parts[1], 10);
        })
      );
      return dataset.records.filter((_, idx) => allowedIndices.has(idx));
    }

    // Generic fallback filter by search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return dataset.records.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return dataset.records;
  }, [dataset, filteredSaleRecords, filters]);

  // Computed KPIs
  const kpis = useMemo(() => {
    const totalRev = filteredSaleRecords.reduce((acc, r) => acc + r.price, 0);
    const totalUnits = filteredSaleRecords.length;
    const uniqueOrders = new Set(filteredSaleRecords.map((r) => r.orderNumber)).size;
    const aov = uniqueOrders > 0 ? totalRev / uniqueOrders : 0;
    const avgPrice = totalUnits > 0 ? totalRev / totalUnits : 0;

    // Top product
    const productRevMap = new Map<string, number>();
    filteredSaleRecords.forEach((r) => {
      productRevMap.set(r.product, (productRevMap.get(r.product) || 0) + r.price);
    });
    let topProd: { name: string; revenue: number } | null = null;
    let maxRev = -1;
    productRevMap.forEach((rev, name) => {
      if (rev > maxRev) {
        maxRev = rev;
        topProd = { name, revenue: Math.round(rev) };
      }
    });

    // Top payment method
    const paymentMap = new Map<string, number>();
    filteredSaleRecords.forEach((r) => {
      paymentMap.set(r.paymentMethod, (paymentMap.get(r.paymentMethod) || 0) + 1);
    });
    let topPay: { name: string; count: number } | null = null;
    let maxPay = -1;
    paymentMap.forEach((count, name) => {
      if (count > maxPay) {
        maxPay = count;
        topPay = { name, count };
      }
    });

    return {
      totalRevenue: totalRev,
      totalUnits,
      uniqueOrders,
      averageOrderValue: aov,
      averageItemPrice: avgPrice,
      topProduct: topProd,
      topPaymentMethod: topPay,
    };
  }, [filteredSaleRecords]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: { start: '', end: '' },
      selectedPaymentMethods: [],
      selectedProducts: [],
      priceRange: [0, 1000],
      searchQuery: '',
    });
  }, []);

  const handleApplyDataset = useCallback((newDataset: DatasetInfo) => {
    setDataset(newDataset);
    resetFilters();
    setActiveTab('overview');
  }, [resetFilters]);

  const handleResetToDefault = useCallback(() => {
    setDataset(INITIAL_DATASET);
    resetFilters();
    setActiveTab('overview');
  }, [resetFilters]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const csvContent = Papa.unparse(filteredGenericRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredGenericRecords, dataset.name]);

  const handleExportJSON = useCallback(() => {
    const jsonString = JSON.stringify(filteredGenericRecords, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_filtered.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredGenericRecords, dataset.name]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-800">
      {/* Navigation Header */}
      <Navbar
        dataset={dataset}
        filteredCount={filteredGenericRecords.length}
        totalCount={dataset.records.length}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetToDefault={handleResetToDefault}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* Global Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        availablePaymentMethods={availablePaymentMethods}
        availableProducts={availableProducts}
        dateBounds={dateBounds}
        isSaleSchema={dataset.isSaleSchema}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top KPI Metrics Cards */}
        <MetricCards
          totalRevenue={kpis.totalRevenue}
          totalUnits={kpis.totalUnits}
          uniqueOrders={kpis.uniqueOrders}
          averageOrderValue={kpis.averageOrderValue}
          averageItemPrice={kpis.averageItemPrice}
          topProduct={kpis.topProduct}
          topPaymentMethod={kpis.topPaymentMethod}
          isSaleSchema={dataset.isSaleSchema}
        />

        {/* View Mode Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              id="tab-view-overview"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Trends</span>
            </button>

            {dataset.isSaleSchema && (
              <>
                <button
                  id="tab-view-products"
                  onClick={() => setActiveTab('products')}
                  className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                    activeTab === 'products'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Product Breakdown</span>
                </button>

                <button
                  id="tab-view-payments"
                  onClick={() => setActiveTab('payments')}
                  className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                    activeTab === 'payments'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Analysis</span>
                </button>

                <button
                  id="tab-view-basket"
                  onClick={() => setActiveTab('basket')}
                  className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                    activeTab === 'basket'
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Basket & Timing</span>
                </button>
              </>
            )}

            <button
              id="tab-view-studio"
              onClick={() => setActiveTab('studio')}
              className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'studio'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Chart Studio</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                Universal
              </span>
            </button>

            <button
              id="tab-view-table"
              onClick={() => setActiveTab('table')}
              className={`py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === 'table'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Raw Data</span>
              <span className="text-[11px] font-mono text-slate-400">
                ({filteredGenericRecords.length})
              </span>
            </button>
          </nav>
        </div>

        {/* View Switcher Container */}
        <div>
          {activeTab === 'overview' && (
            <OverviewView data={filteredSaleRecords} />
          )}

          {activeTab === 'products' && (
            <ProductView data={filteredSaleRecords} />
          )}

          {activeTab === 'payments' && (
            <PaymentView data={filteredSaleRecords} />
          )}

          {activeTab === 'basket' && (
            <BasketView data={filteredSaleRecords} />
          )}

          {activeTab === 'studio' && (
            <CustomChartView
              records={filteredGenericRecords}
              columns={dataset.columns}
            />
          )}

          {activeTab === 'table' && (
            <DataTableView
              records={filteredGenericRecords}
              columns={dataset.columns}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
            />
          )}
        </div>
      </main>

      {/* Upload CSV / JSON Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={handleApplyDataset}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Loaded dataset: <span className="font-semibold text-slate-700">{dataset.name}</span> ({dataset.records.length} records)
          </div>
          <div className="flex items-center gap-3">
            <span>Supports drag-and-drop CSV & JSON file uploads</span>
            <span>•</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Upload New File
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
