// ============================================================
// workHistoryTypes.ts — TKV Work History Data Model
// ============================================================

export type WorkHistoryType =
  | 'WORKING'
  | 'PROBATION'
  | 'SICK_LEAVE'
  | 'MATERNITY'
  | 'UNPAID_LEAVE'
  | 'WORK_ACCIDENT';

export const WORK_HISTORY_TYPE_LABELS: Record<WorkHistoryType, string> = {
  WORKING: 'Làm việc chính thức',
  PROBATION: 'Thử việc / Tập sự',
  SICK_LEAVE: 'Nghỉ ốm',
  MATERNITY: 'Thai sản',
  UNPAID_LEAVE: 'Nghỉ không lương',
  WORK_ACCIDENT: 'Tai nạn lao động',
};

export interface WorkHistory {
  id: number;
  employeeId: number;
  companyName: string;
  isStateOwned: boolean; // Công ty nhà nước → được cộng vào thâm niên & tháng hiệu lực
  type: WorkHistoryType;
  fromDate: string; // ISO date string YYYY-MM-DD
  toDate: string;   // ISO date string YYYY-MM-DD
  effectiveMonths?: number; // HR nhập tay — chỉ dùng khi isStateOwned = true
}

// ============================================================
// Core calculation helpers
// ============================================================

/** Tính số tháng chênh lệch giữa 2 ngày (làm tròn xuống) */
export function diffMonths(from: string, to: string): number {
  const f = new Date(from);
  const t = new Date(to);
  return Math.max(
    0,
    (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth()),
  );
}

/**
 * Tính tổng tháng hiệu lực từ danh sách work history.
 *
 * Quy tắc TKV:
 *  - WORKING / PROBATION / MATERNITY → full months
 *  - SICK_LEAVE                      → tối đa 2 tháng
 *  - WORK_ACCIDENT                   → tối đa 6 tháng
 *  - UNPAID_LEAVE                    → tối đa 1 tháng
 *  - isStateOwned                    → cộng thêm effectiveMonths do HR nhập
 */
export function calculateEffectiveMonths(histories: WorkHistory[]): number {
  let total = 0;

  for (const h of histories) {
    const months = diffMonths(h.fromDate, h.toDate);

    switch (h.type) {
      case 'WORKING':
      case 'PROBATION':
      case 'MATERNITY':
        total += months;
        break;
      case 'SICK_LEAVE':
        total += Math.min(months, 2);
        break;
      case 'WORK_ACCIDENT':
        total += Math.min(months, 6);
        break;
      case 'UNPAID_LEAVE':
        total += Math.min(months, 1);
        break;
    }

    if (h.isStateOwned && h.effectiveMonths) {
      total += h.effectiveMonths;
    }
  }

  return total;
}

/** Tính thâm niên (năm) dựa trên tổng tháng hiệu lực */
export function calculateSeniority(totalMonths: number): number {
  return Math.floor(totalMonths / 12);
}

// ============================================================
// Work history eligibility summary
// ============================================================

export interface WorkHistorySummary {
  totalEffectiveMonths: number;
  seniorityYears: number;
  eligible: boolean; // >= 12 months
  eligibilityLabel: string;
}

export function getWorkHistorySummary(histories: WorkHistory[]): WorkHistorySummary {
  const totalEffectiveMonths = calculateEffectiveMonths(histories);
  const seniorityYears = calculateSeniority(totalEffectiveMonths);
  const eligible = totalEffectiveMonths >= 12;

  return {
    totalEffectiveMonths,
    seniorityYears,
    eligible,
    eligibilityLabel: eligible
      ? `Đủ điều kiện nghỉ phép năm (${totalEffectiveMonths} tháng)`
      : `Chưa đủ điều kiện (${totalEffectiveMonths}/12 tháng)`,
  };
}

// ============================================================
// Mock work history data (dùng cho demo)
// ============================================================

export const MOCK_WORK_HISTORIES: WorkHistory[] = [
  // Employee 1 — Nguyễn Văn A — đủ điều kiện (36 tháng TKV + 24 tháng nhà nước cũ)
  {
    id: 1,
    employeeId: 1,
    companyName: 'TKV Uông Bí',
    isStateOwned: false,
    type: 'WORKING',
    fromDate: '2021-01-01',
    toDate: '2024-01-01',
  },
  {
    id: 2,
    employeeId: 1,
    companyName: 'Vinacomin (cũ)',
    isStateOwned: true,
    type: 'WORKING',
    fromDate: '2019-01-01',
    toDate: '2021-01-01',
    effectiveMonths: 24,
  },

  // Employee 2 — Trần Thị B — chưa đủ điều kiện (11 tháng)
  {
    id: 3,
    employeeId: 2,
    companyName: 'TKV Uông Bí',
    isStateOwned: false,
    type: 'WORKING',
    fromDate: '2023-06-01',
    toDate: '2023-11-01', // 5 tháng thực tế
  },
  {
    id: 4,
    employeeId: 2,
    companyName: 'TKV Uông Bí',
    isStateOwned: false,
    type: 'PROBATION',
    fromDate: '2023-04-01',
    toDate: '2023-06-01', // 2 tháng thử việc
  },
  {
    id: 5,
    employeeId: 2,
    companyName: 'TKV Uông Bí',
    isStateOwned: false,
    type: 'UNPAID_LEAVE',
    fromDate: '2023-11-01',
    toDate: '2024-03-01', // 4 tháng không lương → chỉ tính 1 tháng
  },
];
