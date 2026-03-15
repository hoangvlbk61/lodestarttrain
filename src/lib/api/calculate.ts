import { apiClient } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SplitResponse {
  original: string;
  lines: string[];
  count: number;
}

export interface ParsedBet {
  type: string;
  subType?: string;
  number?: string;
  numbers?: string[];
  amount: string;
  isValid: boolean;
  error?: string;
  originalLine?: string;
}

export interface ParseResponse {
  lines: string[];
  parsed: ParsedBet[];
  grouped: Record<string, ParsedBet[]>;
  totalBets: number;
  validBets: number;
  invalidBets: number;
}

export interface FinalizedBet extends ParsedBet {
  win: boolean;
  winCount: number;
  detail?: { number: string; found: boolean }[];
}

export interface SummaryGroup {
  label: string;
  totalCount: number;
  winCount: number;
  loseCount: number;
  totalPoints: number;
  winPoints: number;
  losePoints: number;
  summary: string;
  winItems: FinalizedBet[];
  loseItems: FinalizedBet[];
}

export interface FinalizeResponse {
  kqxs: {
    date: string;
    deLast2: string;
    allLast2: string[];
  };
  finalized: FinalizedBet[];
  summary: Record<string, SummaryGroup>;
  totalBets: number;
  totalWin: number;
  totalLose: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const calculateApi = {
  /** Bước 1: Tách tin nhắn thành các dòng */
  split: async (message: string) => {
    const response = await apiClient.post('/calculate/split', { message });
    return response.data as { success: boolean; data: SplitResponse };
  },

  /** Bước 2: Phân tích chi tiết — tách ra đề, lô, xiên 2/3/4 */
  parse: async (lines: string[]) => {
    const response = await apiClient.post('/calculate/parse', { lines });
    return response.data as { success: boolean; data: ParseResponse };
  },

  /** Bước 3: Tính tiền — so sánh KQXS, tổng hợp trúng/trượt */
  finalize: async (parsed: ParsedBet[], date: string) => {
    const response = await apiClient.post('/calculate/finalize', { parsed, date });
    return response.data as { success: boolean; data: FinalizeResponse };
  },

  /** Cập nhật KQXS từ nguồn */
  fetchResults: async () => {
    const response = await apiClient.post('/results/fetch');
    return response.data;
  },
};