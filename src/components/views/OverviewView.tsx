import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Layers, Calendar } from 'lucide-react';
import { SaleRecord } from '../../types';

interface OverviewViewProps {
  data: SaleRecord[];
}

const COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
];

export const OverviewView: React.FC<OverviewViewProps> = ({ data }) => {
  const [timelineMode, setTimelineMode] = useState<'daily' | 'weekly' | 'cumulative'>('daily');

  // Timeline aggregation
  const timelineData = useMemo(() => {
    if (!data.length) return [];

    // Sort by date ascending
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    if (timelineMode === 'cumulative') {
      let runTotal = 0;
      const map = new Map<string, number>();
      sorted.forEach((item) => {
        runTotal += item.price;
        map.set(item.date, runTotal);
      });
      return Array.from(map.entries()).map(([date, cumulative]) => ({
        date: date.slice(5), // MM-DD
        fullDate: date,
        revenue: Math.round(cumulative * 100) / 100,
      }));
    }

    if (timelineMode === 'weekly') {
      const weeklyMap = new Map<string, { revenue: number; count: number }>();
      sorted.forEach((item) => {
        // Group by week starting date
        const d = new Date(item.date + 'T00:00:00');
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(d.setDate(diff));
        const weekKey = monday.toISOString().slice(5, 10);

        const current = weeklyMap.get(weekKey) || { revenue: 0, count: 0 };
        weeklyMap.set(weekKey, {
          revenue: current.revenue + item.price,
          count: current.count + 1,
        });
      });
      return Array.from(weeklyMap.entries()).map(([week, stats]) => ({
        date: `Wk of ${week}`,
        fullDate: `Week of ${week}`,
        revenue: Math.round(stats.revenue * 100) / 100,
        orders: stats.count,
      }));
    }

    // Daily mode
    const dailyMap = new Map<string, { revenue: number; count: number }>();
    sorted.forEach((item) => {
      const current = dailyMap.get(item.date) || { revenue: 0, count: 0 };
      dailyMap.set(item.date, {
        revenue: current.revenue + item.price,
        count: current.count + 1,
      });
    });

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date: date.slice(5),
      fullDate: date,
      revenue: Math.round(stats.revenue * 100) / 100,
      orders: stats.count,
    }));
  }, [data, timelineMode]);

  // Product revenue aggregation
  const productData = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();
    data.forEach((item) => {
      const current = map.get(item.product) || { revenue: 0, count: 0 };
      map.set(item.product, {
        revenue: current.revenue + item.price,
        count: current.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        revenue: Math.round(stats.revenue),
        count: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  // Payment method share
  const paymentShareData = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();
    data.forEach((item) => {
      const current = map.get(item.paymentMethod) || { revenue: 0, count: 0 };
      map.set(item.paymentMethod, {
        revenue: current.revenue + item.price,
        count: current.count + 1,
      });
    });

    const totalRev = data.reduce((acc, r) => acc + r.price, 0);

    return Array.from(map.entries())
      .map(([method, stats]) => ({
        name: method,
        revenue: Math.round(stats.revenue),
        count: stats.count,
        percent: totalRev > 0 ? Math.round((stats.revenue / totalRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top Main Timeline Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue Performance Over Time</h3>
              <p className="text-xs text-slate-500">Track daily fluctuations, weekly aggregates, or cumulative revenue trajectory</p>
            </div>
          </div>

          {/* Timeline toggle buttons */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              id="timeline-btn-daily"
              onClick={() => setTimelineMode('daily')}
              className={`px-3 py-1 rounded-md transition-all ${
                timelineMode === 'daily'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              id="timeline-btn-weekly"
              onClick={() => setTimelineMode('weekly')}
              className={`px-3 py-1 rounded-md transition-all ${
                timelineMode === 'weekly'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              id="timeline-btn-cumulative"
              onClick={() => setTimelineMode('cumulative')}
              className={`px-3 py-1 rounded-md transition-all ${
                timelineMode === 'cumulative'
                  ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revGrad)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Product Revenue & Payment Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Revenue Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Revenue by Product</h3>
                  <p className="text-xs text-slate-500">Ranked by total revenue</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {productData.length} products
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData.slice(0, 8)} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {productData.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Share Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Payment Method Distribution</h3>
                  <p className="text-xs text-slate-500">Share of total transactions & volume</p>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentShareData}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {paymentShareData.map((_, index) => (
                      <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Breakdown List */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              {paymentShareData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 ml-2">
                    {item.percent}% (${item.revenue.toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
