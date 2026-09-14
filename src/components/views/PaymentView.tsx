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
  Legend,
} from 'recharts';
import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { SaleRecord } from '../../types';

interface PaymentViewProps {
  data: SaleRecord[];
}

const COLORS: Record<string, string> = {
  'Credit Card': '#4f46e5', // indigo
  'eWallet': '#06b6d4',    // cyan
  'Debit Card': '#10b981', // emerald
  'Cash': '#f59e0b',       // amber
};

const FALLBACK_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'];

export const PaymentView: React.FC<PaymentViewProps> = ({ data }) => {
  // Method metrics
  const methodStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        revenue: number;
        count: number;
        prices: number[];
      }
    >();

    data.forEach((item) => {
      const current = map.get(item.paymentMethod) || {
        name: item.paymentMethod,
        revenue: 0,
        count: 0,
        prices: [],
      };
      map.set(item.paymentMethod, {
        name: item.paymentMethod,
        revenue: current.revenue + item.price,
        count: current.count + 1,
        prices: [...current.prices, item.price],
      });
    });

    const totalRev = data.reduce((acc, r) => acc + r.price, 0);

    return Array.from(map.values()).map((m) => ({
      ...m,
      avgTicket: m.count > 0 ? m.revenue / m.count : 0,
      share: totalRev > 0 ? Math.round((m.revenue / totalRev) * 100) : 0,
      color: COLORS[m.name] || FALLBACK_COLORS[0],
    })).sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  // Method over time (grouped by week)
  const timeMethodData = useMemo(() => {
    const weekMap = new Map<string, Record<string, number>>();

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((item) => {
      const d = new Date(item.date + 'T00:00:00');
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const weekLabel = `Wk ${monday.toISOString().slice(5, 10)}`;

      if (!weekMap.has(weekLabel)) {
        weekMap.set(weekLabel, {
          'Credit Card': 0,
          'eWallet': 0,
          'Debit Card': 0,
          'Cash': 0,
        });
      }
      const record = weekMap.get(weekLabel)!;
      record[item.paymentMethod] = (record[item.paymentMethod] || 0) + item.price;
    });

    return Array.from(weekMap.entries()).map(([week, methods]) => ({
      week,
      ...methods,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* KPI Cards per payment method */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {methodStats.map((method) => {
          let Icon = CreditCard;
          if (method.name.toLowerCase().includes('wallet')) Icon = Wallet;
          if (method.name.toLowerCase().includes('cash')) Icon = Banknote;
          if (method.name.toLowerCase().includes('debit')) Icon = ShieldCheck;

          return (
            <div key={method.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{method.name}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: method.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  ${method.revenue.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>{method.count} transactions</span>
                <span className="font-semibold text-slate-700">{method.share}% share</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Avg Ticket: <strong className="text-slate-800">${method.avgTicket.toFixed(2)}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Revenue Timeline by Payment Method */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Weekly Revenue by Payment Method</h3>
              <p className="text-xs text-slate-500">Stacked breakdown showing volume shifts over time</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeMethodData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Credit Card" stackId="a" fill={COLORS['Credit Card']} />
                <Bar dataKey="eWallet" stackId="a" fill={COLORS['eWallet']} />
                <Bar dataKey="Debit Card" stackId="a" fill={COLORS['Debit Card']} />
                <Bar dataKey="Cash" stackId="a" fill={COLORS['Cash']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Order Value by Payment Method Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Average Transaction Ticket Size</h3>
              <p className="text-xs text-slate-500">How much customers spend when using each payment method</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodStats} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Avg Ticket']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgTicket" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {methodStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
