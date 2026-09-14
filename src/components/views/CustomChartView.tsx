import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  Sliders, 
  BarChart3, 
  LineChart as LineIcon, 
  PieChart as PieIcon, 
  AreaChart as AreaIcon,
  Compass,
  ArrowDownUp,
  Download,
  Eye
} from 'lucide-react';
import { ColumnMeta, GenericRecord } from '../../types';
import { parsePriceValue } from '../../data/initialData';

interface CustomChartViewProps {
  records: GenericRecord[];
  columns: ColumnMeta[];
}

const PALETTE = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#f97316', // orange
];

export const CustomChartView: React.FC<CustomChartViewProps> = ({ records, columns }) => {
  // Determine suitable default columns
  const defaultCategoryCol = 
    columns.find((c) => c.key.toLowerCase().includes('product') || c.key.toLowerCase().includes('name'))?.key ||
    columns.find((c) => c.type === 'string')?.key ||
    columns[0]?.key || '';

  const defaultNumericCol = 
    columns.find((c) => c.key.toLowerCase().includes('price') || c.key.toLowerCase().includes('amount') || c.key.toLowerCase().includes('total'))?.key ||
    columns.find((c) => c.type === 'number')?.key ||
    '';

  const [xAxisKey, setXAxisKey] = useState<string>(defaultCategoryCol);
  const [metricKey, setMetricKey] = useState<string>(defaultNumericCol);
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'min' | 'max'>('sum');
  const [chartType, setChartType] = useState<'bar' | 'hbar' | 'line' | 'area' | 'pie' | 'radar'>('bar');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [limit, setLimit] = useState<number>(10);

  // Compute aggregated data
  const aggregatedData = useMemo(() => {
    if (!records.length || !xAxisKey) return [];

    const groupMap = new Map<string, number[]>();

    records.forEach((row) => {
      const xVal = String(row[xAxisKey] ?? 'Unknown');
      const numVal = metricKey ? parsePriceValue(row[metricKey]) : 1;

      if (!groupMap.has(xVal)) {
        groupMap.set(xVal, []);
      }
      groupMap.get(xVal)!.push(numVal);
    });

    const result = Array.from(groupMap.entries()).map(([label, values]) => {
      let val = 0;
      if (aggregation === 'count') {
        val = values.length;
      } else if (aggregation === 'sum') {
        val = values.reduce((a, b) => a + b, 0);
      } else if (aggregation === 'avg') {
        val = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      } else if (aggregation === 'min') {
        val = values.length ? Math.min(...values) : 0;
      } else if (aggregation === 'max') {
        val = values.length ? Math.max(...values) : 0;
      }

      return {
        label,
        value: Math.round(val * 100) / 100,
        count: values.length,
      };
    });

    if (sortOrder === 'desc') {
      result.sort((a, b) => b.value - a.value);
    } else {
      result.sort((a, b) => a.value - b.value);
    }

    return limit > 0 ? result.slice(0, limit) : result;
  }, [records, xAxisKey, metricKey, aggregation, sortOrder, limit]);

  const metricLabel = aggregation === 'count' 
    ? 'Record Count' 
    : `${aggregation.toUpperCase()} of ${metricKey || 'Value'}`;

  return (
    <div className="space-y-6">
      {/* Interactive Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Custom Chart Studio</h3>
              <p className="text-xs text-slate-500">Configure custom axes, aggregation logic, and chart styles</p>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              id="chart-type-bar"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'bar' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar
            </button>
            <button
              id="chart-type-hbar"
              onClick={() => setChartType('hbar')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'hbar' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 rotate-90" /> H-Bar
            </button>
            <button
              id="chart-type-line"
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'line' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" /> Line
            </button>
            <button
              id="chart-type-area"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'area' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AreaIcon className="w-3.5 h-3.5" /> Area
            </button>
            <button
              id="chart-type-pie"
              onClick={() => setChartType('pie')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'pie' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" /> Donut
            </button>
            <button
              id="chart-type-radar"
              onClick={() => setChartType('radar')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                chartType === 'radar' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Radar
            </button>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Dimension (X-Axis) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Dimension (Category)
            </label>
            <select
              id="select-custom-xaxis"
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              {columns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Field */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Value Field
            </label>
            <select
              id="select-custom-metric"
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              disabled={aggregation === 'count'}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 disabled:opacity-50"
            >
              {columns
                .filter((c) => c.type === 'number' || c.key.toLowerCase().includes('price'))
                .map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              {/* Fallback to all if no numeric columns */}
              {columns
                .filter((c) => c.type !== 'number' && !c.key.toLowerCase().includes('price'))
                .map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Aggregation Function */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Aggregation
            </label>
            <select
              id="select-custom-aggregation"
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value="sum">Sum (Total)</option>
              <option value="avg">Average (Mean)</option>
              <option value="count">Count of Records</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sort Order
            </label>
            <select
              id="select-custom-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value="desc">Highest First (Descending)</option>
              <option value="asc">Lowest First (Ascending)</option>
            </select>
          </div>

          {/* Item Limit */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Items to Display
            </label>
            <select
              id="select-custom-limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={25}>Top 25</option>
              <option value={0}>All Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">
              {metricLabel} by {xAxisKey}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({aggregatedData.length} data points)
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={aggregatedData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {aggregatedData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === 'hbar' ? (
              <BarChart data={aggregatedData} layout="vertical" margin={{ top: 10, right: 20, left: 100, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {aggregatedData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={aggregatedData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={aggregatedData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                <defs>
                  <linearGradient id="customAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="url(#customAreaGrad)" />
              </AreaChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={aggregatedData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {aggregatedData.map((_, index) => (
                    <Cell key={`slice-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), metricLabel]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            ) : (
              <RadarChart data={aggregatedData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name={metricLabel} dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregate Data Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Aggregated Data Table
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            {aggregatedData.length} grouped rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">#</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">{xAxisKey}</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">{metricLabel}</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">Sample Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {aggregatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2 text-slate-800 font-sans font-medium">{row.label}</td>
                  <td className="px-3 py-2 text-right text-indigo-600 font-semibold">
                    {row.value.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
