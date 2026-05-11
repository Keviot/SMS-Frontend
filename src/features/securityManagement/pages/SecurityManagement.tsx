import { Plus } from "lucide-react";
import DataTable from "../../../ui/DataTable";
import Button from "../../../ui/Button";

const protocolData = [
  { id: 1, title: "Physical Security", description: "Implement surveillance cameras in strategic locations for monitoring.", date: "11/01/2024", time: "3:45 PM" },
  { id: 2, title: "Cybersecurity", description: "Ensure all society data is encrypted and accessible only to authorized personnel.", date: "11/01/2024", time: "3:45 PM" },
  { id: 3, title: "Access Control", description: "Use biometric or keycard access for all common areas and building entries.", date: "11/01/2024", time: "3:45 PM" },
  { id: 4, title: "Emergency Response", description: "Conduct regular fire drills and safety training for all residents.", date: "11/01/2024", time: "3:45 PM" },
];

export default function SecurityManagement() {
  const columns = [
    { 
      key: "title",
      header: "Title", 
      render: (row: any) => <span className="font-bold text-gray-900">{row.title}</span> 
    },
    { 
      key: "description",
      header: "Description", 
      render: (row: any) => (
        <span className="text-sm text-gray-500 max-w-md block truncate lg:whitespace-normal">
          {row.description}
        </span>
      ) 
    },
    { key: "date", header: "Date", render: (row: any) => <span className="text-gray-500">{row.date}</span> },
    { 
      key: "time",
      header: "Time", 
      render: (row: any) => (
        <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
          {row.time}
        </span>
      ) 
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#F6F8FB] min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Security Protocols</h1>
          
          <Button 
            className="bg-[#FE512E] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <Plus size={20} />
            Create Protocol
          </Button>
        </div>

        <div className="overflow-x-auto">
          <DataTable 
            columns={columns} 
            data={protocolData}
            getRowKey={(row) => row.id.toString()}
          />
        </div>
      </div>
    </div>
  );
}
