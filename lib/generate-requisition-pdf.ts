// FILE LOCATION: lib/generate-requisition-pdf.ts
// Generates Workfield Group Construction Limited Requisition PDFs
// Uses jsPDF (client-side). Install: npm install jspdf

// ─── Workfield logo (JPEG, extracted from company PDF) ────────────────────────
const WORKFIELD_LOGO_B64 =
  '/9j/4AAQSkZJRgABAQEA3ADcAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
  'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy' +
  'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABlAJkDASIA' +
  'AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9' +
  'AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6' +
  'Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ip' +
  'qrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEB' +
  'AQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdh' +
  'cRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldY' +
  'WVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPE' +
  'xcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDx+iiivsDyxO9O' +
  'pB1pcVcUAo6U4KSVVepPGKQCpYMC4jJ6BhWj0jcS3PR7P4PX76fYXF7qEcEl44VI1TdtyMgk5rmv' +
  'FvgfVfB90EvE823b7lxGDtPt7GvbrXXLvU7XRF0/TZREs0ardTjy1ZgvYckg+/FYPxT0HWtV0yyR' +
  '7xZp5Z9qW0Q2Rj5SSck8nANeLQx1VVkpvRnVKlHl0PBOaK6a18A+Iry+W0t7ISP3dHBRfqw4FegaT' +
  '8CG2iTWtWVBjmO2X/2Y/4VetXp3M41Jdjx8KxGQCR9KQgjqCPwr6MuIPh/4BsfsttHDPdqNmIVEsp' +
  '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';

export interface RequisitionItem {
  description: string;
  qty?: number | string;
  unit?: string;
  rate?: number;
  amount?: number;
}

export interface RequisitionData {
  requisitionNo: string;
  requisitionTo: string;
  projectName: string;
  date: string;
  items: RequisitionItem[];
  requestedBy?: string;
  approvedBy?: string;
  /** Overrides the boxed header — default: 'REQUISITION' */
  title?: string;
}

/**
 * NOTE on currency: jsPDF's built-in Helvetica does NOT support the ₵ glyph
 * (Unicode U+20B5). We use "GHC" as the currency prefix throughout the PDF.
 * If you need the ₵ symbol you must embed a custom font (e.g. Roboto via
 * doc.addFont()) before calling this function.
 */
