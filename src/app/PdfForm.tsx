/**
 * PdfForm.tsx
 * Generates a compact, print-ready hardcopy onboarding form (A4 optimised).
 */

import type { StaffUser } from './StaffManager';

interface Field {
  label: string;
  value: string;
  state: string;
  type?: string;
  options?: string[];
  readonly?: boolean;
  required?: boolean;
}

interface DocType {
  name: string;
  type: string;
  fields: Field[];
}

interface StepData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  doctypes: DocType[];
}

const STEP_COLORS: Record<number, string> = {
  1: '#7c3aed',
  2: '#d97706',
  3: '#0d9488',
  4: '#2563eb',
  5: '#059669',
};

function buildHtml(steps: StepData[], _staffUsers: StaffUser[], _selectedFeatures: string[]): string {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // ── Single blank field ───────────────────────────────────────────────
  const renderField = (f: Field): string => {
    const req = f.required ? '<span style="color:#dc2626;margin-left:1px">*</span>' : '';

    if (f.type === 'select' && f.options?.length) {
      const chips = f.options.map(o =>
        `<span class="chip">&#9675; ${o}</span>`
      ).join('');
      return `<div class="fr">
        <div class="fl">${f.label}${req}</div>
        <div class="chips">${chips}</div>
        <div class="fline"></div>
      </div>`;
    }

    if (f.type === 'file') {
      return `<div class="fr">
        <div class="fl">${f.label}${req}</div>
        <div class="ubox">Attach document / photocopy</div>
      </div>`;
    }

    return `<div class="fr">
      <div class="fl">${f.label}${req}</div>
      <div class="fline"></div>
    </div>`;
  };

  // ── Business hours table ─────────────────────────────────────────────
  const hoursTable = `
    <table class="tbl">
      <thead><tr>
        <th style="width:22%">Day</th>
        <th style="width:18%">Open? (✓/✗)</th>
        <th>Opening Time</th>
        <th>Closing Time</th>
      </tr></thead>
      <tbody>
        ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d =>
          `<tr><td>${d}</td><td></td><td></td><td></td></tr>`
        ).join('')}
      </tbody>
    </table>`;

  // ── Staff table ──────────────────────────────────────────────────────
  const staffSection = `
    <div class="db">
      <div class="dt">User Management — Staff List</div>
      <table class="tbl">
        <thead><tr>
          <th style="width:6%">#</th>
          <th>Full Name</th>
          <th style="width:20%">Mobile</th>
          <th style="width:20%">Role</th>
          <th style="width:22%">Email (Valet only)</th>
        </tr></thead>
        <tbody>
          ${Array.from({ length: 8 }).map((_, i) =>
            `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td></tr>`
          ).join('')}
        </tbody>
      </table>
    </div>`;

  // ── Features checklist ───────────────────────────────────────────────
  const featuresList = [
    'Table Reservation','Event Booking','Valet Parking','Takeaway','Delivery',
    'Live Music','DJ Night','Happy Hours','Loyalty Program','Online Menu',
  ];
  const featuresGrid = `
    <div class="db">
      <div class="dt">Features — Tick all that apply</div>
      <div class="fg">
        ${featuresList.map(f =>
          `<label class="fi"><span class="cb"></span>${f}</label>`
        ).join('')}
        <label class="fi"><span class="cb"></span>Other: _____________</label>
      </div>
    </div>`;

  // ── Step blocks ──────────────────────────────────────────────────────
  const stepsHtml = steps
    .filter(s => s.id !== 'step-05')
    .map(step => {
      const c = STEP_COLORS[step.number] || '#334155';

      const dtHtml = step.doctypes.map(dt => {
        if (dt.name === 'Business Hours') {
          return `<div class="db"><div class="dt">${dt.name}</div>${hoursTable}</div>`;
        }
        if (dt.name === 'User Management') return staffSection;
        if (dt.name === 'Features') return featuresGrid;

        const fhtml = dt.fields
          .filter(f => f.state !== 'carry')
          .map(renderField).join('');

        return `<div class="db">
          <div class="dt">${dt.name} <span class="dtt">${dt.type}</span></div>
          <div class="fg2">${fhtml || '<p style="color:#aaa;font-size:9px;padding:6px 0">No manual fields needed.</p>'}</div>
        </div>`;
      }).join('');

      return `<div class="ss" style="border-left-color:${c}">
        <div class="sh" style="background:${c}12">
          <div class="sn" style="background:${c}">0${step.number}</div>
          <div>
            <div class="sti" style="color:${c}">${step.title}</div>
            <div class="ssu">${step.subtitle}</div>
          </div>
        </div>
        <div class="sb">${dtHtml}</div>
      </div>`;
    }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Partner Onboarding Form — ABO Tribe</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  body{
    font-family:'Inter',Arial,sans-serif;
    font-size:9.5px;
    color:#1e293b;
    background:#fff;
    line-height:1.4;
  }

  /* ── HEADER BAND (replaces full cover page) ── */
  .hdr{
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:2.5px solid #f59e0b;
    padding:8px 14px 8px;
    margin-bottom:10px;
  }
  .hdr-left{display:flex;align-items:center;gap:8px}
  .logo{
    width:30px;height:30px;background:#000;border-radius:7px;
    display:flex;align-items:center;justify-content:center;
    font-size:14px;font-weight:900;color:#f59e0b;flex-shrink:0;
  }
  .hdr h1{font-size:13px;font-weight:800;color:#1e293b;letter-spacing:-.3px}
  .hdr-sub{font-size:8px;color:#64748b;font-weight:600;margin-top:1px}
  .hdr-meta{font-size:8px;color:#94a3b8;text-align:right;line-height:1.6}

  /* ── QUICK INFO STRIP ── */
  .info-strip{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:6px;
    margin-bottom:10px;
    border:1px solid #e2e8f0;
    border-radius:7px;
    padding:8px 10px;
    background:#f8fafc;
  }
  .ib .ibl{font-size:7.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
  .ib .iline{border-bottom:1.5px solid #cbd5e1;height:16px}

  /* ── NOTICE ── */
  .notice{
    font-size:8px;color:#64748b;
    border:1px dashed #cbd5e1;border-radius:6px;
    padding:5px 10px;margin-bottom:10px;
    background:#fffbeb;
  }

  /* ── STEP ── */
  .ss{border-left:3px solid #f59e0b;margin-bottom:10px}
  .sh{
    display:flex;align-items:center;gap:8px;
    padding:5px 8px;
    border-bottom:1px solid #e2e8f0;
  }
  .sn{
    width:22px;height:22px;border-radius:5px;
    color:#fff;font-weight:800;font-size:9px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
  }
  .sti{font-size:10px;font-weight:800}
  .ssu{font-size:7.5px;color:#64748b;font-weight:500;margin-top:1px}
  .sb{padding:0 8px 8px}

  /* ── DOCTYPE BLOCK ── */
  .db{border:1px solid #e2e8f0;border-radius:6px;margin:6px 0;overflow:hidden}
  .dt{
    background:#f8fafc;border-bottom:1px solid #e2e8f0;
    padding:4px 10px;font-size:9px;font-weight:700;color:#334155;
    display:flex;align-items:center;gap:6px;
  }
  .dtt{
    background:#e0e7ff;color:#4338ca;
    font-size:7.5px;font-weight:700;
    padding:1px 5px;border-radius:20px;
  }

  /* ── FIELDS GRID (2-col) ── */
  .fg2{
    padding:7px 10px;
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px 16px;
  }

  /* ── FIELD ROW ── */
  .fr{display:flex;flex-direction:column;gap:2px}
  .fl{font-size:7.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
  .fline{border-bottom:1px solid #94a3b8;height:18px}

  /* chips */
  .chips{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:2px}
  .chip{
    border:1px solid #cbd5e1;border-radius:4px;
    padding:2px 6px;font-size:8px;font-weight:600;color:#475569;
  }

  /* file */
  .ubox{
    border:1px dashed #94a3b8;border-radius:5px;
    padding:6px;text-align:center;color:#94a3b8;font-size:8px;font-weight:500;
  }

  /* ── TABLE ── */
  .tbl{width:100%;border-collapse:collapse}
  .tbl th,.tbl td{border:1px solid #e2e8f0;padding:4px 8px;font-size:8.5px}
  .tbl th{background:#f8fafc;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:#64748b}
  .tbl td{height:20px}

  /* ── FEATURES ── */
  .fg{
    padding:7px 10px;
    display:grid;grid-template-columns:repeat(4,1fr);gap:5px 8px;
  }
  .fi{display:flex;align-items:center;gap:5px;font-size:8.5px;font-weight:500;color:#334155}
  .cb{
    width:11px;height:11px;border:1.5px solid #94a3b8;
    border-radius:2px;flex-shrink:0;display:inline-block;
  }

  /* ── SIGNATURES ── */
  .sig{
    display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;
    margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;
  }
  .sg{display:flex;flex-direction:column;gap:3px}
  .sgl{font-size:7.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
  .sgline{border-bottom:1.5px solid #475569;height:30px}
  .sgs{font-size:7.5px;color:#94a3b8;margin-top:2px}

  /* ── FOOTER ── */
  .ftr{
    margin-top:8px;border-top:1px solid #e2e8f0;padding-top:5px;
    display:flex;justify-content:space-between;font-size:7.5px;color:#94a3b8;
  }

  /* ── PRINT ── */
  @media print {
    @page{size:A4 portrait;margin:10mm 10mm 10mm 10mm}
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .ss{page-break-inside:auto}
    .db{page-break-inside:avoid}
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-left">
    <div class="logo">A</div>
    <div>
      <h1>Partner Onboarding Form</h1>
      <div class="hdr-sub">ABO Tribe — Adopt Style Onboarding Registry</div>
    </div>
  </div>
  <div class="hdr-meta">
    Generated: ${today}<br>
    Fields marked <strong style="color:#dc2626">*</strong> are mandatory<br>
    Write in <strong>BLOCK LETTERS</strong>
  </div>
</div>

<!-- QUICK INFO STRIP -->
<div class="info-strip">
  <div class="ib"><div class="ibl">Restaurant / Bar Name</div><div class="iline"></div></div>
  <div class="ib"><div class="ibl">Owner Name</div><div class="iline"></div></div>
  <div class="ib"><div class="ibl">Mobile Number</div><div class="iline"></div></div>
  <div class="ib"><div class="ibl">Date of Submission</div><div class="iline"></div></div>
</div>

<!-- NOTICE -->
<div class="notice">
  📋 This form covers <strong>4 onboarding steps</strong>. Fill all sections and attach self-attested copies of documents where indicated.
  Completed form must be signed by the partner and the onboarding executive before submission.
</div>

<!-- STEP SECTIONS -->
${stepsHtml}

<!-- SIGNATURES -->
<div class="sig">
  <div class="sg">
    <div class="sgl">Partner / Owner Signature</div>
    <div class="sgline"></div>
    <div class="sgs">Name &amp; Date</div>
  </div>
  <div class="sg">
    <div class="sgl">Onboarding Executive</div>
    <div class="sgline"></div>
    <div class="sgs">Name &amp; Employee ID</div>
  </div>
  <div class="sg">
    <div class="sgl">Verified By (Manager)</div>
    <div class="sgline"></div>
    <div class="sgs">Signature &amp; Date</div>
  </div>
</div>

<!-- FOOTER -->
<div class="ftr">
  <span>ABO Tribe — Partner Onboarding Form</span>
  <span>Confidential — Internal Use Only</span>
  <span>Generated: ${today}</span>
</div>

</body>
</html>`;
}

export function downloadPdf(
  steps: StepData[],
  staffUsers: StaffUser[],
  selectedFeatures: string[],
) {
  const html = buildHtml(steps, staffUsers, selectedFeatures);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to download the PDF form.');
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 700);
}
