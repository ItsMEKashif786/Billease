import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BillData } from "@/lib/bill-service";
import { formatDate } from "@/lib/utils";

interface BillViewProps {
  bills: BillData[];
  billId: string;
  setIsEditMode: (isEdit: boolean) => void;
  setCurrentBillId: (id: string) => void;
}

export default function BillView({ bills, billId, setIsEditMode, setCurrentBillId }: BillViewProps) {
  const [, navigate] = useLocation();
  
  const bill = bills.find(b => b.id === billId);
  
  if (!bill) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bill Not Found</h2>
          <p>The requested bill could not be found.</p>
          <Button 
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleEdit = () => {
    setCurrentBillId(billId);
    setIsEditMode(true);
    navigate(`/bill/edit/${billId}`);
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-primary">View Bill</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handlePrint}
            className="bg-primary hover:bg-blue-700 text-white"
          >
            Print Bill
          </Button>
          <Button 
            onClick={handleEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Edit
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Back
          </Button>
        </div>
      </header>

      <Card className="print:shadow-none print:border-0">
        <div className="w-[210mm] min-h-[297mm] p-[15mm] bg-white mx-auto relative print:p-[10mm]">
          {/* Bill Header */}
          <div className="border-b-2 border-gray-300 pb-4 mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold uppercase">B.S. DYEING</h1>
              <p className="text-sm mb-1">GARHI WALA & HANDBLOCK PRINTING</p>
              <p className="text-sm mb-1">SANGANER, JAIPUR (RAJ.)</p>
              <p className="text-sm">GST IN: 08XXXXXXXXXXXZX</p>
            </div>
          </div>

          {/* Bill Details Section */}
          <div className="flex justify-between mb-6">
            <div className="w-1/2 pr-4">
              <div className="mb-3">
                <p><span className="font-medium">Bill No:</span> {bill.billNo}</p>
              </div>
              <div className="mb-3">
                <p><span className="font-medium">Customer Name:</span> {bill.customerName}</p>
              </div>
              <div className="mb-3">
                <p><span className="font-medium">Address:</span> {bill.customerAddress}</p>
              </div>
              <div className="mb-3">
                <p><span className="font-medium">GSTIN:</span> {bill.customerGstin}</p>
              </div>
            </div>
            <div className="w-1/2 pl-4">
              <div className="mb-3">
                <p><span className="font-medium">Date:</span> {formatDate(bill.date)}</p>
              </div>
              <div className="mb-3">
                <p><span className="font-medium">State:</span> {bill.customerState}</p>
              </div>
              <div className="mb-3">
                <p><span className="font-medium">State Code:</span> {bill.stateCode}</p>
              </div>
            </div>
          </div>

          {/* Bill Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 w-[5%]">S.No.</th>
                  <th className="border border-gray-300 p-2 w-[45%]">Description</th>
                  <th className="border border-gray-300 p-2 w-[10%]">Qty</th>
                  <th className="border border-gray-300 p-2 w-[10%]">Rate</th>
                  <th className="border border-gray-300 p-2 w-[20%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.rate}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {parseFloat(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Calculation Section */}
          <div className="flex justify-between mb-6">
            <div className="w-1/2 pr-4">
              <div className="mb-3">
                <p><span className="font-medium">Amount in Words:</span></p>
                <p className="italic">{bill.amountInWords}</p>
              </div>
              
              <div className="mt-8">
                <p className="text-sm mb-1">Bank Details:</p>
                <p className="text-sm mb-1">For: B.S. Dyeing</p>
                <p className="text-sm mb-1">Bank: State Bank of India</p>
                <p className="text-sm mb-1">A/c No: XXXXXXXXXXXX</p>
                <p className="text-sm mb-1">IFSC: SBIN0XXXXX</p>
                <p className="text-sm">Branch: Sanganer, Jaipur</p>
              </div>
            </div>
            
            <div className="w-1/2 pl-4">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-2 text-right font-medium">Net Amount:</td>
                    <td className="py-2 pl-4 text-right">
                      {parseFloat(bill.netAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium">CGST @ {bill.cgstPercent}%:</td>
                    <td className="py-2 pl-4 text-right">
                      {parseFloat(bill.cgstAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium">SGST @ {bill.sgstPercent}%:</td>
                    <td className="py-2 pl-4 text-right">
                      {parseFloat(bill.sgstAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium">IGST @ {bill.igstPercent}%:</td>
                    <td className="py-2 pl-4 text-right">
                      {parseFloat(bill.igstAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="py-2 text-right font-bold">TOTAL AMOUNT:</td>
                    <td className="py-2 pl-4 text-right font-bold">
                      {parseFloat(bill.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between mt-12">
            <div className="w-1/2">
              <p className="font-medium mb-8">Receiver's Signature</p>
            </div>
            <div className="w-1/2 text-right">
              <p className="font-medium mb-1">For B.S. DYEING</p>
              <p className="mt-8">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
