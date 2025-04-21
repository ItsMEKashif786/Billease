import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import BillForm from "@/pages/bill-form";
import BillView from "@/pages/bill-view";
import NotFound from "@/pages/not-found";
import DeleteModal from "@/components/delete-modal";
import { useEffect, useState } from "react";
import { BillData } from "@/lib/bill-service";

function Router() {
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bills, setBills] = useState<BillData[]>([]);

  useEffect(() => {
    // Load saved bills from localStorage
    const savedBills = localStorage.getItem("b_s_dyeing_bills");
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  // Save bills to localStorage whenever bills change
  useEffect(() => {
    localStorage.setItem("b_s_dyeing_bills", JSON.stringify(bills));
  }, [bills]);

  const handleDeleteConfirmation = (billId: string) => {
    setBillToDelete(billId);
    setShowDeleteModal(true);
  };

  const handleDeleteBill = () => {
    if (billToDelete) {
      setBills(bills.filter(bill => bill.id !== billToDelete));
      setShowDeleteModal(false);
      setBillToDelete(null);
    }
  };

  return (
    <>
      <Switch>
        <Route path="/">
          <Home 
            bills={bills} 
            onDelete={handleDeleteConfirmation} 
            setCurrentBillId={setCurrentBillId}
            setIsEditMode={setIsEditMode}
          />
        </Route>
        <Route path="/bill/new">
          <BillForm 
            bills={bills} 
            setBills={setBills} 
            isEditMode={false} 
            currentBillId={null}
          />
        </Route>
        <Route path="/bill/edit/:id">
          {params => (
            <BillForm 
              bills={bills} 
              setBills={setBills} 
              isEditMode={true} 
              currentBillId={params.id}
            />
          )}
        </Route>
        <Route path="/bill/view/:id">
          {params => (
            <BillView 
              bills={bills}
              billId={params.id}
              setIsEditMode={setIsEditMode}
              setCurrentBillId={setCurrentBillId}
            />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>

      <DeleteModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBill}
      />
      
      <TooltipProvider>
        <Toaster />
      </TooltipProvider>
    </>
  );
}

function App() {
  return <Router />;
}

export default App;
