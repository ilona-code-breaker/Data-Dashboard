import React from 'react';
import { 
  BarChart2, 
  Upload, 
  Download, 
  RotateCcw, 
  FileSpreadsheet, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { DatasetInfo } from '../types';

interface NavbarProps {
  dataset: DatasetInfo;
  filteredCount: number;
  totalCount: number;
  onOpenUpload: () => void;
  onResetToDefault: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  filteredCount,
  totalCount,
  onOpenUpload,
  onResetToDefault,
  onExportCSV,
  onExportJSON,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-tight truncate">
                  Interactive Data Dashboard
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Live
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <span className="truncate font-medium text-slate-700">{dataset.name}</span>
                <span>•</span>
                <span>
                  {filteredCount === totalCount ? (
                    `${totalCount} records`
                  ) : (
                    <span>
                      <strong className="text-indigo-600">{filteredCount}</strong> of {totalCount} records
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {dataset.source !== 'provided' && (
              <button
                id="reset-dataset-btn"
                onClick={onResetToDefault}
                title="Reset back to provided dataset"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative">
              <button
                id="export-data-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div 
                  className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    id="export-csv-btn"
                    onClick={onExportCSV}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export Filtered CSV
                  </button>
                  <button
                    id="export-json-btn"
                    onClick={onExportJSON}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-amber-600" />
                    Export Filtered JSON
                  </button>
                </div>
              )}
            </div>

            {/* Upload File Button */}
            <button
              id="upload-data-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV / JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
