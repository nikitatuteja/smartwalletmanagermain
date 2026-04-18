import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cardService } from "@/services/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [cardType, setCardType] = useState("Credit");

  const fetchCards = async () => {
    try {
      const res = await cardService.getAll();
      if (res.success) setCards(res.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lastFour.length !== 4) {
      toast.error("Last four digits must be 4 digits");
      return;
    }
    try {
      const res = await cardService.create({ nickname, last_four: lastFour, card_type: cardType });
      if (res.success) {
        toast.success("Card added");
        setNickname(""); setLastFour(""); setOpen(false);
        fetchCards();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await cardService.delete(id);
      toast.success("Card deleted");
      fetchCards();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your credit and debit cards</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-2xl">
            <DialogHeader><DialogTitle>Add New Card</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Card Nickname</Label>
                <Input placeholder="e.g. HDFC Millennia" required value={nickname} onChange={(e) => setNickname(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Last 4 Digits</Label>
                  <Input placeholder="1234" maxLength={4} required value={lastFour} onChange={(e) => setLastFour(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select value={cardType} onValueChange={setCardType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit">Credit Card</SelectItem>
                      <SelectItem value="Debit">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl py-6">Save Card</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div key={card.id} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <Card className="glass-card border-white/10 overflow-hidden group h-48 flex flex-col justify-between p-6 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-[#5B5BD6]/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">{card.card_type}</p>
                    <h3 className="text-lg font-bold tracking-tight">{card.nickname}</h3>
                  </div>
                  <CreditCard className="text-white/20" size={32} />
                </div>
                
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/40">CARD NUMBER</p>
                    <p className="text-base font-mono tracking-widest text-white/90">•••• •••• •••• {card.last_four}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)} className="h-8 w-8 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {cards.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <CreditCard size={48} className="opacity-10 mb-4" />
            <p className="text-lg font-semibold text-white">No data yet. Start by adding your first entry.</p>
            <Button className="mt-6 rounded-xl bg-gradient-to-r from-[#5B5BD6] to-[#7C7CFF] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base px-6 py-6" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-2" /> Add 
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
