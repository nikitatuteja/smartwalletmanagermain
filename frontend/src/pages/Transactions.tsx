import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { transactionService, cardService } from "@/services/index";
import { formatCurrency, formatDate } from "@/utils/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Tag,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["Food", "Fuel", "Rent", "Shopping", "Salary", "Freelance", "Utilities", "Entertainment", "Travel", "Other"];

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // UPI Form state
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState("");
  const [targetUpiId, setTargetUpiId] = useState("");
  const [upiNotes, setUpiNotes] = useState("");
  const [upiCategory, setUpiCategory] = useState("Other");

  // Filters
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card">("Cash");
  const [notes, setNotes] = useState("");
  const [cardId, setCardId] = useState("");

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        transactionService.getAll(),
        cardService.getAll()
      ]);
      if (tRes.success) setTransactions(tRes.data);
      if (cRes.success) setCards(cRes.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setAmount(""); setType("Expense"); setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]); setPaymentMethod("Cash"); setNotes(""); 
    setCardId(""); setEditing(null);
  };

  const executeSubmit = async (payload: any) => {
    try {
      if (editing) {
        await transactionService.update(editing.id, payload);
        toast.success("Transaction updated");
      } else {
        await transactionService.create(payload);
        toast.success("Transaction added");
      }
      resetForm(); setOpen(false); fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      amount: parseFloat(amount), 
      type, 
      category, 
      date, 
      payment_method: paymentMethod, 
      notes: notes || null,
      card_id: paymentMethod === "Card" && cardId ? parseInt(cardId) : null
    };

    executeSubmit(payload);
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUpiId) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    const payload = {
      amount: parseFloat(upiAmount),
      type: "Expense",
      category: upiCategory,
      date: new Date().toISOString().split("T")[0],
      payment_method: "UPI",
      notes: upiNotes || `Paid to ${targetUpiId}`,
      card_id: null
    };

    const encodedNotes = encodeURIComponent(upiNotes || `Paid to ${targetUpiId}`);
    const upiUrl = `upi://pay?pa=${targetUpiId}&pn=Receiver&am=${payload.amount}&cu=INR&tn=${encodedNotes}`;
    
    // Attempt to open UPI app
    window.location.href = upiUrl;

    try {
      await transactionService.create(payload);
      toast.success("UPI Payment recorded");
      setUpiAmount(""); setTargetUpiId(""); setUpiNotes(""); setUpiCategory("Other");
      setUpiOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (t: any) => {
    setEditing(t); setAmount(String(t.amount)); setType(t.type);
    setCategory(t.category); setDate(t.date); setPaymentMethod(t.payment_method);
    setNotes(t.notes || ""); setCardId(t.card_id ? String(t.card_id) : ""); setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await transactionService.delete(id);
      toast.success("Transaction deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === "All" || t.type === filterType;
      const matchesCategory = filterCategory === "All" || t.category === filterCategory;
      const matchesSearch = searchQuery === "" || 
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [transactions, filterType, filterCategory, searchQuery]);

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><Skeleton className="h-[400px] rounded-2xl" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your income and expenses</p>
        </div>
        <div className="flex gap-3 items-center">
          <Dialog open={upiOpen} onOpenChange={setUpiOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-primary/50 text-slate-900 dark:text-white hover:bg-primary/10 transition-colors shadow-sm">
                <Smartphone className="mr-2 h-4 w-4 text-[#5B5BD6] dark:text-[#7C7CFF]" /> Pay via UPI
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl glass-card border-white/10">
              <DialogHeader><DialogTitle>Quick UPI Payment</DialogTitle></DialogHeader>
              <form onSubmit={handleUpiSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Receiver UPI ID</Label>
                  <Input required value={targetUpiId} onChange={(e) => setTargetUpiId(e.target.value)} placeholder="e.g. merchant@upi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input type="number" step="0.01" min="0.01" required value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={upiCategory} onValueChange={setUpiCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input value={upiNotes} onChange={(e) => setUpiNotes(e.target.value)} placeholder="What is this for?" />
                </div>
                <Button type="submit" className="w-full rounded-xl py-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg">
                  Pay & Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
          <DialogContent className="rounded-2xl glass-card border-white/10">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Transaction</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod === "Card" && (
                <div className="space-y-2">
                  <Label>Select Card</Label>
                  <Select value={cardId} onValueChange={setCardId}>
                    <SelectTrigger><SelectValue placeholder="Choose a card" /></SelectTrigger>
                    <SelectContent>{cards.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nickname}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
              </div>
              <Button type="submit" className="w-full rounded-xl py-6">{editing ? "Update" : "Add"} Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes or category..." 
            className="pl-10 bg-card/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-card/50"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-card/50"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-card/60 backdrop-blur-2xl rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Banknote size={48} className="opacity-10" />
                      <p className="text-lg font-semibold text-white">No data yet. Start by adding your first entry.</p>
                      <Button className="rounded-xl px-6 py-6 bg-gradient-to-r from-[#5B5BD6] to-[#7C7CFF] text-white text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all" onClick={() => setOpen(true)}>
                        <Plus className="h-5 w-5 mr-2" /> Add 
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.map((t) => (
                <TableRow key={t.id} className="group hover:bg-accent/30 border-white/5">
                  <TableCell className="py-4 text-xs md:text-sm">{formatDate(t.date)}</TableCell>
                  <TableCell className="py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium">{t.category}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="px-2.5 py-1 flex items-center gap-1.5 rounded-lg font-medium w-fit bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm text-xs md:text-sm transition-colors">
                      {t.payment_method === 'UPI' && <Smartphone size={14} className="text-[#5B5BD6] dark:text-[#7C7CFF]" />}
                      {t.payment_method === 'Card' && <CreditCard size={14} className="text-purple-600 dark:text-purple-400" />}
                      {t.payment_method === 'Cash' && <Banknote size={14} className="text-green-600 dark:text-green-400" />}
                      {t.payment_method}
                    </span>
                  </TableCell>
                  <TableCell className={`py-4 text-right font-bold ${t.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 hover:text-primary"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 hover:text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
