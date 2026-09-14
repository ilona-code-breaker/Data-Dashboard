import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ShoppingCart, Calendar, GitMerge, Layers, Clock } from 'lucide-react';
import { SaleRecord } from '../../types';

interface BasketViewProps {
  data: SaleRecord[];
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const BasketView: React.FC<BasketViewProps> = ({ data }) => {
  // Group by Order Number to analyze basket composition
  const basketAnalysis = useMemo(() => {
    const orderMap = new Map<
      string,
      {
        orderNumber: string;
        date: string;
        paymentMethod: string;
        items: string[];
        totalPrice: number;
      }
    >();

    data.forEach((item) => {
      if (!orderMap.has(item.orderNumber)) {
        orderMap.set(item.orderNumber, {
          orderNumber: item.orderNumber,
          date: item.date,
          paymentMethod: item.paymentMethod,
          items: [],
          totalPrice: 0,
        });
      }
      const ord = orderMap.get(item.orderNumber)!;
      ord.items.push(item.product);
      ord.totalPrice += item.price;
    });

    const orders = Array.from(orderMap.values());
    const singleItemOrders = orders.filter((o) => o.items.length === 1);
    const multiItemOrders = orders.filter((o) => o.items.length > 1);

    // Frequent item pairs (co-purchases)
    const pairMap = new Map<string, number>();
    multiItemOrders.forEach((ord) => {
      for (let i = 0; i < ord.items.length; i++) {
        for (let j = i + 1; j < ord.items.length; j++) {
          const pair = [ord.items[i], ord.items[j]].sort().join(' + ');
          pairMap.set(pair, (pairMap.get(pair) || 0) + 1);
        }
      }
    });

    const frequentPairs = Array.from(pairMap.entries())
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUniqueOrders: orders.length,
      singleItemCount: singleItemOrders.length,
      multiItemCount: multiItemOrders.length,
      singleItemRevenue: singleItemOrders.reduce((acc, o) => acc + o.totalPrice, 0),
      multiItemRevenue: multiItemOrders.reduce((acc, o) => acc + o.totalPrice, 0),
      multiItemOrders,
      frequentPairs,
    };
  }, [data]);

  // Day of Week Distribution
  const dayOfWeekData = useMemo(() => {
    const dayMap = new Map<string, { revenue: number; count: number }>();
    DAYS_ORDER.forEach((d) => dayMap.set(d, { revenue: 0, count: 0 }));

    data.forEach((item) => {
      if (item.dayOfWeek && dayMap.has(item.dayOfWeek)) {
        const cur = dayMap.get(item.dayOfWeek)!;
        cur.revenue += item.price;
        cur.count += 1;
      }
    });

    return DAYS_ORDER.map((day) => {
      const stats = dayMap.get(day) || { revenue: 0, count: 0 };
      return {
        day: day.slice(0, 3),
        fullDay: day,
        revenue: Math.round(stats.revenue),
        orders: stats.count,
      };
    });
  }, [data]);

  const basketPieData = [
    { name: 'Single Item Orders', count: basketAnalysis.singleItemCount, color: '#6366f1' },
    { name: 'Multi-Item Bundles (2+ Items)', count: basketAnalysis.multiItemCount, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Multi-Item Orders</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {basketAnalysis.multiItemCount}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              ({Math.round((basketAnalysis.multiItemCount / Math.max(1, basketAnalysis.totalUniqueOrders)) * 100)}% of orders)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Generated ${Math.round(basketAnalysis.multiItemRevenue).toLocaleString()} total revenue
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Single Item Orders</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {basketAnalysis.singleItemCount}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">
              ({Math.round((basketAnalysis.singleItemCount / Math.max(1, basketAnalysis.totalUniqueOrders)) * 100)}% of orders)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Generated ${Math.round(basketAnalysis.singleItemRevenue).toLocaleString()} total revenue
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Peak Sales Day</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {[...dayOfWeekData].sort((a, b) => b.revenue - a.revenue)[0]?.fullDay || 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Highest daily total revenue among all weekdays
          </p>
        </div>
      </div>

      {/* Two Column Layout: Day of Week & Basket Size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day of Week Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Revenue by Day of Week</h3>
                <p className="text-xs text-slate-500">Weekly sales rhythm and cyclic trends</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
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
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {dayOfWeekData.map((entry, idx) => (
                    <Cell
                      key={`day-${idx}`}
                      fill={entry.revenue === Math.max(...dayOfWeekData.map((d) => d.revenue)) ? '#4338ca' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Co-Purchased Bundles & Basket Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Frequently Co-Purchased Bundles</h3>
                  <p className="text-xs text-slate-500">Items bought together in the same order</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {basketAnalysis.frequentPairs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No multi-item orders found in current filter</p>
              ) : (
                basketAnalysis.frequentPairs.map((p, idx) => (
                  <div
                    key={p.pair}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{p.pair}</span>
                    </div>
                    <span className="font-semibold text-indigo-600 shrink-0 ml-2">
                      {p.count}x bundle
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Multi-item Order Count</span>
            <strong className="text-slate-800">{basketAnalysis.multiItemOrders.length} orders</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
