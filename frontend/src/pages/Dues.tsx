import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { dueService, cardService, paymentService } from "@/services/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CalendarClock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Due {
  id: number;
  amount: number;
  due_date: string;
  is_paid: boolean;
  is_overdue: boolean;
  card_id: number;
  card?: { nickname: string; last_four: string };
}

export default function Dues() {
  const { user } = useAuth();
  const [dues, setDues] = useState<Due[]>([]);
  const [cards, setCards] = useState<{id: number, nickname: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Payment State
  const [pendingDue, setPendingDue] = useState<Due | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [cardId, setCardId] = useState("");

  const fetchData = async () => {
    if (!user) return;
    try {
      const [duesRes, cardsRes] = await Promise.all([
        dueService.getAll(),
        cardService.getAll()
      ]);
      if (duesRes.success) setDues(duesRes.data);
      if (cardsRes.success) setCards(cardsRes.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await dueService.create({ 
        amount: parseFloat(amount), 
        due_date: dueDate, 
        card_id: parseInt(cardId) 
      });
      if (res.success) {
        toast.success("Due added");
        setAmount(""); setDueDate(""); setCardId(""); setOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const executeTogglePaid = async (due: Due) => {
    try {
      const res = await dueService.update(due.id, { is_paid: !due.is_paid });
      if (res.success) {
        toast.success(due.is_paid ? "Marked as unpaid" : "Marked as paid");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleTogglePaid = async (due: Due) => {
    if (!due.is_paid) {
      setPendingDue(due);
      
      try {
        const orderRes: any = await paymentService.createOrder({ amount: due.amount });
        if (orderRes.success && orderRes.order_id) {
          const options = {
            key: orderRes.key_id,
            amount: orderRes.amount,
            currency: orderRes.currency,
            name: "FinTrack",
            description: `Payment for Due: ${cards.find(c => c.id === due.card_id)?.nickname || 'Card'}`,
            order_id: orderRes.order_id,
            handler: async (response: any) => {
              try {
                const verifyRes = await paymentService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  due_id: due.id
                });
                if (verifyRes.success) {
                  toast.success("Payment Successful!");
                  fetchData();
                } else {
                  toast.error("Payment verification failed");
                }
              } catch (err: any) {
                toast.error(err.message || "Payment verification failed");
              }
            },
            prefill: {
              email: user?.email,
              contact: ""
            },
            theme: {
              color: "#4f46e5"
            }
          };
          
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any){
            toast.error(`Payment Failed: ${response.error.description}`);
          });
          rzp.open();
        } else {
          toast.error("Failed to initialize payment");
        }
      } catch (err: any) {
        toast.error(err.message || "Could not connect to payment gateway");
      }
      
    } else {
      executeTogglePaid(due);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await dueService.delete(id);
      if (res.success) {
        toast.success("Due deleted"); fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><Skeleton className="h-[400px] rounded-2xl" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Credit Card Dues</h1>
          <p className="text-muted-foreground mt-1">Never miss a payment date again</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Due
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-2xl">
            <DialogHeader><DialogTitle>Add New Due Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Card</Label>
                <Select value={cardId} onValueChange={setCardId}>
                  <SelectTrigger className="rounded-xl border-white/10"><SelectValue placeholder="Choose a card" /></SelectTrigger>
                  <SelectContent>
                    {cards.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nickname}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl border-white/10" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl py-6 text-lg font-semibold">Track Due</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {dues.map((due) => (
            <motion.div key={due.id} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Card className={`glass-card border-white/10 overflow-hidden relative group ${due.is_paid ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                {due.is_overdue && !due.is_paid && (
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="destructive" className="animate-pulse rounded-lg">OVERDUE</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-indigo-500" />
                    Due for {cards.find(c => c.id === due.card_id)?.nickname || 'Card'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tight">₹{due.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground mt-1">PAY BEFORE {due.due_date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      variant={due.is_paid ? "outline" : "default"} 
                      className="flex-1 rounded-xl h-11 font-semibold"
                      onClick={() => handleTogglePaid(due)}
                    >
                      {due.is_paid ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                      {due.is_paid ? "Paid" : "Mark as Paid"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(due.id)} className="h-11 w-11 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {dues.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <AlertCircle size={48} className="opacity-10 mb-4" />
            <p className="text-lg">No pending dues to track</p>
            <p className="text-sm">Enjoy your debt-free life!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