function fmt(n: number): string {
  return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function generateRequisitionPDF(data: RequisitionData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW    = 210;
  const margin   = 14;
  const cW       = pageW - margin * 2;   // content width: 182 mm

  // Colours
  const black     = [0, 0, 0] as const;
  const darkGray  = [50, 50, 50] as const;
  const lightGray = [200, 200, 200] as const;
  const headerBg  = [240, 240, 240] as const;
  const altRow    = [250, 250, 252] as const;

  let y = margin;

  // ── Logo ─────────────────────────────────────────────────────────────────
  try {
    doc.addImage(WORKFIELD_LOGO_B64, 'JPEG', margin, y, 22, 15);
  } catch {
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(margin, y, 22, 15, 2, 2, 'F');
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('WORKFIELD\nLOGO', margin + 11, y + 8, { align: 'center', baseline: 'middle' });
  }

  // ── Company name & title box ──────────────────────────────────────────────
  const cx = pageW / 2;
  doc.setTextColor(...black);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('WORKFIELD GROUP CONSTRUCTION LIMITED', cx, y + 6, { align: 'center' });

  const ttl    = data.title || 'REQUISITION';
  const bW     = 78;
  const bX     = cx - bW / 2;
  const bY     = y + 9;
  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.7);
  doc.rect(bX, bY, bW, 9);
  doc.setFontSize(13);
  doc.text(ttl, cx, bY + 6.2, { align: 'center' });

  // ── Requisition meta row ──────────────────────────────────────────────────
  y += 24;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text(`Requisition to : ${data.requisitionTo}`, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`No:...${data.requisitionNo}`, pageW - margin, y, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Project : ${data.projectName}`, margin, y);
  doc.text(`Date : ${data.date}`, pageW - margin, y, { align: 'right' });

  // ── Column right-edges (all numeric columns right-align to these x values) ─
  // Layout (right edges, mm from left):
  //   Amount  → tableRight      (196)
  //   Rate    → tableRight - 28 (168)
  //   Unit    → tableRight - 44 (152)
  //   Qty     → tableRight - 56 (140)
  //   Desc    → starts at margin + 16 (30), ends ~ 138
  //   ItemNo  → margin..margin+16
  const tableRight  = margin + cW;   // 196
  const amtR        = tableRight;
  const rateR       = tableRight - 28;
  const unitR       = tableRight - 44;
  const qtyR        = tableRight - 56;
  const descL       = margin + 16;

  const rowH = 9;
  y += 6;

  // ── Header row ────────────────────────────────────────────────────────────
  doc.setFillColor(...headerBg);
  doc.rect(margin, y, cW, rowH, 'F');
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, cW, rowH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGray);

  doc.text('Item No.',         margin + 1,  y + 6);
  doc.text('Item Description', descL + 1,   y + 6);
  doc.text('Qty',     qtyR,  y + 6, { align: 'right' });
  doc.text('Unit',    unitR, y + 6, { align: 'right' });
  doc.text('Rate GHC', rateR, y + 6, { align: 'right' });
  doc.text('Amount',  amtR - 1, y + 6, { align: 'right' });

  // ── Data rows ─────────────────────────────────────────────────────────────
  let total = 0;
  const minRows = Math.max(data.items.length, 10);

  for (let i = 0; i < minRows; i++) {
    y += rowH;
    const item = data.items[i];

    if (i % 2 === 0) {
      doc.setFillColor(...altRow);
      doc.rect(margin, y, cW, rowH, 'F');
    }

    // Dashed bottom border
    doc.setDrawColor(...lightGray);
    doc.setLineDashPattern([1, 1.5], 0);
    doc.line(margin, y + rowH, tableRight, y + rowH);
    doc.setLineDashPattern([], 0);

    // Left / right table borders
    doc.setLineWidth(0.3);
    doc.line(margin,      y, margin,      y + rowH);
    doc.line(tableRight,  y, tableRight,  y + rowH);

    if (!item) continue;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...black);

    // Row number (centred in item-no column)
    doc.text(String(i + 1), margin + 8, y + 6, { align: 'center' });

    // Description — truncate to fit
    const d = item.description.length > 50
      ? item.description.substring(0, 50) + '...'
      : item.description;
    doc.text(d, descL + 1, y + 6);

    // Qty
    if (item.qty !== undefined && item.qty !== null && item.qty !== '') {
      doc.text(String(item.qty), qtyR, y + 6, { align: 'right' });
    }
    // Unit
    if (item.unit) {
      doc.text(item.unit, unitR, y + 6, { align: 'right' });
    }
    // Rate
    if (item.rate !== undefined && item.rate > 0) {
      doc.text(fmt(item.rate), rateR, y + 6, { align: 'right' });
    }
    // Amount
    const amt =
      item.amount ??
      (item.rate !== undefined && item.qty !== undefined && item.qty !== ''
        ? item.rate * Number(item.qty)
        : undefined);

    if (amt !== undefined) {
      total += amt;
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(amt), amtR - 1, y + 6, { align: 'right' });
      doc.setFont('helvetica', 'normal');
    }
  }

  // ── Total row ─────────────────────────────────────────────────────────────
  y += rowH;
  doc.setFillColor(...headerBg);
  doc.rect(margin, y, cW, rowH, 'F');
  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, cW, rowH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...black);
  doc.text('TOTAL  GHC', rateR, y + 6, { align: 'right' });
  doc.text(fmt(total),  amtR - 1, y + 6, { align: 'right' });

  // ── Signatures ────────────────────────────────────────────────────────────
  y += rowH + 14;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(cx + 6, y + 2, tableRight, y + 2);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGray);
  doc.text(`Date : ${data.date}`, margin, y);

  if (data.requestedBy) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...black);
    doc.text(data.requestedBy, cx + 6, y);
  }

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text('SIGNED',          margin + 8, y);
  doc.text('REQUESTED BY :', margin,      y + 6);
  if (data.approvedBy) {
    doc.text(`APPROVED BY : ${data.approvedBy}`, cx + 6, y + 6);
  }

  // ── Outer border ──────────────────────────────────────────────────────────
  doc.setDrawColor(...darkGray);
  doc.setLineWidth(0.6);
  doc.rect(margin, margin, cW, y + 12 - margin);

  // ── Save ──────────────────────────────────────────────────────────────────
  const safe = data.projectName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  doc.save(`Requisition_${data.requisitionNo}_${safe}.pdf`);
}

// ─── Item builders ────────────────────────────────────────────────────────────

export function materialsToRequisitionItems(materials: any[]): RequisitionItem[] {
  return materials.map((m) => ({
    description:
      m.name +
      (m.type ? ` (${m.type})` : '') +
      (m.description ? ` - ${m.description}` : ''),
    qty: m.quantity,
    unit: m.unit,
    rate: m.unitCost ?? m.cost ?? undefined,
    amount: m.totalCost ?? m.amount ?? undefined,
  }));
}

export function expensesToRequisitionItems(expenses: any[]): RequisitionItem[] {
  return expenses.map((e) => ({
    description: e.description || e.name || 'Expense',
    qty: 1,
    unit: 'item',
    rate: Number(e.amount),
    amount: Number(e.amount),
  }));
}

export function stepsToRequisitionItems(steps: any[]): RequisitionItem[] {
  return steps.map((s) => ({
    description: s.name + (s.description ? ` - ${s.description}` : ''),
    qty: s.progress !== undefined ? `${s.progress}%` : '',
    unit: 'step',
    rate: s.cost ?? s.estimatedBudget ?? undefined,
    amount: s.cost ?? s.estimatedBudget ?? undefined,
  }));
}

export function moneyInToRequisitionItems(moneyIn: any[]): RequisitionItem[] {
  return moneyIn.map((m) => ({
    description: m.description || m.source || 'Payment received',
    qty: 1,
    unit: 'item',
    rate: Number(m.amount),
    amount: Number(m.amount),
  }));
}