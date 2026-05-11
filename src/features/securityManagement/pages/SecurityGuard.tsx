import { Plus } from "lucide-react";
import { useState } from "react";
import DataTable from "../../../ui/DataTable";
import Button from "../../../ui/Button";
import AddVisitorModal from "../components/AddVisitorModal";

const dummyVisitors = [
  { id: 1, name: "Evelyn Harper", phone: "97852 12369", date: "10/01/2024", unit: "A", number: "1001", time: "3:45 PM", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Wade Warren", phone: "97852 25893", date: "10/01/2024", unit: "B", number: "1002", time: "2:45 AM", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Guy Hawkins", phone: "97589 55563", date: "10/01/2024", unit: "C", number: "1003", time: "3:00 PM", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Robert Fox", phone: "97444 98323", date: "10/01/2024", unit: "D", number: "1004", time: "5:30 AM", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Jacob Jones", phone: "97123 12583", date: "10/01/2024", unit: "E", number: "2001", time: "12:45 PM", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Ronald Richards", phone: "97259 12363", date: "10/01/2024", unit: "F", number: "2002", time: "3:45 PM", avatar: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "Annette Black", phone: "97569 77763", date: "10/01/2024", unit: "G", number: "2003", time: "6:00 AM", avatar: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Jerome Bell", phone: "97123 25863", date: "10/01/2024", unit: "H", number: "2004", time: "3:45 PM", avatar: "https://i.pravatar.cc/150?u=8" },
  { id: 9, name: "Theresa Webb", phone: "97258 36973", date: "10/01/2024", unit: "I", number: "3001", time: "7:00 PM", avatar: "https://i.pravatar.cc/150?u=9" },
  { id: 10, name: "Kathryn Murphy", phone: "97577 66663", date: "10/01/2024", unit: "A", number: "3002", time: "6:00 AM", avatar: "https://i.pravatar.cc/150?u=10" },
];

export default function SecurityGuard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      key: "name",
      header: "Visitor Name",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt="" className="h-10 w-10 rounded-full border border-gray-100" />
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone Number", render: (row: any) => <span className="text-gray-500">{row.phone}</span> },
    { key: "date", header: "Date", render: (row: any) => <span className="text-gray-500">{row.date}</span> },
    { 
      key: "unit",
      header: "Unit Number", 
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[12px] font-bold text-blue-600">
            {row.unit}
          </span>
          <span className="font-bold text-gray-900">{row.number}</span>
        </div>
      ) 
    },
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
          <h1 className="text-xl font-bold text-gray-900">Visitor Tracking</h1>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#FE512E] transition-all">
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
            </select>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FE512E] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Plus size={20} />
              Add Visiter details
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable 
            columns={columns} 
            data={dummyVisitors}
            getRowKey={(row) => row.id.toString()}
          />
        </div>
      </div>

      <AddVisitorModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
