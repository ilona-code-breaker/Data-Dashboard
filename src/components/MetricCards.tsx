import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  TrendingUp, 
  Tag, 
  CreditCard 
} from 'lucide-react';

interface MetricCardsProps {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrders: number;
  averageOrderValue: number;
  averageItemPrice: number;
  topProduct: { name: string; revenue: number } | null;
  topPaymentMethod: { name: string; count: number } | null;
  isSaleSchema: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalRevenue,
  totalUnits,
  uniqueOrders,
  averageOrderValue,
  averageItemPrice,
  topProduct,
  topPaymentMethod,
  isSaleSchema,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Gross Revenue */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            {isSaleSchema ? 'Total Revenue' : 'Numeric Sum'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Across {totalUnits.toLocaleString()} recorded entries
        </p>
      </div>

      {/* Units / Line Items */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            {isSaleSchema ? 'Items Sold' : 'Record Count'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {totalUnits.toLocaleString()}
          </span>
          {uniqueOrders > 0 && uniqueOrders !== totalUnits && (
            <span className="text-xs text-slate-500 ml-1">
              in {uniqueOrders} orders
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Avg {(totalUnits / Math.max(1, uniqueOrders)).toFixed(2)} items / order
        </p>
      </div>

      {/* Average Order Value (AOV) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            {isSaleSchema ? 'Avg. Order Value (AOV)' : 'Average Value'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ${averageOrderValue.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Avg item price: ${averageItemPrice.toFixed(2)}
        </p>
      </div>

      {/* Top Product / Category */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Top Seller</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 block truncate" title={topProduct?.name || 'N/A'}>
            {topProduct?.name || 'N/A'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate">
          <span>${topProduct?.revenue.toLocaleString() ?? 0} gross</span>
          {topPaymentMethod && (
            <>
              <span>•</span>
              <span className="truncate">{topPaymentMethod.name}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
