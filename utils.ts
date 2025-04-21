import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');
}

// Convert a number to words (for "Amount in Words")
export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
               'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
               'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numString = num.toFixed(2);
  const parts = numString.split('.');
  let wholePart = parseInt(parts[0]);
  const decimalPart = parseInt(parts[1]);
  
  if (wholePart === 0) return 'Zero';
  
  let words = '';
  
  // Handle lakhs (100,000s)
  if (wholePart >= 100000) {
    const lakhsCount = Math.floor(wholePart / 100000);
    words += convertLessThanOneHundred(lakhsCount) + ' Lakh ';
    wholePart %= 100000;
  }
  
  // Handle thousands
  if (wholePart >= 1000) {
    const thousandsCount = Math.floor(wholePart / 1000);
    words += convertLessThanOneHundred(thousandsCount) + ' Thousand ';
    wholePart %= 1000;
  }
  
  // Handle hundreds
  if (wholePart >= 100) {
    words += ones[Math.floor(wholePart / 100)] + ' Hundred ';
    wholePart %= 100;
  }
  
  // Handle tens and ones
  if (wholePart > 0) {
    if (words !== '') {
      words += 'and ';
    }
    words += convertLessThanOneHundred(wholePart);
  }
  
  // Add decimal part if it exists
  if (decimalPart > 0) {
    words += ' and ' + decimalPart + '/100';
  }
  
  return words;
  
  // Helper function to convert numbers less than 100 to words
  function convertLessThanOneHundred(n: number): string {
    if (n < 20) {
      return ones[n];
    }
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  }
}
