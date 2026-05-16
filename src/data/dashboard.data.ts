export type Priority = "Low" | "Medium" | "High";
export type ComplaintStatus = "Open" | "Pending" | "Solve";

export const statCards = [
  {
    title: "Total Balance",
    value: "0",
    type: "balance" as const,
  },
  {
    title: "Total Income",
    value: "0",
    type: "income" as const,
  },
  {
    title: "Total Expense",
    value: "0",
    type: "expense" as const,
  },
  {
    title: "Total Unit",
    value: "0",
    type: "unit" as const,
  },
];

export const complaints: Array<{
  id: string;
  complainerName: string;
  complaintName: string;
  date: string;
  priority: Priority;
  status: ComplaintStatus;
}> = [];

export const importantNumbers: Array<{
  id: string;
  name: string;
  phone: string;
  work: string;
}> = [];

export const pendingMaintenances: Array<{
  id: string;
  name: string;
  pending: string;
  amount: string;
}> = [];

export const upcomingActivities: Array<{
  id: string;
  letter: string;
  title: string;
  time: string;
  date: string;
}> = [];

export const notifications: Array<{
  id: string;
  title: string;
  time: string;
  message: string;
  ago: string;
  amount?: string;
  hasActions: boolean;
}> = [];