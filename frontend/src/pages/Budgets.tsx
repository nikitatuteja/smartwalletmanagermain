import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { budgetService } from "@/services/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, PieChart, Target, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Budget {
  id: number;
  category: string;
  amount: number;
  month: string;
}

const expenseCategories = ["Food", "Fuel", "Rent", "Shopping", "Utilities", "Entertainment", "Travel", "Healthcare", "Education", "Subscription", "EMI / Loan", "Other Expense"];

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().split("T")[0].substring(0, 7));
  
  // Form state
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      const res = await budgetService.getAll(month);
      if (res.success) setBudgets(res.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, [user, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await budgetService.create({ category, amount: parseFloat(amount), month });
      if (res.success) {
        toast.success("Budget updated");
        setAmount(""); setOpen(false);
        fetchBudgets();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await budgetService.delete(id);
      if (res.success) {
        toast.success("Budget deleted"); fetchBudgets();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><Skeleton className="h-[400px] rounded-2xl" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Monthly Budgets</h1>
          <p className="text-muted-foreground mt-1">Set limits for your spending categories</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="rounded-xl border-white/10 w-40 glass-card"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 rounded-2xl">
              <DialogHeader><DialogTitle>Set Category Budget</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Limit (₹)</Label>
                  <Input type="number" step="100" min="100" required value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border-white/10" />
                </div>
                <Button type="submit" className="w-full rounded-xl py-6 text-lg font-semibold">Set Budget</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {budgets.map((budget) => (
            <motion.div key={budget.id} layout initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <Card className="glass-card border-white/10 overflow-hidden p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{budget.category}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{month}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Monthly Limit</span>
                    <span className="font-bold">₹{budget.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={0} className="h-2 rounded-full bg-white/5" />
                  <p className="text-xs text-muted-foreground">0% of budget spent this month</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {budgets.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <PieChart size={48} className="opacity-10 mb-4" />
            <p className="text-lg">No budgets set for this month</p>
            <p className="text-sm">Start tracking your spending by setting a budget!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
