// types/lottery.ts - TypeScript interfaces cho API response

export interface KQXS {
  requestedDate: string;
  actualDate: string;
  isFallback: boolean;
  daysBack: number;
  fallbackMessage?: string;
  deLast2: string;
  allLast2: string[];
  fullResults: {
    DB: string[];
    G1: string[];
    G2: string[];
    G3: string[];
    G4: string[];
    G5: string[];
    G6: string[];
    G7: string[];
  };
}

export interface FinalizedBet {
  type: string;
  number: string;
  amount: string;
  isValid: boolean;
  isDan?: boolean;
  danType?: string;
  danValue?: string | number;
  totalBetAmount?: number;
  totalNumbersInDan?: number;
  win: boolean;
  winCount: number;
  // For xiên
  numbers?: string[];
  detail?: {
    number: string;
    found: boolean;
  }[];
}

export interface CategorySummary {
  label: string;
  danType?: string | null;
  danValue?: string | number | null;
  totalBet: number;        // Tổng tiền đánh
  totalWin: number;        // Tổng tiền trúng
  summary: string;         // Format: "trúng/đánh"
  totalCount: number;      // Tổng số bets
  winCount: number;        // Số bets trúng
  loseCount: number;       // Số bets thua
  isDan: boolean;          // Có phải dàn không
}

export interface GrandTotal {
  totalBet: number;
  totalWin: number;
  summary: string;         // Format: "trúng/đánh"
}

export interface FinalizeResponse {
  success: boolean;
  data: {
    kqxs: KQXS;
    finalized: FinalizedBet[];
    summary: Record<string, CategorySummary>;      // NEW format
    rawSummary: any;                               // Original format
    grandTotal: GrandTotal;                        // NEW
    totalBets: number;
    totalWin: number;
    totalLose: number;
  };
}

// Helper function để get category từ bet
export function getBetCategory(bet: FinalizedBet): string {
  if (bet.isDan) {
    const danKey = `${bet.danType}${bet.danValue !== undefined ? ' ' + bet.danValue : ''}`;
    return `${bet.type}_${danKey}`;
  }
  
  if (bet.type === 'de' || bet.type === 'lo') return bet.type;
  if (bet.type === 'xien' && bet.numbers) return `xien${bet.numbers.length}`;
  if (bet.type.startsWith('xien')) return bet.type;
  return 'unknown';
}

// Helper function để format label
export function getCategoryDisplayLabel(category: CategorySummary): string {
  if (category.isDan) {
    return `${category.label} (${category.danType}${category.danValue ? ' ' + category.danValue : ''})`;
  }
  return category.label;
}

// Helper function để format amount
export function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}tr`;
  return `${amount}k`;
}

// Helper function để check result status
export function getResultStatus(totalWin: number, totalBet: number): {
  status: 'win' | 'break-even' | 'lose';
  label: string;
  profit: number;
} {
  const profit = totalWin - totalBet;
  
  if (totalWin > totalBet) {
    return { status: 'win', label: 'Thắng', profit };
  }
  if (totalWin === totalBet) {
    return { status: 'break-even', label: 'Hòa vốn', profit: 0 };
  }
  return { status: 'lose', label: 'Thua', profit };
}