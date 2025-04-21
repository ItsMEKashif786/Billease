import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BillData, BillItem, generateBillId, getNextBillNumber } from "@/lib/bill-service";
import { numberToWords } from "@/lib/utils";

interface BillFormProps {
  bills: BillData[];
  setBills: React.Dispatch<React.SetStateAction<BillData[]>>;
  isEditMode: boolean;
  currentBillId: string | null;
}

export default function BillForm({ bills, setBills, isEditMode, currentBillId }: BillFormProps) {
  const [, navigate] = useLocation();
  
  // State for bill data
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [items, setItems] = useState<BillItem[]>([{ 
    description: "", 
    quantity: 0, 
    rate: 0, 
    amount: "0.00" 
  }]);
  const [netAmount, setNetAmount] = useState("0.00");
  const [cgstPercent, setCgstPercent] = useState("0");
  const [cgstAmount, setCgstAmount] = useState("0.00");
  const [sgstPercent, setSgstPercent] = useState("0");
  const [sgstAmount, setSgstAmount] = useState("0.00");
  const [igstPercent, setIgstPercent] = useState("0");
  const [igstAmount, setIgstAmount] = useState("0.00");
  const [totalAmount, setTotalAmount] = useState("0.00");
  const [amountInWords, setAmountInWords] = useState("Zero Rupees Only");

  // Set current date and bill number on component mount
  useEffect(() => {
    // Set current date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setBillDate(`${yyyy}-${mm}-${dd}`);
    
    // Set bill number if new bill
    if (!isEditMode) {
      setBillNo(getNextBillNumber(bills).toString());
    }
    
    // Populate form with bill data if editing
    if (isEditMode && currentBillId) {
      const bill = bills.find(b => b.id === currentBillId);
      if (bill) {
        setBillNo(bill.billNo);
        setBillDate(bill.date);
        setCustomerName(bill.customerName);
        setCustomerAddress(bill.customerAddress || "");
        setCustomerGstin(bill.customerGstin || "");
        setCustomerState(bill.customerState || "");
        setStateCode(bill.stateCode || "");
        setItems(bill.items);
        setNetAmount(bill.netAmount);
        setCgstPercent(bill.cgstPercent);
        setCgstAmount(bill.cgstAmount);
        setSgstPercent(bill.sgstPercent);
        setSgstAmount(bill.sgstAmount);
        setIgstPercent(bill.igstPercent);
        setIgstAmount(bill.igstAmount);
        setTotalAmount(bill.totalAmount);
        setAmountInWords(bill.amountInWords);
      }
    }
  }, [isEditMode, currentBillId, bills]);

  // Function to calculate amounts (without setting state)
  const calculateAmounts = () => {
    // Calculate net amount from items
    const calculatedNetAmount = items.reduce((acc, item) => {
      return acc + (item.quantity * item.rate);
    }, 0);
    
    // Calculate tax amounts
    const cgstAmountValue = (calculatedNetAmount * parseFloat(cgstPercent || "0")) / 100;
    const sgstAmountValue = (calculatedNetAmount * parseFloat(sgstPercent || "0")) / 100;
    const igstAmountValue = (calculatedNetAmount * parseFloat(igstPercent || "0")) / 100;
    const calculatedTotalAmount = calculatedNetAmount + cgstAmountValue + sgstAmountValue + igstAmountValue;
    
    return {
      netAmount: calculatedNetAmount.toFixed(2),
      cgstAmount: cgstAmountValue.toFixed(2),
      sgstAmount: sgstAmountValue.toFixed(2),
      igstAmount: igstAmountValue.toFixed(2),
      totalAmount: calculatedTotalAmount.toFixed(2),
      amountInWords: numberToWords(calculatedTotalAmount) + " Rupees Only"
    };
  };
  
  // Update amounts when items or tax percentages change
  useEffect(() => {
    // First, update each item's amount field
    const updatedItems = items.map(item => ({
      ...item,
      amount: (item.quantity * item.rate).toFixed(2)
    }));
    
    // Only update items state if the amounts have actually changed
    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
      return; // Skip the rest - the next useEffect will handle the rest
    }
    
    // Calculate and update all the amounts
    const amounts = calculateAmounts();
    setNetAmount(amounts.netAmount);
    setCgstAmount(amounts.cgstAmount);
    setSgstAmount(amounts.sgstAmount);
    setIgstAmount(amounts.igstAmount);
    setTotalAmount(amounts.totalAmount);
    setAmountInWords(amounts.amountInWords);
  }, [
    items.map(item => item.quantity + "-" + item.rate).join(','), // Custom dependency that only changes when values change
    cgstPercent, 
    sgstPercent, 
    igstPercent
  ]);

  // Add a new empty item row
  const addNewItemRow = () => {
    setItems([...items, { description: "", quantity: 0, rate: 0, amount: "0.00" }]);
  };

  // Remove an item row
  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  // Handle item field changes
  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    const updatedItems = [...items];
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index][field] = parseFloat(value as string) || 0;
    } else {
      updatedItems[index][field as 'description' | 'amount'] = value as string;
    }
    
    setItems(updatedItems);
  };

  // Save the bill
  const saveBill = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    const billData: BillData = {
      id: isEditMode && currentBillId ? currentBillId : generateBillId(),
      billNo,
      date: billDate,
      customerName,
      customerAddress,
      customerGstin,
      customerState,
      stateCode,
      items,
      netAmount,
      cgstPercent,
      cgstAmount,
      sgstPercent,
      sgstAmount,
      igstPercent,
      igstAmount,
      totalAmount,
      amountInWords
    };
    
    if (isEditMode && currentBillId) {
      // Update existing bill
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === currentBillId ? billData : bill
        )
      );
    } else {
      // Add new bill
      setBills(prevBills => [...prevBills, billData]);
    }
    
    // Navigate back to home
    navigate("/");
  };

  // Validate the form
  const validateForm = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return false;
    }
    
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        alert(`Please enter a description for item ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">
          {isEditMode ? "Edit Bill" : "Create New Bill"}
        </h1>
        <div className="flex space-x-2">
          <Button 
            onClick={saveBill}
            className="bg-accent hover:bg-green-600 text-white"
          >
            Save Bill
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </Button>
        </div>
      </header>

      <Card className="bg-white rounded-lg shadow">
        <div className="w-[210mm] min-h-[297mm] p-[15mm] bg-white mx-auto relative">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill No:</label>
                <Input 
                  type="text" 
                  value={billNo} 
                  onChange={(e) => setBillNo(e.target.value)} 
                  readOnly 
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name:</label>
                <Input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required 
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                <Textarea 
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  className="border rounded px-3 py-2 w-full" 
                  rows={2}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN:</label>
                <Input 
                  type="text" 
                  value={customerGstin} 
                  onChange={(e) => setCustomerGstin(e.target.value)} 
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="w-1/2 pl-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                <Input 
                  type="date" 
                  value={billDate} 
                  onChange={(e) => setBillDate(e.target.value)} 
                  required 
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">State:</label>
                <Input 
                  type="text" 
                  value={customerState} 
                  onChange={(e) => setCustomerState(e.target.value)} 
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">State Code:</label>
                <Input 
                  type="text" 
                  value={stateCode} 
                  onChange={(e) => setStateCode(e.target.value)} 
                  className="border rounded px-3 py-2 w-3/4"
                />
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
                  <th className="border border-gray-300 p-2 w-[10%] print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        type="text"
                        className="w-full border-0 p-0"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        type="number"
                        className="w-full border-0 p-0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input
                        type="number"
                        className="w-full border-0 p-0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {parseFloat(item.amount).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center print:hidden">
                      <Button
                        onClick={() => removeItemRow(index)}
                        className="text-red-500 p-0 h-auto hover:bg-transparent hover:text-red-700"
                        variant="ghost"
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              onClick={addNewItemRow}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 print:hidden"
              variant="ghost"
            >
              + Add Row
            </Button>
          </div>

          {/* Bill Calculation Section */}
          <div className="flex justify-between mb-6">
            <div className="w-1/2 pr-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Words:</label>
                <div className="border rounded px-3 py-2 bg-gray-50 italic">
                  {amountInWords}
                </div>
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
                    <td className="py-2 pl-4 text-right">{parseFloat(netAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium flex items-center justify-end">
                      CGST @ 
                      <Input
                        type="number"
                        className="w-12 mx-1 text-center py-0 h-6"
                        value={cgstPercent}
                        onChange={(e) => setCgstPercent(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      %:
                    </td>
                    <td className="py-2 pl-4 text-right">{parseFloat(cgstAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium flex items-center justify-end">
                      SGST @ 
                      <Input
                        type="number"
                        className="w-12 mx-1 text-center py-0 h-6"
                        value={sgstPercent}
                        onChange={(e) => setSgstPercent(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      %:
                    </td>
                    <td className="py-2 pl-4 text-right">{parseFloat(sgstAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-right font-medium flex items-center justify-end">
                      IGST @ 
                      <Input
                        type="number"
                        className="w-12 mx-1 text-center py-0 h-6"
                        value={igstPercent}
                        onChange={(e) => setIgstPercent(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      %:
                    </td>
                    <td className="py-2 pl-4 text-right">{parseFloat(igstAmount).toFixed(2)}</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="py-2 text-right font-bold">TOTAL AMOUNT:</td>
                    <td className="py-2 pl-4 text-right font-bold">{parseFloat(totalAmount).toFixed(2)}</td>
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
