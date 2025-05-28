export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  taskId: number;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseFormData = Omit<Expense, "id" | "createdAt" | "updatedAt">;
