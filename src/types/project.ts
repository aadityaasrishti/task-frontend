import type { Expense } from "./expense";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  ownerId: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  members: {
    id: number;
    name: string;
    email: string;
  }[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  projectId: number;
  project?: {
    name: string;
  };
  assigneeId?: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  expenses?: Expense[];
  createdAt: string;
  updatedAt: string;
}
