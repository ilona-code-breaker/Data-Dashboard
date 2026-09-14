import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Tag, ArrowUpDown, Filter, DollarSign, Package } from 'lucide-react';
import { SaleRecord } from '../../types';

interface ProductViewProps {
  data: SaleRecord[];
}

export const ProductView: React.FC<ProductViewProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'units' | 'price'>('revenue');

  // Aggregated product statistics
  const productStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        revenue: number;
        units: number;
        prices: number[];
      }
    >();

    data.forEach((item) => {
      const current = map.get(item.product) || {
        name: item.product,
        revenue: 0,
        units: 0,
        prices: [],
      };
      map.set(item.product, {
        name: item.product,
        revenue: current.revenue + item.price,
        units: current.units + 1,
        prices: [...current.prices, item.price],
      });
    });

    const totalRev = data.reduce((acc, r) => acc + r.price, 0);

    const list = Array.from(map.values()).map((p) => {
      const unitPrice = p.prices[0] || (p.revenue / p.units);
      const share = totalRev > 0 ? (p.revenue / totalRev) * 100 : 0;
      return {
        ...p,
        unitPrice,
        share: Math.round(share * 10) / 10,
      };
    });

    if (sortBy === 'revenue') {
      list.sort((a, b) => b.revenue - a.revenue);
    } else if (sortBy === 'units') {
      list.sort((a, b) => b.units - a.units);
    } else {
      list.sort((a, b) => b.unitPrice - a.unitPrice);
    }

    return list;
  }, [data, sortBy]);

  // Price tier breakdown
  const priceTiers = useMemo(() => {
    let under70 = 0;
    let tier70to90 = 0;
    let tier90to120 = 0;
    let over120 = 0;

    data.forEach((item) => {
      if (item.price < 70) under70 += item.price;
      else if (item.price <= 90) tier70to90 += item.price;
      else if (item.price <= 120) tier90to120 += item.price;
      else over120 += item.price;
    });

    return [
      { name: 'Under $70', revenue: Math.round(under70), color: '#06b6d4' },
      { name: '$70 - $90', revenue: Math.round(tier70to90), color: '#4f46e5' },
      { name: '$91 - $120', revenue: Math.round(tier90to120), color: '#10b981' },
      { name: '$120+', revenue: Math.round(over120), color: '#f59e0b' },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Product Performance Matrix</h3>
          <p className="text-xs text-slate-500">Compare individual apparel items by revenue yield, unit velocity, and price point</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <button
            id="sort-product-rev"
            onClick={() => setSortBy('revenue')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'revenue'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Revenue
          </button>
          <button
            id="sort-product-units"
            onClick={() => setSortBy('units')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'units'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Units Sold
          </button>
          <button
            id="sort-product-price"
            onClick={() => setSortBy('price')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'price'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Unit Price
          </button>
        </div>
      </div>

      {/* Horizontal Bar Chart for Product Rankings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
          All Products Ranked ({productStats.length} Total Items)
        </h4>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productStats}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `$${val}`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155' }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                {productStats.map((entry, idx) => (
                  <Cell
                    key={`bar-${idx}`}
                    fill={idx === 0 ? '#4338ca' : idx < 3 ? '#4f46e5' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Price Tiers & Product Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Tier Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Revenue by Price Tier</h4>
              <p className="text-xs text-slate-500">Volume distribution across price brackets</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {priceTiers.map((tier) => {
              const totalTierRev = priceTiers.reduce((acc, t) => acc + t.revenue, 0);
              const pct = totalTierRev > 0 ? Math.round((tier.revenue / totalTierRev) * 100) : 0;
              return (
                <div key={tier.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{tier.name}</span>
                    <span className="font-semibold text-slate-900">
                      ${tier.revenue.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: tier.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Product Statistics Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Itemized Metrics Table</h4>
                <p className="text-xs text-slate-500">Unit pricing and contribution share</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Product Name</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Price</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Units Sold</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Total Revenue</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {productStats.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2 text-slate-800 font-sans font-medium flex items-center gap-2">
                      <span className="w-4 text-slate-400 text-[10px]">{idx + 1}.</span>
                      <span className="truncate">{item.name}</span>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700 font-semibold">
                      {item.units}
                    </td>
                    <td className="px-3 py-2 text-right text-indigo-600 font-semibold">
                      ${item.revenue.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {item.share}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
