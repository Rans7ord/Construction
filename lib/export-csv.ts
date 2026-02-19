// FILE LOCATION: lib/export-csv.ts
// Exports project data as a properly encoded CSV.
//
// WHY THIS FILE EXISTS:
// The ₵ character (U+20B5, Ghanaian Cedi) is not in Windows-1252 / Latin-1.
// When Excel opens a UTF-8 CSV without a BOM it assumes Windows-1252, so the
// 3-byte UTF-8 sequence E2 82 B5 is mis-read and the last byte (B5 = µ) is
// what you see.  Fix: prepend the UTF-8 BOM (\uFEFF) so Excel knows it is UTF-8,
// AND replace ₵ with the plain ASCII equivalent "GHC" so older Excel versions
// that still ignore the BOM also display correctly.

export interface ExportProject {
  id: string;
  name: string;
  location?: string;
  clientName?: string;
  clientEmail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: number | string;
}

export interface ExportExpense {
  projectId: string;
  stepId?: string;
  description?: string;
  category?: string;
  vendor?: string;
  receipt?: string;
  amount: number | string;
  createdAt?: string;
}

export interface ExportMoneyIn {
  projectId: string;
  description?: string;
  reference?: string;
  amount: number | string;
  createdAt?: string;
}

export interface ExportStep {
  id: string;
  projectId: string;
  name: string;
  status?: string;
  estimatedBudget?: number | string;
  description?: string;
  order?: number;
}

/**
 * Format a number as currency without the ₵ symbol.
 * Uses "GHC " prefix — safe in all Excel versions.
 */
function ghc(n: number | string | undefined): string {
  const num = Number(n ?? 0);
  if (isNaN(num)) return 'GHC 0.00';
  return `GHC ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function esc(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  // Wrap in quotes if it contains commas, quotes, or newlines
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(...cells: (string | number | undefined | null)[]): string {
  return cells.map(esc).join(',');
}

/**
 * Generates a full project CSV report with UTF-8 BOM and triggers download.
 * Replace calls to exportProjectToExcel() in data-context with this for
 * correct currency display in Excel.
 */
export function exportProjectCSV(
  project: ExportProject,
  steps: ExportStep[],
  expenses: ExportExpense[],
  moneyIn: ExportMoneyIn[],
): void {
  const projectSteps    = steps.filter((s) => s.projectId === project.id);
  const projectExpenses = expenses.filter((e) => e.projectId === project.id);
  const projectMoneyIn  = moneyIn.filter((m) => m.projectId === project.id);

  const totalBudget  = Number(project.totalBudget ?? 0);
  const totalIncome  = projectMoneyIn.reduce((s, m) => s + Number(m.amount ?? 0), 0);
  const totalExpenses = projectExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const remaining    = totalBudget - totalExpenses;
  const utilization  = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(2) : '0.00';

  const lines: string[] = [];

  // ── Project info ───────────────────────────────────────────────────────────
  lines.push('PROJECT REPORT');
  lines.push(row('Project Name', project.name));
  lines.push(row('Location', project.location));
  lines.push(row('Client Name', project.clientName));
  lines.push(row('Client Email', project.clientEmail));
  lines.push(row('Status', project.status));
  lines.push(row('Start Date', project.startDate));
  lines.push(row('End Date', project.endDate));
  lines.push(row('Total Budget', ghc(totalBudget)));
  lines.push('');

  // ── Money In ──────────────────────────────────────────────────────────────
  lines.push('MONEY IN / INCOME');
  lines.push(row('Date', 'Description', 'Reference', 'Amount'));
  projectMoneyIn.forEach((m) => {
    lines.push(row(
      m.createdAt ? m.createdAt.split('T')[0] : '',
      m.description,
      m.reference,
      ghc(m.amount),
    ));
  });
  lines.push(row('Total Income', '', '', ghc(totalIncome)));
  lines.push('');

  // ── Expenses by step ──────────────────────────────────────────────────────
  lines.push('EXPENSES BY STEP');
  lines.push('');

  projectSteps
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((step) => {
      const stepExpenses = projectExpenses.filter((e) => e.stepId === step.id);
      const stepTotal    = stepExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);

      lines.push(esc(step.name));
      lines.push(row('Status', step.status));
      lines.push(row('Estimated Budget', ghc(step.estimatedBudget)));
      if (step.description) lines.push(row('Description', step.description));
      lines.push('');
      lines.push(row('Date', 'Description', 'Category', 'Vendor', 'Receipt', 'Amount'));
      stepExpenses.forEach((e) => {
        lines.push(row(
          e.createdAt ? e.createdAt.split('T')[0] : '',
          e.description,
          e.category,
          e.vendor,
          e.receipt,
          ghc(e.amount),
        ));
      });
      lines.push(row(`Total for ${step.name}`, '', '', '', '', ghc(stepTotal)));
      lines.push('');
    });

  // Expenses not linked to a step
  const orphanExpenses = projectExpenses.filter((e) => !e.stepId);
  if (orphanExpenses.length > 0) {
    const orphanTotal = orphanExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
    lines.push('Other Expenses');
    lines.push(row('Date', 'Description', 'Category', 'Vendor', 'Receipt', 'Amount'));
    orphanExpenses.forEach((e) => {
      lines.push(row(
        e.createdAt ? e.createdAt.split('T')[0] : '',
        e.description,
        e.category,
        e.vendor,
        e.receipt,
        ghc(e.amount),
      ));
    });
    lines.push(row('Total Other', '', '', '', '', ghc(orphanTotal)));
    lines.push('');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  lines.push('SUMMARY');
  lines.push(row('Total Budget',    ghc(totalBudget)));
  lines.push(row('Total Income',    ghc(totalIncome)));
  lines.push(row('Total Expenses',  ghc(totalExpenses)));
  lines.push(row('Remaining',       ghc(remaining)));
  lines.push(row('Budget Utilization', `${utilization}%`));

  // ── Download ──────────────────────────────────────────────────────────────
  // \uFEFF = UTF-8 BOM — tells Excel this is UTF-8
  const csv  = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const safe = project.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
  a.href     = url;
  a.download = `${safe}_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}