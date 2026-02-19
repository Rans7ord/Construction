// FILE LOCATION: components/requisition-generator-modal.tsx
// Modal to generate Workfield-style requisition PDFs.
// Fetches materials from /api/materials?projectId=... so they always show up.

'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  generateRequisitionPDF,
  materialsToRequisitionItems,
  expensesToRequisitionItems,
  stepsToRequisitionItems,
  moneyInToRequisitionItems,
  type RequisitionData,
} from '@/lib/generate-requisition-pdf';

interface Project {
  id: string;
  name: string;
  location?: string;
  site?: string;
}

interface RequisitionGeneratorProps {
  project: Project;
  expenses?: any[];
  steps?: any[];
  moneyIn?: any[];
  requestedBy?: string;
  approvedBy?: string;
}

type DocType = 'materials' | 'expenses' | 'steps' | 'money-in';

const DOC_TYPES: { value: DocType; label: string; icon: string; description: string }[] = [
  { value: 'materials',  label: 'Material Requisition', icon: '🧱', description: 'Materials requested or ordered' },
  { value: 'expenses',   label: 'Expense Report',       icon: '💸', description: 'Project expenses and costs' },
  { value: 'steps',      label: 'Work Steps Summary',   icon: '📋', description: 'Phases/steps with budgets' },
  { value: 'money-in',   label: 'Income / Money-In',    icon: '💰', description: 'Payments received' },
];

function todayStr() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function autoReqNo() {
  return String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
}

export default function RequisitionGeneratorModal({
  project,
  expenses = [],
  steps = [],
  moneyIn = [],
  requestedBy = '',
  approvedBy = 'PM',
}: RequisitionGeneratorProps) {
  const [isOpen,        setIsOpen]        = useState(false);
  const [selectedType,  setSelectedType]  = useState<DocType>('materials');
  const [reqTo,         setReqTo]         = useState(project.location || project.site || '');
  const [reqNo,         setReqNo]         = useState(autoReqNo());
  const [reqBy,         setReqBy]         = useState(requestedBy);
  const [appBy,         setAppBy]         = useState(approvedBy);
  const [statusFilter,  setStatusFilter]  = useState<string>('all');
  const [isGenerating,  setIsGenerating]  = useState(false);

  // ── Materials fetched from API ─────────────────────────────────────────────
  const [materials,     setMaterials]     = useState<any[]>([]);
  const [fetchingMats,  setFetchingMats]  = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFetchingMats(true);
    fetch(`/api/materials?projectId=${project.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMaterials(Array.isArray(data) ? data : []))
      .catch(() => setMaterials([]))
      .finally(() => setFetchingMats(false));
  }, [isOpen, project.id]);

  // ── Items for current doc type ─────────────────────────────────────────────
  function getItems() {
    switch (selectedType) {
      case 'materials': {
        const filtered =
          statusFilter === 'all'
            ? materials
            : materials.filter((m) => m.status === statusFilter);
        return materialsToRequisitionItems(filtered);
      }
      case 'expenses':  return expensesToRequisitionItems(expenses);
      case 'steps':     return stepsToRequisitionItems(steps);
      case 'money-in':  return moneyInToRequisitionItems(moneyIn);
      default:          return [];
    }
  }

  function getDocTitle() {
    switch (selectedType) {
      case 'expenses':  return 'EXPENSE REPORT';
      case 'steps':     return 'WORK SUMMARY';
      case 'money-in':  return 'INCOME STATEMENT';
      default:          return 'REQUISITION';
    }
  }

  async function handleGenerate() {
    const items = getItems();
    if (items.length === 0) {
      alert(`No ${selectedType} data found for this project.`);
      return;
    }
    setIsGenerating(true);
    try {
      const reqData: RequisitionData = {
        requisitionNo: reqNo,
        requisitionTo: reqTo || 'HEAD OFFICE',
        projectName:   project.name.toUpperCase(),
        date:          todayStr(),
        items,
        requestedBy:   reqBy,
        approvedBy:    appBy,
        title:         getDocTitle(),
      };
      await generateRequisitionPDF(reqData);
      setIsOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Make sure jsPDF is installed:\nnpm install jspdf');
    } finally {
      setIsGenerating(false);
    }
  }

  const previewItems = getItems();
  const previewTotal = previewItems.reduce((s, i) => s + (i.amount ?? 0), 0);
  const isLoading    = selectedType === 'materials' && fetchingMats;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Requisition
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Generate Workfield Requisition PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">

          {/* Document type picker */}
          <div>
            <label className="block text-sm font-semibold mb-2">Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedType === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status filter — materials only */}
          {selectedType === 'materials' && (
            <div>
              <label className="block text-sm font-semibold mb-2">Filter by Status</label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'ordered', 'received', 'used'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      statusFilter === s
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {s === 'all' ? 'All Materials' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Requisition meta fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Requisition No.</label>
              <input
                value={reqNo}
                onChange={(e) => setReqNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. 00071"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Requisition To (Site)</label>
              <input
                value={reqTo}
                onChange={(e) => setReqTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. TEMA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Requested By</label>
              <input
                value={reqBy}
                onChange={(e) => setReqBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. FRANCIS ARMAH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Approved By</label>
              <input
                value={appBy}
                onChange={(e) => setAppBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. PM"
              />
            </div>
          </div>

          {/* Preview table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-semibold">
                Preview — {DOC_TYPES.find((d) => d.value === selectedType)?.label}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {isLoading ? 'Loading...' : `${previewItems.length} item${previewItems.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            {isLoading ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching materials...
              </div>
            ) : previewItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No {selectedType} data available for this project yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-3 py-2 text-left w-8">#</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right w-14">Qty</th>
                      <th className="px-3 py-2 text-right w-14">Unit</th>
                      <th className="px-3 py-2 text-right w-20">Rate GHC</th>
                      <th className="px-3 py-2 text-right w-20">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.slice(0, 15).map((item, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/20">
                        <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-1.5 max-w-[200px] truncate">{item.description}</td>
                        <td className="px-3 py-1.5 text-right">{item.qty ?? '—'}</td>
                        <td className="px-3 py-1.5 text-right">{item.unit ?? '—'}</td>
                        <td className="px-3 py-1.5 text-right">
                          {item.rate !== undefined
                            ? item.rate.toLocaleString('en-GH', { minimumFractionDigits: 2 })
                            : '—'}
                        </td>
                        <td className="px-3 py-1.5 text-right font-medium">
                          {item.amount !== undefined
                            ? item.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {previewItems.length > 15 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-1.5 text-center text-muted-foreground italic text-xs">
                          ... and {previewItems.length - 15} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {previewTotal > 0 && (
                    <tfoot>
                      <tr className="bg-muted/50 font-bold border-t border-border">
                        <td colSpan={5} className="px-3 py-2 text-right text-xs">
                          Total GHC
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {previewTotal.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleGenerate}
              disabled={isGenerating || isLoading || previewItems.length === 0}
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Download className="w-4 h-4" /> Download {getDocTitle()} PDF</>
              }
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Requires <code className="bg-muted px-1 py-0.5 rounded">pdf format</code>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}