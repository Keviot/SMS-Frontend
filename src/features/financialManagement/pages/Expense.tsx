import { Eye, FileImage, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../../ui/Button";
import ExpenseFormModal, {
    type ExpenseFormData,
} from "../components/ExpenseFormModal";
import { useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ExpenseViewModal from "../components/ExpenseViewModal";


type BillFormat = "JPG" | "PDF";

type ExpenseItem = {
    id: string;
    title: string;
    description: string;
    date: string;
    amount: number;
    billFormat: BillFormat;
};

const expensesData: ExpenseItem[] = [
    {
        id: "1",
        title: "Rent or Mortgage",
        description: "A visual representation of your spending categories...",
        date: "10/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
    {
        id: "2",
        title: "Housing Costs",
        description: "Rack the fluctuations in your spending over we time...",
        date: "11/02/2024",
        amount: 1000,
        billFormat: "PDF",
    },
    {
        id: "3",
        title: "Property Taxes",
        description: "Easily compare your planned budget against we your...",
        date: "12/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
    {
        id: "4",
        title: "Transportation",
        description: "Identify your largest expenditures, you a enabling you...",
        date: "13/02/2024",
        amount: 1000,
        billFormat: "PDF",
    },
    {
        id: "5",
        title: "Financial Breakdown",
        description: "Tailor the dashboard to your unique financial we goals...",
        date: "14/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
    {
        id: "6",
        title: "Expense Tracker",
        description: "preferences by categorizing and organizing your expe...",
        date: "15/02/2024",
        amount: 1000,
        billFormat: "PDF",
    },
    {
        id: "7",
        title: "Personal Expenses",
        description: "future and adjust your budget will become accordingly...",
        date: "16/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
    {
        id: "8",
        title: "Rent or Mortgage",
        description: "expenses will becomea way that makes sense for you...",
        date: "17/02/2024",
        amount: 1000,
        billFormat: "PDF",
    },
    {
        id: "9",
        title: "Cost Management Hub",
        description: "Helping you identify where your money is it is a going...",
        date: "18/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
    {
        id: "10",
        title: "Entertainment",
        description: "Simply navigate through the different sections a to get...",
        date: "19/02/2024",
        amount: 1000,
        billFormat: "PDF",
    },
    {
        id: "11",
        title: "Rent or Mortgage",
        description: "A visual representation of your spending categories...",
        date: "20/02/2024",
        amount: 1000,
        billFormat: "JPG",
    },
];

export default function Expense() {

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);


    const handleAddExpense = () => {
        setSelectedExpense(null);
        setShowExpenseModal(true);
    };

    const handleEditExpense = (expense: ExpenseItem) => {
        setSelectedExpense(expense);
        setShowExpenseModal(true);
    };

    const handleViewExpense = (expense: ExpenseItem) => {
        setSelectedExpense(expense);
        setShowViewModal(true);
    };

    const handleDeleteExpense = (expense: ExpenseItem) => {
        setSelectedExpense(expense);
        setShowDeleteModal(true);
    };

    const handleExpenseSubmit = (data: ExpenseFormData) => {
        console.log("Expense submitted:", data);

        setShowExpenseModal(false);
        setSelectedExpense(null);
    };

    return (
        <div className="rounded-2xl bg-white p-4 sm:p-5">
            {/* Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold leading-[30px] text-[#202224]">
                    Add Expenses Details
                </h2>

                <Button
                    type="button"
                    onClick={handleAddExpense}
                    className="h-12 w-full rounded-[10px] bg-gradient-to-r from-[#FE512E] to-[#F09619] px-4 text-sm font-semibold text-white shadow-none sm:w-auto sm:min-w-[300px]"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Plus size={18} strokeWidth={2.5} />
                        Add New Expenses Details
                    </span>
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <div className="min-w-[980px] overflow-hidden rounded-xl bg-white">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="h-[61px] bg-[#F1F3FF]">
                                <th className="rounded-l-xl px-5 text-left text-sm font-semibold text-[#202224]">
                                    Title
                                </th>
                                <th className="px-5 text-left text-sm font-semibold text-[#202224]">
                                    Description
                                </th>
                                <th className="px-5 text-left text-sm font-semibold text-[#202224]">
                                    Date
                                </th>
                                <th className="px-5 text-left text-sm font-semibold text-[#202224]">
                                    Amount
                                </th>
                                <th className="px-5 text-left text-sm font-semibold text-[#202224]">
                                    Bill Format
                                </th>
                                <th className="rounded-r-xl px-5 text-center text-sm font-semibold text-[#202224]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {expensesData.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="h-[69px] border-b border-[#EDF0F5] last:border-b-0"
                                >
                                    <td className="px-5 text-sm font-medium text-[#434A57]">
                                        {expense.title}
                                    </td>

                                    <td className="max-w-[420px] px-5 text-sm font-medium text-[#434A57]">
                                        <p className="truncate">{expense.description}</p>
                                    </td>

                                    <td className="px-5 text-sm font-medium text-[#434A57]">
                                        {expense.date}
                                    </td>

                                    <td className="px-5 text-sm font-semibold text-[#39973D]">
                                        ₹ {expense.amount}
                                    </td>

                                    <td className="px-5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${expense.billFormat === "PDF"
                                                    ? "bg-[#FFF1F1] text-[#E74C3C]"
                                                    : "bg-[#EEF3FF] text-[#5678E9]"
                                                    }`}
                                            >
                                                {expense.billFormat === "PDF" ? (
                                                    <FileText size={17} />
                                                ) : (
                                                    <FileImage size={17} />
                                                )}
                                            </span>

                                            <span className="text-sm font-medium text-[#434A57]">
                                                {expense.billFormat}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleEditExpense(expense)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF8EF] text-[#39973D] transition hover:bg-[#DDF3E5]"
                                                aria-label="Edit expense"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleViewExpense(expense)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3FF] text-[#5678E9] transition hover:bg-[#E3EBFF]"
                                                aria-label="View expense"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExpense(expense)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1F1] text-[#E74C3C] transition hover:bg-[#FFE4E4]"
                                                aria-label="Delete expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



            <ExpenseFormModal
                open={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                onSubmit={handleExpenseSubmit}
                isEdit={Boolean(selectedExpense)}
                initialData={
                    selectedExpense
                        ? {
                            title: selectedExpense.title,
                            description: selectedExpense.description,
                            date: selectedExpense.date,
                            amount: String(selectedExpense.amount),
                            billName: "Syncfusion Essential Rentagreement.GIF",
                            billSize: "3.5 MB",
                        }
                        : null
                }
            />

            <ExpenseViewModal
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedExpense(null);
                }}
                data={
                    selectedExpense
                        ? {
                            id: selectedExpense.id,
                            title: selectedExpense.title,
                            description:
                                selectedExpense.description ||
                                "A visual representation of your spending categories visual representation.",
                            date: selectedExpense.date,
                            amount: selectedExpense.amount,
                            billName: "Adharcard Front Side.JPG",
                            billSize: "3.5 MB",
                        }
                        : null
                }
            />


            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedExpense(null);
                }}
                onConfirm={() => {
                    console.log("Delete expense:", selectedExpense);
                    setShowDeleteModal(false);
                    setSelectedExpense(null);
                }}
                title="Delete Expense?"
                message="Are you sure you want to delete this?"
            />


        </div>


    );
}