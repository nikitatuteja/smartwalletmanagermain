import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cardService } from "@/services/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CreditCard, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const THEMES: Record<string, string> = {
  Blue: "from-blue-600 to-indigo-900 border-blue-400/30 text-white shadow-blue-900/20",
  Black: "from-zinc-800 to-black border-zinc-700/50 text-white shadow-black/50",
  Silver: "from-slate-200 to-slate-400 border-white/60 text-slate-800 shadow-slate-300/30",
  Gold: "from-yellow-200 to-amber-500 border-yellow-200/50 text-slate-900 shadow-amber-500/20"
};

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form State
  const [nickname, setNickname] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [cardType, setCardType] = useState("Credit");
  const [bankName, setBankName] = useState("");
  const [network, setNetwork] = useState("Visa");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [availableLimit, setAvailableLimit] = useState("");
  const [status, setStatus] = useState("Active");
  const [colorTheme, setColorTheme] = useState("Blue");

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

  const resetForm = () => {
    setNickname(""); setLastFour(""); setCardType("Credit");
    setBankName(""); setNetwork("Visa"); setCardName("");
    setExpiryMonth(""); setExpiryYear(""); setBillingDate("");
    setCreditLimit(""); setAvailableLimit(""); setStatus("Active"); setColorTheme("Blue");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lastFour.length !== 4) {
      toast.error("Last four digits must be 4 digits");
      return;
    }
    try {
      const payload = {
        nickname, last_four: lastFour, card_type: cardType,
        bank_name: bankName, network, card_name: cardName,
        expiry_month: expiryMonth, expiry_year: expiryYear,
        billing_date: billingDate ? parseInt(billingDate) : null,
        credit_limit: creditLimit ? parseFloat(creditLimit) : null,
        available_limit: availableLimit ? parseFloat(availableLimit) : null,
        status, color_theme: colorTheme
      };
      const res = await cardService.create(payload);
      if (res.success) {
        toast.success("Card added successfully");
        setOpen(false); resetForm(); fetchCards();
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

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1,2,3].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your credit and debit cards</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-2xl">Add New Card</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nickname <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. Primary Shopping Card" required value={nickname} onChange={(e) => setNickname(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input placeholder="e.g. HDFC Bank, Chase" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last 4 Digits <span className="text-red-500">*</span></Label>
                    <Input placeholder="1234" maxLength={4} minLength={4} required value={lastFour} onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visa">Visa</SelectItem>
                        <SelectItem value="Mastercard">Mastercard</SelectItem>
                        <SelectItem value="RuPay">RuPay</SelectItem>
                        <SelectItem value="Amex">Amex</SelectItem>
                        <SelectItem value="Discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Card Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Card Type</Label>
                    <Select value={cardType} onValueChange={setCardType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit">Credit Card</SelectItem>
                        <SelectItem value="Debit">Debit Card</SelectItem>
                        <SelectItem value="Prepaid">Prepaid Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Card Variant / Name</Label>
                    <Input placeholder="e.g. Millennia, Sapphire" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Month</Label>
                    <Input placeholder="MM" maxLength={2} value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Year</Label>
                    <Input placeholder="YYYY" maxLength={4} value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Date (Day)</Label>
                    <Input placeholder="1-31" type="number" min="1" max="31" value={billingDate} onChange={(e) => setBillingDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {cardType === 'Credit' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-primary">Limits (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Credit Limit</Label>
                      <Input placeholder="0.00" type="number" min="0" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Limit</Label>
                      <Input placeholder="0.00" type="number" min="0" step="0.01" value={availableLimit} onChange={(e) => setAvailableLimit(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Display Styling</h3>
                <div className="space-y-2">
                  <Label>Card Color Theme</Label>
                  <Select value={colorTheme} onValueChange={setColorTheme}>
                    <SelectTrigger className="w-full md:w-1/2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blue">Classic Blue</SelectItem>
                      <SelectItem value="Black">Premium Black</SelectItem>
                      <SelectItem value="Silver">Platinum Silver</SelectItem>
                      <SelectItem value="Gold">Luxury Gold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl py-6 font-semibold text-lg mt-4 h-14">Save Card Details</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {cards.map((card) => {
            const themeClass = THEMES[card.color_theme] || THEMES["Blue"];
            // Determine text opacity classes based on the theme (dark themes want lighter text, light themes want darker text)
            const isLightCard = card.color_theme === "Silver" || card.color_theme === "Gold";
            const secondaryTextClass = isLightCard ? "text-slate-600" : "text-white/70";
            const primaryTextClass = isLightCard ? "text-slate-900" : "text-white";

            return (
              <motion.div key={card.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className={`relative overflow-hidden group h-64 flex flex-col justify-between p-7 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br border shadow-lg ${themeClass}`}>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-xl pointer-events-none"></div>

                  {/* Top Row: Bank name + Network */}
                  <div className="relative flex items-start justify-between z-10">
                    <div className="flex flex-col">
                      <h3 className={`text-xl font-bold tracking-tight ${primaryTextClass}`}>
                        {card.bank_name || card.nickname}
                      </h3>
                      {card.bank_name && (
                        <p className={`text-sm ${secondaryTextClass} font-medium`}>{card.nickname}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold italic text-xl tracking-wider">{card.network}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${isLightCard ? 'bg-black/10' : 'bg-white/10'}`}>
                        {card.card_type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Middle Row: Chip + Number */}
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${isLightCard ? 'from-amber-200 to-amber-400 opacity-80' : 'from-yellow-200 to-yellow-500'} flex items-center justify-center`}>
                          <div className="w-6 h-4 border border-black/20 rounded-sm grid grid-cols-3 grid-rows-2 gap-[1px] opacity-40">
                             <div className="border-r border-b border-black"></div><div className="border-r border-b border-black"></div><div className="border-b border-black"></div>
                             <div className="border-r border-black"></div><div className="border-r border-black"></div><div></div>
                          </div>
                       </div>
                       <Wifi className={`${primaryTextClass} opacity-60 rotate-90`} size={20} />
                    </div>
                    <p className={`text-2xl font-mono tracking-[0.2em] drop-shadow-sm ${primaryTextClass}`}>
                      •••• •••• •••• {card.last_four}
                    </p>
                  </div>

                  {/* Bottom Row: Name, Expiry, Delete */}
                  <div className="relative flex items-end justify-between z-10">
                    <div className="flex gap-6">
                      <div className="space-y-1">
                        <p className={`text-[9px] uppercase tracking-widest ${secondaryTextClass}`}>Card Holder</p>
                        <p className={`text-sm font-semibold uppercase tracking-wider ${primaryTextClass} truncate max-w-[120px]`}>
                          {card.card_name || 'VALUED CUSTOMER'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-[9px] uppercase tracking-widest ${secondaryTextClass}`}>Expires</p>
                        <p className={`text-sm font-semibold font-mono ${primaryTextClass}`}>
                          {card.expiry_month ? `${card.expiry_month}/${card.expiry_year?.substring(2) || '**'}` : '**/__'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.status !== 'Active' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/80 text-white px-2 py-1 rounded-md shadow-sm">
                          {card.status}
                        </span>
                      )}
                      {card.credit_limit && (
                        <div className="text-right mr-2 hidden sm:block">
                          <p className={`text-[9px] uppercase tracking-widest ${secondaryTextClass}`}>Credit Limit</p>
                          <p className={`text-xs font-bold ${primaryTextClass}`}>₹{card.credit_limit.toLocaleString()}</p>
                        </div>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)} className={`h-8 w-8 hover:bg-black/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full ${isLightCard ? 'text-slate-700' : 'text-white'}`}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {cards.length === 0 && !loading && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <CreditCard size={56} className="opacity-10 mb-6" />
            <p className="text-xl font-semibold text-white">No cards saved yet.</p>
            <p className="text-sm mt-2 opacity-60">Add your credit or debit cards to manage your finances seamlessly.</p>
            <Button className="mt-8 rounded-xl bg-gradient-to-r from-[#5B5BD6] to-[#7C7CFF] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base px-8 py-6 h-auto" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-2" /> Add Your First Card
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

