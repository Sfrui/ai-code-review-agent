import { create } from 'zustand';

// ============================================================
// Review Store — 代码审查页面状态
// ============================================================

interface ReviewState {
  /** 当前输入的代码 */
  codeInput: string;
  /** 当前代码文件名 */
  codeName: string;
  /** 设置代码内容 */
  setCodeInput: (code: string) => void;
  /** 设置文件名 */
  setCodeName: (name: string) => void;
  /** 清空输入 */
  clearInput: () => void;
}

export const useReviewStore = create<ReviewState>()((set) => ({
  codeInput: '',
  codeName: 'untitled.ts',
  setCodeInput: (code) => set({ codeInput: code }),
  setCodeName: (name) => set({ codeName: name }),
  clearInput: () => set({ codeInput: '', codeName: 'untitled.ts' }),
}));
