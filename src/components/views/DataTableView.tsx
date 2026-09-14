import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { ColumnMeta, GenericRecord } from '../../types';
import { parsePriceValue } from '../../data/initialData';

interface DataTableViewProps {
  records: GenericRecord[];
  columns: ColumnMeta[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({
  records,
  columns,
  onExportCSV,
  onExportJSON,
}) => {
  const [sortColumn, setSortColumn] = useState<string>(columns[0]?.key || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Filter records by table search
  const filteredRecords = useMemo(() => {
    if (!tableSearch.trim()) return records;
    const q = tableSearch.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [records, tableSearch]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortColumn) return filteredRecords;

    const colMeta = columns.find((c) => c.key === sortColumn);
    const isNumeric = colMeta?.type === 'number' || sortColumn.toLowerCase().includes('price');

    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (isNumeric) {
        const numA = parsePriceValue(valA);
        const numB = parsePriceValue(valB);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredRecords, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, safePage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Quick search table rows..."
            value={tableSearch}
            onChange={(e) => {
              setTableSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-64"
          />
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredRecords.length}</strong> of {records.length} records
          </span>
        </div>

        {/* Page size & export */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={onExportJSON}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider w-12">
                #
              </th>
              {columns.map((col) => {
                const isCurrent = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-2.5 text-left font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {isCurrent ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 hover:opacity-100" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-slate-400 font-sans">
                  No records match the current filter.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const rowNum = (safePage - 1) * pageSize + idx + 1;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2 text-slate-400 text-[11px]">{rowNum}</td>
                    {columns.map((col) => {
                      const val = row[col.key];
                      const isPrice = col.key.toLowerCase().includes('price') || col.key.toLowerCase().includes('revenue');
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-2 truncate max-w-xs ${
                            isPrice ? 'text-indigo-600 font-semibold' : 'text-slate-800'
                          }`}
                        >
                          {String(val ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/40">
        <div>
          Page <strong className="text-slate-900">{safePage}</strong> of{' '}
          <strong className="text-slate-900">{totalPages}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-700 px-2">
            {(safePage - 1) * pageSize + 1} -{' '}
            {Math.min(safePage * pageSize, sortedRecords.length)}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
