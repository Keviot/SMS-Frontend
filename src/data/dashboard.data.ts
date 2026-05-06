export type Priority = "Low" | "Medium" | "High";
export type ComplaintStatus = "Open" | "Pending" | "Solve";

export const statCards = [
  {
    title: "Total Balance",
    value: "2,22,520",
    type: "balance" as const,
  },
  {
    title: "Total Income",
    value: "55,000",
    type: "income" as const,
  },
  {
    title: "Total Expense",
    value: "20,550",
    type: "expense" as const,
  },
  {
    title: "Total Unit",
    value: "20,550",
    type: "unit" as const,
  },
];

export const complaints = [
  {
    id: "1",
    complainerName: "Evelyn Harper",
    complaintName: "Unethical Behavior",
    date: "01/02/2024",
    priority: "Medium" as Priority,
    status: "Open" as ComplaintStatus,
  },
  {
    id: "2",
    complainerName: "Evelyn Harper",
    complaintName: "Unethical Behavior",
    date: "01/02/2024",
    priority: "Medium" as Priority,
    status: "Pending" as ComplaintStatus,
  },
  {
    id: "3",
    complainerName: "Evelyn Harper",
    complaintName: "Unethical Behavior",
    date: "01/02/2024",
    priority: "Low" as Priority,
    status: "Solve" as ComplaintStatus,
  },
  {
    id: "4",
    complainerName: "Evelyn Harper",
    complaintName: "Unethical Behavior",
    date: "01/02/2024",
    priority: "High" as Priority,
    status: "Open" as ComplaintStatus,
  },
  {
    id: "5",
    complainerName: "Evelyn Harper",
    complaintName: "Unethical Behavior",
    date: "01/02/2024",
    priority: "Medium" as Priority,
    status: "Open" as ComplaintStatus,
  },
];

export const importantNumbers = [
  {
    id: "1",
    name: "Hanna Donin",
    phone: "+91 99587 33657",
    work: "Plumber",
  },
  {
    id: "2",
    name: "Hanna Donin",
    phone: "+91 99587 33657",
    work: "Plumber",
  },
  {
    id: "3",
    name: "Hanna Donin",
    phone: "+91 99587 33657",
    work: "Plumber",
  },
  {
    id: "4",
    name: "Hanna Donin",
    phone: "+91 99587 33657",
    work: "Plumber",
  },
];

export const pendingMaintenances = [
  {
    id: "1",
    name: "Roger Lubin",
    pending: "2 Month Pending",
    amount: "5,000",
  },
  {
    id: "2",
    name: "Roger Lubin",
    pending: "2 Month Pending",
    amount: "5,000",
  },
  {
    id: "3",
    name: "Roger Lubin",
    pending: "2 Month Pending",
    amount: "5,000",
  },
  {
    id: "4",
    name: "Roger Lubin",
    pending: "2 Month Pending",
    amount: "5,000",
  },
  {
    id: "5",
    name: "Roger Lubin",
    pending: "2 Month Pending",
    amount: "5,000",
  },
];

export const upcomingActivities = [
  {
    id: "1",
    letter: "S",
    title: "Society Meeting",
    time: "8:00 PM To 10:00 PM",
    date: "24-09-2024",
  },
  {
    id: "2",
    letter: "H",
    title: "Holi Festival",
    time: "8:00 PM To 10:00 PM",
    date: "24-09-2024",
  },
  {
    id: "3",
    letter: "G",
    title: "Ganesh Chaturthi",
    time: "8:00 PM To 10:00 PM",
    date: "24-09-2024",
  },
  {
    id: "4",
    letter: "N",
    title: "Navratri Festival",
    time: "8:00 PM To 10:00 PM",
    date: "24-09-2024",
  },
];

export const notifications = [
  {
    id: "1",
    title: "Evelyn Harper (A-101)",
    time: "Saturday 11:41 AM",
    message: "Evelyn Harper gave a fund of 1000 rupees for Navratri.",
    ago: "32 Minutes ago",
    hasActions: true,
  },
  {
    id: "2",
    title: "Maintenance (A-101)",
    time: "Tuesday 11:41 AM",
    message: "Evelyn Harper gave a Maintenance of 1000 rupees.",
    ago: "2 days ago",
    hasActions: true,
  },
  {
    id: "3",
    title: "Ganesh Chaturthi (A 101)",
    time: "Saturday 11:41 AM",
    message:
      "The celebration of Ganesh Chaturthi involves the installation of clay idols of Lord Ganesa in Our Resident.",
    ago: "2 days ago",
    amount: "1,500",
    hasActions: true,
  },
];