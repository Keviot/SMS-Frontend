export default function OtherInvoices() {
    return (
        <div className="rounded-2xl bg-white p-4 sm:p-5">
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gray-100">
                    <svg
                        className="size-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-700">
                    Other Invoices Coming Soon
                </h2>
                <p className="text-sm text-gray-500">
                    This page will display other types of invoices.
                </p>
            </div>
        </div>
    );
}
