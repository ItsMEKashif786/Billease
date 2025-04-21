import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BillData } from "@/lib/bill-service";

interface HomeProps {
  bills: BillData[];
  onDelete: (id: string) => void;
  setCurrentBillId: (id: string) => void;
  setIsEditMode: (isEdit: boolean) => void;
}

export default function Home({ bills, onDelete, setCurrentBillId, setIsEditMode }: HomeProps) {
  const [, navigate] = useLocation();

  const handleViewBill = (id: string) => {
    navigate(`/bill/view/${id}`);
  };

  const handleEditBill = (id: string) => {
    setCurrentBillId(id);
    setIsEditMode(true);
    navigate(`/bill/edit/${id}`);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">B.S. Dyeing - Bill Management System</h1>
        <Link href="/bill/new">
          <Button className="bg-accent hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-transform hover:rotate-90">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Bills</h2>
          
          {bills.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No Saved Bills</p>
              <p className="mt-2">Click the + button to create your first bill</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Bill No.</th>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Customer</th>
                    <th className="py-2 px-4 text-left">Total Amount</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="py-2 px-4">{bill.billNo}</td>
                      <td className="py-2 px-4">{formatDate(bill.date)}</td>
                      <td className="py-2 px-4">{bill.customerName}</td>
                      <td className="py-2 px-4">
                        {parseFloat(bill.totalAmount).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="py-2 px-4 flex space-x-2">
                        <Button 
                          onClick={() => handleViewBill(bill.id)}
                          className="bg-primary text-white px-2 py-1 rounded text-sm h-auto"
                        >
                          View
                        </Button>
                        <Button 
                          onClick={() => handleEditBill(bill.id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm h-auto hover:bg-yellow-600"
                        >
                          Edit
                        </Button>
                        <Button 
                          onClick={() => onDelete(bill.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm h-auto hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
