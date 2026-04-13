import { useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  CalendarClock, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/contexts/DashboardContext";
import { dashboardService, transactionService } from "@/services/index";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Food", "Fuel", "Rent", "Shopping", "Salary", "Freelance", "Utilities", "Entertainment", "Travel", "Other"];

export default function Dashboard() {
  const { data, loading, refetch } = useDashboard()!;
  const { user } = useAuth();
  
  // Quick Payment State
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [quickPayAmount, setQuickPayAmount] = useState("");
  const [quickPayCategory, setQuickPayCategory] = useState("Shopping");
  const [quickPayNotes, setQuickPayNotes] = useState("");

  const handleQuickPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayAmount || parseFloat(quickPayAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      const res = await transactionService.create({
        amount: parseFloat(quickPayAmount),
        type: "Expense",
        category: quickPayCategory,
        notes: quickPayNotes || `Quick Payment for ${quickPayCategory}`,
        date: new Date().toISOString()
      });
      if (res.success) {
        toast.success("Payment recorded successfully!");
        setQuickPayAmount("");
        setQuickPayNotes("");
        setIsQuickPayOpen(false);
        refetch();
      } else {
        toast.error("Failed to record payment");
      }
    } catch(err: any) {
      toast.error(err.message || "Error recording payment");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Total Income", 
      value: formatCurrency(data?.total_income || 0), 
      icon: TrendingUp, 
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    { 
      title: "Total Expense", 
      value: formatCurrency(data?.total_expense || 0), 
      icon: TrendingDown, 
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    { 
      title: "Net Balance", 
      value: formatCurrency(data?.net_balance || 0), 
      icon: Wallet, 
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Financial summary for {data?.current_month}</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isQuickPayOpen} onOpenChange={setIsQuickPayOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                  <CreditCard className="mr-2 h-4 w-4" /> Make Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Quick Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleQuickPaySubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                      value={quickPayAmount}
                      onChange={(e) => setQuickPayAmount(e.target.value)}
                      className="h-12 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={quickPayCategory} onValueChange={setQuickPayCategory}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Input 
                      placeholder="What is this for?" 
                      value={quickPayNotes}
                      onChange={(e) => setQuickPayNotes(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700">
                    Proceed to Checkout
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button asChild variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
              <Link to="/transactions">Manage Transactions</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="glass-card border-white/10 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Cards</p>
                  </div>
                </div>
                <span className="text-xl font-bold">{data?.total_cards}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upcoming Dues</p>
                  </div>
                </div>
                <span className="text-xl font-bold">{data?.upcoming_dues}</span>
              </div>

              {data?.overdue_dues > 0 && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} />
                    <div>
                      <p className="text-sm font-medium">Overdue Dues</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">{data?.overdue_dues}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                  "Your net balance for this month is {data?.net_balance >= 0 ? 'positive' : 'negative'}."
                </p>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10">
                  <h4 className="font-semibold text-indigo-400 mb-2">Tip</h4>
                  <p className="text-sm text-muted-foreground">Track your expenses daily to stay on top of your financial goals.</p>
                  <Button variant="link" className="p-0 h-auto mt-4 text-indigo-400 group" asChild>
                    <Link to="/analytics" className="flex items-center gap-1">
                      View detailed analytics <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>


    </>
  );
}
