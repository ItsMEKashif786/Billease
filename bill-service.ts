export interface BillItem {
  description: string;
  quantity: number;
  rate: number;
  amount: string;
}

export interface BillData {
  id: string;
  billNo: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  customerGstin?: string;
  customerState?: string;
  stateCode?: string;
  items: BillItem[];
  netAmount: string;
  cgstPercent: string;
  cgstAmount: string;
  sgstPercent: string;
  sgstAmount: string;
  igstPercent: string;
  igstAmount: string;
  totalAmount: string;
  amountInWords: string;
}

// Generate a unique ID for a bill
export function generateBillId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get the next available bill number
export function getNextBillNumber(bills: BillData[]): number {
  if (bills.length === 0) {
    return 1;
  }
  
  // Find the highest bill number to determine the next bill number
  const highestBillNo = Math.max(
    ...bills.map(bill => parseInt(bill.billNo.replace(/\D/g, '')))
  );
  
  return highestBillNo + 1;
}
