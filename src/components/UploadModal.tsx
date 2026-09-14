import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileJson, 
  Check, 
  AlertCircle, 
  Database,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { DatasetInfo } from '../types';
import { 
  parseCSVData, 
  parseJSONData, 
  PROVIDED_RAW_CSV, 
  INITIAL_DATASET 
} from '../data/initialData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (dataset: DatasetInfo) => void;
}

const SAMPLE_SAAS_CSV = `Order Number,Product,Price,Date,Payment Method
SUB-2001,Pro Annual Subscription,$299.00,2025-08-01,Credit Card
SUB-2002,Starter Monthly,$29.00,2025-08-02,Credit Card
SUB-2003,Enterprise Custom,$890.00,2025-08-03,eWallet
SUB-2004,Starter Monthly,$29.00,2025-08-04,Debit Card
SUB-2005,Team Plan Monthly,$99.00,2025-08-05,Credit Card
SUB-2006,Pro Annual Subscription,$299.00,2025-08-06,Cash
SUB-2007,Team Plan Monthly,$99.00,2025-08-07,eWallet
SUB-2008,Enterprise Custom,$890.00,2025-08-08,Credit Card
SUB-2009,Starter Monthly,$29.00,2025-08-09,Debit Card
SUB-2010,Pro Annual Subscription,$299.00,2025-08-10,eWallet`;

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [customName, setCustomName] = useState('');
  const [previewDataset, setPreviewDataset] = useState<DatasetInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg(null);
    const fileName = file.name;
    const isCsv = fileName.toLowerCase().endsWith('.csv') || file.type.includes('csv');
    const isJson = fileName.toLowerCase().endsWith('.json') || file.type.includes('json');

    if (!isCsv && !isJson) {
      setErrorMsg('Please upload a valid .csv or .json file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          setErrorMsg('The selected file is empty.');
          return;
        }

        let dataset: DatasetInfo;
        if (isCsv) {
          dataset = parseCSVData(text, customName || fileName);
        } else {
          dataset = parseJSONData(text, customName || fileName);
        }

        if (!dataset.records || dataset.records.length === 0) {
          setErrorMsg('No data records found in file. Please verify format.');
          return;
        }

        setPreviewDataset(dataset);
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message || 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed reading the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    setErrorMsg(null);
    const text = pastedText.trim();
    if (!text) {
      setErrorMsg('Please paste some CSV or JSON data first.');
      return;
    }

    try {
      let dataset: DatasetInfo;
      if (text.startsWith('[') || text.startsWith('{')) {
        dataset = parseJSONData(text, customName || 'Pasted JSON Dataset');
      } else {
        dataset = parseCSVData(text, customName || 'Pasted CSV Dataset');
      }

      if (!dataset.records || dataset.records.length === 0) {
        setErrorMsg('Could not parse any rows from the provided text.');
        return;
      }

      setPreviewDataset(dataset);
    } catch (err: any) {
      setErrorMsg(`Failed to parse pasted text: ${err.message}`);
    }
  };

  const handleApply = () => {
    if (previewDataset) {
      onApplyDataset(previewDataset);
      onClose();
    }
  };

  const loadPreset = (type: 'provided' | 'saas') => {
    setErrorMsg(null);
    if (type === 'provided') {
      setPreviewDataset(INITIAL_DATASET);
    } else {
      const ds = parseCSVData(SAMPLE_SAAS_CSV, 'SaaS Subscription Presets (10 Rows)');
      setPreviewDataset(ds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Load or Upload Data</h2>
              <p className="text-xs text-slate-500">Supports standard CSV and JSON format files</p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs font-medium">
          <button
            id="tab-upload-file"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            File Upload
          </button>
          <button
            id="tab-paste-text"
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste CSV/JSON Text
          </button>
          <button
            id="tab-presets"
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'samples'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Presets & Restores
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                id="dropzone-area"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="csv-file-input"
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Click to browse or drag and drop your file here
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Supports comma-separated <strong>.CSV</strong> and formatted <strong>.JSON</strong> files.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" /> CSV
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FileJson className="w-3.5 h-3.5 text-slate-500" /> JSON
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dataset Name (optional)
                </label>
                <input
                  id="pasted-dataset-name"
                  type="text"
                  placeholder="e.g. Q3 Sales Records"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Paste raw CSV or JSON text
                </label>
                <textarea
                  id="pasted-dataset-textarea"
                  rows={8}
                  placeholder={`Order Number,Product,Price,Date,Payment Method\nORD-101,Denim Jacket,$120.00,2025-09-01,Credit Card\n...`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-slate-50/50"
                />
              </div>
              <button
                id="parse-pasted-btn"
                onClick={handlePasteSubmit}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Parse & Preview Data
              </button>
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                You can restore the exact apparel order dataset provided by you, or preview alternate sample structures.
              </p>

              {/* Provided dataset preset */}
              <div 
                id="sample-provided-apparel"
                onClick={() => loadPreset('provided')}
                className="p-3.5 border border-indigo-200 bg-indigo-50/40 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    TT
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      Provided Apparel Dataset (107 Rows)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Exact user data with Slim-Fit Denim Jeans, Chinos, Joggers, etc.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                  Load <Sparkles className="w-3 h-3" />
                </span>
              </div>

              {/* Alternative sample preset */}
              <div 
                id="sample-saas"
                onClick={() => loadPreset('saas')}
                className="p-3.5 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    SB
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      Sample SaaS Subscriptions
                    </h4>
                    <p className="text-xs text-slate-500">
                      Software license & monthly subscription tier records
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600">Select</span>
              </div>
            </div>
          )}

          {/* Parsed Preview Section */}
          {previewDataset && (
            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-slate-900">
                    Parsed: {previewDataset.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({previewDataset.rowCount} rows, {previewDataset.columns.length} columns)
                  </span>
                </div>
                {previewDataset.isSaleSchema && (
                  <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/50">
                    Sales Schema Detected
                  </span>
                )}
              </div>

              {/* Column list */}
              <div className="flex flex-wrap gap-1.5">
                {previewDataset.columns.map((col) => (
                  <span
                    key={col.key}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                  >
                    <span>{col.label}</span>
                    <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-100 text-slate-500 rounded">
                      {col.type}
                    </span>
                  </span>
                ))}
              </div>

              {/* First 3 preview rows */}
              <div className="max-h-36 overflow-x-auto overflow-y-auto border border-slate-200 rounded-lg bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                  <thead className="bg-slate-50">
                    <tr>
                      {previewDataset.columns.slice(0, 6).map((col) => (
                        <th key={col.key} className="px-2.5 py-1.5 text-left font-medium text-slate-600">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {previewDataset.records.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        {previewDataset.columns.slice(0, 6).map((col) => (
                          <td key={col.key} className="px-2.5 py-1 text-slate-700 truncate max-w-[120px]">
                            {String(row[col.key] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            id="cancel-upload-btn"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="apply-dataset-btn"
            disabled={!previewDataset}
            onClick={handleApply}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-colors flex items-center gap-1.5 ${
              previewDataset
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Apply Dataset to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
