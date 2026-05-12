import { useState, useEffect } from "react";
import { FileImage, FileText, Plus, Loader2 } from "lucide-react";
import Button from "../../../ui/Button";
import ExpenseFormModal, { type ExpenseFormData } from "../components/ExpenseFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ExpenseViewModal from "../components/ExpenseViewModal";
import { EditIcon, EyeIcon, TrashIcon } from "../../../assets/icons/admin-dashboard-icons";
import { financialApi } from "../../../services/api";
import toast from "react-hot-toast";

type BillFormat = "JPG" | "PDF" | "PNG" | "GIF";

type ExpenseItem = {
    id: string;
    title: string;
    description: string;
    date: string;
    amount: number;
    billFormat: BillFormat;
    uploadBill: string;
};

export default function Expense() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    // Fetch expenses on component mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await financialApi.getExpenses();

            // Transform backend data to frontend format
            const transformedExpenses = response.data.map((item: any) => {
                // Extract file extension from uploadBill URL
                const fileExtension = item.uploadBill?.split('.').pop()?.toUpperCase() || 'JPG';
                const billFormat = ['JPG', 'PNG', 'GIF', 'PDF'].includes(fileExtension)
                    ? fileExtension as BillFormat
                    : 'JPG';

                return {
                    id: item._id,
                    title: item.title,
                    description: item.description,
                    date: new Date(item.date).toLocaleDateString("en-GB"),
                    amount: item.amount,
                    billFormat,
                    uploadBill: item.uploadBill,
                };
            });

            setExpenses(transformedExpenses);
        } catch (error: any) {
            console.error("Error fetching expenses:", error);
            toast.error(error.message || "Failed to fetch expenses");
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

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

    const handleExpenseSubmit = async (data: ExpenseFormData) => {
        try {
            const payload = {
                title: data.title,
                description: data.description,
                date: new Date(data.date).toISOString(),
                amount: parseFloat(data.amount),
                uploadBill: data.billName || "", // TODO: Handle file upload properly
            };

            if (selectedExpense) {
                // Edit existing expense
                await financialApi.editExpense(selectedExpense.id, payload);
                toast.success("Expense updated successfully!");
            } else {
                // Add new expense
                await financialApi.addExpense(payload);
                toast.success("Expense added successfully!");
            }

            setShowExpenseModal(false);
            setSelectedExpense(null);

            // Refresh expenses list
            await fetchExpenses();
        } catch (error: any) {
            console.error("Error saving expense:", error);
            toast.error(error.message || "Failed to save expense");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedExpense) return;

            await financialApi.deleteExpense(selectedExpense.id);
            toast.success("Expense deleted successfully!");

            setShowDeleteModal(false);
            setSelectedExpense(null);

            // Refresh expenses list
            await fetchExpenses();
        } catch (error: any) {
            console.error("Error deleting expense:", error);
            toast.error(error.message || "Failed to delete expense");
        }
    };

    return (
        <>
            <div className="rounded-2xl bg-white p-4 sm:p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-8 text-[#202224]">
                        Add Expenses Details
                    </h2>

                    <Button
                        type="button"
                        onClick={handleAddExpense}
                        className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#FE512E] to-[#F09619] px-5 py-3 text-sm font-semibold text-white shadow-none sm:w-auto"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Plus size={18} strokeWidth={2.5} />
                            Add New Expenses Details
                        </span>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl bg-white">
                    <div className="overflow-x-auto">
                        <div className="max-h-[calc(100vh-18rem)] min-w-[60rem] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                    <span className="ml-3 text-gray-600">Loading expenses...</span>
                                </div>
                            ) : expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-gray-500">No expenses found</p>
                                    <Button
                                        onClick={handleAddExpense}
                                        className="mt-4 h-12 rounded-xl px-6"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        Add First Expense
                                    </Button>
                                </div>
                            ) : (
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10 bg-[#F1F3FF]">
                                        <tr>
                                            <th className="rounded-l-xl px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Title
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Description
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Date
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Amount
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold text-[#202224]">
                                                Bill Format
                                            </th>
                                            <th className="rounded-r-xl px-5 py-4 text-center text-sm font-semibold text-[#202224]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {expenses.map((expense) => (
                                            <tr
                                                key={expense.id}
                                                className="border-b border-[#EDF0F5] last:border-b-0"
                                            >
                                                <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                    {expense.title}
                                                </td>

                                                <td className="max-w-md px-5 py-4 text-sm font-medium text-[#434A57]">
                                                    <p className="truncate">{expense.description}</p>
                                                </td>

                                                <td className="px-5 py-4 text-sm font-medium text-[#434A57]">
                                                    {expense.date}
                                                </td>

                                                <td className="px-5 py-4 text-sm font-semibold text-[#39973D]">
                                                    ₹ {expense.amount.toLocaleString()}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`flex size-8 items-center justify-center rounded-lg ${expense.billFormat === "PDF"
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

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditExpense(expense)}
                                                            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#E8F7EC] text-[#39973D] transition hover:scale-105"
                                                            aria-label="Edit expense"
                                                        >
                                                            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
                                                                <EditIcon />
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewExpense(expense)}
                                                            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[#5678E9] transition hover:scale-105"
                                                            aria-label="View expense"
                                                        >
                                                            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
                                                                <EyeIcon />
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteExpense(expense)}
                                                            className="inline-flex aspect-square min-w-8 items-center justify-center rounded-[10px] bg-[#FFF0F0] text-[#E74C3C] transition hover:scale-105"
                                                            aria-label="Delete expense"
                                                        >
                                                            <span className="flex size-4 items-center justify-center [&>svg]:size-4 [&>svg]:text-current">
                                                                <TrashIcon />
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ExpenseFormModal
                open={showExpenseModal}
                onClose={() => {
                    setShowExpenseModal(false);
                    setSelectedExpense(null);
                }}
                onSubmit={handleExpenseSubmit}
                isEdit={Boolean(selectedExpense)}
                initialData={
                    selectedExpense
                        ? {
                            title: selectedExpense.title,
                            description: selectedExpense.description,
                            date: selectedExpense.date,
                            amount: String(selectedExpense.amount),
                            billName: selectedExpense.uploadBill || "Uploaded Bill",
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
                            description: selectedExpense.description,
                            date: selectedExpense.date,
                            amount: selectedExpense.amount,
                            billName: selectedExpense.uploadBill || "Uploaded Bill",
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
                onConfirm={handleConfirmDelete}
                title="Delete Expense?"
                message="Are you sure you want to delete this?"
            />
        </>
    );
}
