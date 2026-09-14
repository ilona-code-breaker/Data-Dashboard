import React from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  CreditCard, 
  Tag, 
  RotateCcw,
  Check
} from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availablePaymentMethods: string[];
  availableProducts: string[];
  dateBounds: { min: string; max: string };
  isSaleSchema: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availablePaymentMethods,
  availableProducts,
  dateBounds,
  isSaleSchema,
}) => {
  const [showProductDropdown, setShowProductDropdown] = React.useState(false);
  const [productSearch, setProductSearch] = React.useState('');

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.selectedPaymentMethods.length > 0 ||
    filters.selectedProducts.length > 0 ||
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '';

  const togglePaymentMethod = (method: string) => {
    const current = filters.selectedPaymentMethods;
    const exists = current.includes(method);
    const updated = exists 
      ? current.filter((m) => m !== method) 
      : [...current, method];
    onFilterChange({ selectedPaymentMethods: updated });
  };

  const toggleProduct = (product: string) => {
    const current = filters.selectedProducts;
    const exists = current.includes(product);
    const updated = exists 
      ? current.filter((p) => p !== product) 
      : [...current, product];
    onFilterChange({ selectedProducts: updated });
  };

  const handleDatePreset = (preset: 'all' | 'aug' | 'sep' | 'oct') => {
    if (preset === 'all') {
      onFilterChange({ dateRange: { start: '', end: '' } });
    } else if (preset === 'aug') {
      onFilterChange({ dateRange: { start: '2025-08-01', end: '2025-08-31' } });
    } else if (preset === 'sep') {
      onFilterChange({ dateRange: { start: '2025-09-01', end: '2025-09-30' } });
    } else if (preset === 'oct') {
      onFilterChange({ dateRange: { start: '2025-10-01', end: '2025-10-31' } });
    }
  };

  const filteredProductOptions = availableProducts.filter((p) =>
    p.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Filter Row: Search & Quick Presets */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search by order #, product, or keyword..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline:</span>
            </span>
            <button
              id="date-filter-all"
              onClick={() => handleDatePreset('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filters.dateRange.start === '' && filters.dateRange.end === ''
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              All Data
            </button>
            <button
              id="date-filter-aug"
              onClick={() => handleDatePreset('aug')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filters.dateRange.start === '2025-08-01'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Aug 2025
            </button>
            <button
              id="date-filter-sep"
              onClick={() => handleDatePreset('sep')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filters.dateRange.start === '2025-09-01'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Sep 2025
            </button>
            <button
              id="date-filter-oct"
              onClick={() => handleDatePreset('oct')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filters.dateRange.start === '2025-10-01'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Oct 2025
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200/60 transition-colors self-start md:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Second Row: Payment Methods & Product Dropdown (if Sales schema) */}
        {isSaleSchema && (
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
            {/* Payment Method Chips */}
            {availablePaymentMethods.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-slate-500 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment:</span>
                </span>
                {availablePaymentMethods.map((method) => {
                  const isSelected = filters.selectedPaymentMethods.includes(method);
                  return (
                    <button
                      key={method}
                      id={`filter-payment-${method.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => togglePaymentMethod(method)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{method}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Product Selector Dropdown */}
            {availableProducts.length > 0 && (
              <div className="relative">
                <button
                  id="product-dropdown-toggle"
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    filters.selectedProducts.length > 0
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {filters.selectedProducts.length === 0
                      ? 'Filter by Product'
                      : `${filters.selectedProducts.length} Products selected`}
                  </span>
                </button>

                {showProductDropdown && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40">
                    <div className="p-1 mb-2 border-b border-slate-100">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {filteredProductOptions.map((p) => {
                        const isChecked = filters.selectedProducts.includes(p);
                        return (
                          <label
                            key={p}
                            className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleProduct(p)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{p}</span>
                          </label>
                        );
                      })}
                    </div>
                    {filters.selectedProducts.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => onFilterChange({ selectedProducts: [] })}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          Clear Product Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
