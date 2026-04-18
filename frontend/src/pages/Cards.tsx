import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cardService } from "@/services/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CreditCard, Wifi } from "lucide-react";
import { Card as UICard } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const THEMES: Record<string, string> = {
  Blue: "from-blue-600 to-indigo-900 border-blue-400/30 text-white shadow-blue-900/20",
  Black: "from-zinc-800 to-black border-zinc-700/50 text-white shadow-black/50",
  Silver: "from-slate-200 to-slate-400 border-white/60 text-slate-800 shadow-slate-300/30",
  Purple: "from-purple-600 to-fuchsia-900 border-purple-400/30 text-white shadow-purple-900/20",
  Gold: "from-yellow-200 to-amber-500 border-yellow-200/50 text-slate-900 shadow-amber-500/20",
  Green: "from-emerald-500 to-teal-900 border-emerald-400/30 text-white shadow-emerald-900/20"
};

const CardVisual = ({ card, isPreview = false, onDelete }: { card: any, isPreview?: boolean, onDelete?: (id: number) => void }) => {
  const themeClass = THEMES[card.color_theme] || THEMES["Blue"];
  const isLightCard = card.color_theme === "Silver" || card.color_theme === "Gold";
  const secondaryTextClass = isLightCard ? "text-slate-600" : "text-white/70";
  const primaryTextClass = isLightCard ? "text-slate-900" : "text-white";

  return (
    <UICard className={`relative overflow-hidden rounded-2xl h-64 flex flex-col justify-between p-7 transition-all duration-500 bg-gradient-to-br border shadow-lg ${themeClass} ${isPreview ? 'shadow-2xl scale-100 hover:scale-105 hover:shadow-indigo-500/20 border-white/20' : 'group hover:-translate-y-2 hover:shadow-2xl cursor-pointer'}`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-xl pointer-events-none"></div>

      {/* Top Row: Bank name + Network */}
      <div className="relative flex items-start justify-between z-10">
        <div className="flex flex-col">
          <h3 className={`text-[1.1rem] font-bold tracking-tight transition-colors duration-300 ${primaryTextClass} truncate max-w-[180px]`}>
            {card.bank_name || (isPreview ? "Bank Name" : "")}
          </h3>
          <p className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${primaryTextClass} truncate max-w-[180px]`}>
            {card.card_name || (isPreview ? "Variant Name" : "")}
          </p>
          {(card.nickname || isPreview) && (
            <p className={`text-[10px] ${secondaryTextClass} font-medium transition-colors duration-300 mt-1 truncate max-w-[150px] uppercase tracking-wider`}>
              {card.nickname || (isPreview ? "Nickname" : "")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`font-bold italic text-xl tracking-wider transition-colors duration-300 ${primaryTextClass}`}>{card.network || "Visa"}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors duration-300 ${isLightCard ? 'bg-black/10' : 'bg-white/10'} ${primaryTextClass}`}>
            {card.card_type || "Credit"}
          </span>
        </div>
      </div>
      
      {/* Middle Row: Chip + Number */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
            <div className={`w-10 h-8 rounded-md bg-gradient-to-br transition-colors duration-500 ${isLightCard ? 'from-amber-200 to-amber-400 opacity-80' : 'from-yellow-200 to-yellow-500'} flex items-center justify-center`}>
              <div className="w-6 h-4 border border-black/20 rounded-sm grid grid-cols-3 grid-rows-2 gap-[1px] opacity-40">
                  <div className="border-r border-b border-black"></div><div className="border-r border-b border-black"></div><div className="border-b border-black"></div>
                  <div className="border-r border-black"></div><div className="border-r border-black"></div><div></div>
              </div>
            </div>
            <Wifi className={`${primaryTextClass} opacity-60 rotate-90 transition-colors duration-300`} size={20} />
        </div>
        <p className={`text-2xl font-mono tracking-[0.2em] drop-shadow-sm transition-colors duration-300 ${primaryTextClass}`}>
          •••• •••• •••• {card.last_four || (isPreview ? "1234" : "")}
        </p>
      </div>

      {/* Bottom Row: Name, Expiry, Delete */}
      <div className="relative flex items-end justify-between z-10">
        <div className="flex gap-6">
          <div className="space-y-1">
            <p className={`text-[9px] uppercase tracking-widest transition-colors duration-300 ${secondaryTextClass}`}>Card Holder</p>
            <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${primaryTextClass} truncate max-w-[120px]`}>
              {card.card_holder || (isPreview ? 'NIKKI' : 'VALUED CUSTOMER')}
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-[9px] uppercase tracking-widest transition-colors duration-300 ${secondaryTextClass}`}>Expires</p>
            <p className={`text-sm font-semibold font-mono transition-colors duration-300 ${primaryTextClass}`}>
              {card.expiry_month ? `${card.expiry_month.padStart(2, '0')}/${(card.expiry_year?.length === 4 ? card.expiry_year.substring(2) : card.expiry_year) || '**'}` : (isPreview ? '12/28' : '**/__')}
            </p>
          </div>
        </div>
        {!isPreview && (
          <div className="flex items-center gap-2">
            {card.status !== 'Active' && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/80 text-white px-2 py-1 rounded-md shadow-sm">
                {card.status}
              </span>
            )}
            {card.credit_limit && (
              <div className="text-right mr-2 hidden sm:block">
                <p className={`text-[9px] uppercase tracking-widest transition-colors duration-300 ${secondaryTextClass}`}>Credit Limit</p>
                <p className={`text-xs font-bold transition-colors duration-300 ${primaryTextClass}`}>₹{card.credit_limit.toLocaleString()}</p>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }} className={`h-8 w-8 z-20 hover:bg-black/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full ${isLightCard ? 'text-slate-700' : 'text-white'}`}>
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </UICard>
  );
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
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [availableLimit, setAvailableLimit] = useState("");
  const [status, setStatus] = useState("Active");
  const [colorTheme, setColorTheme] = useState("Blue");

  const previewCardData = {
    nickname, last_four: lastFour, card_type: cardType,
    bank_name: bankName, network, card_name: cardName, card_holder: cardHolder,
    expiry_month: expiryMonth, expiry_year: expiryYear,
    color_theme: colorTheme, status, credit_limit: creditLimit ? parseFloat(creditLimit) : null
  };

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
    setBankName(""); setNetwork("Visa"); setCardName(""); setCardHolder("");
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
        bank_name: bankName, network, card_name: cardName, card_holder: cardHolder,
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

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your credit and debit cards</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 rounded-2xl max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-[45%] bg-black/40 p-6 md:p-10 flex flex-col justify-center border-r border-white/10">
              <div className="mb-6 md:mb-10 text-center md:text-left">
                <DialogTitle className="text-2xl font-bold text-white mb-2">Live Preview</DialogTitle>
                <p className="text-white/60 text-sm">See how your card looks with real-time updates.</p>
              </div>
              <div className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <CardVisual card={previewCardData} isPreview={true} />
              </div>
            </div>
            
            <div className="w-full md:w-[55%] p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
              <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-bold hidden md:block">Card Details</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <h3 className="font-semibold text-lg">Format & Theme</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Card Theme</Label>
                      <Select value={colorTheme} onValueChange={setColorTheme}>
                        <SelectTrigger className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 glass-card">
                          <SelectItem value="Blue" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Classic Blue</div></SelectItem>
                          <SelectItem value="Black" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-800"></div>Midnight Black</div></SelectItem>
                          <SelectItem value="Silver" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div>Silver Chrome</div></SelectItem>
                          <SelectItem value="Purple" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Royal Purple</div></SelectItem>
                          <SelectItem value="Gold" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div>Gold Elite</div></SelectItem>
                          <SelectItem value="Green" className="focus:bg-white/10 cursor-pointer"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Emerald Green</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Network</Label>
                      <Select value={network} onValueChange={setNetwork}>
                        <SelectTrigger className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 glass-card">
                          <SelectItem value="Visa" className="focus:bg-white/10 cursor-pointer">Visa</SelectItem>
                          <SelectItem value="Mastercard" className="focus:bg-white/10 cursor-pointer">Mastercard</SelectItem>
                          <SelectItem value="RuPay" className="focus:bg-white/10 cursor-pointer">RuPay</SelectItem>
                          <SelectItem value="Amex" className="focus:bg-white/10 cursor-pointer">Amex</SelectItem>
                          <SelectItem value="Discover" className="focus:bg-white/10 cursor-pointer">Discover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <h3 className="font-semibold text-lg">Core Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Nickname <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Shopping Card" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Bank Name</Label>
                      <Input placeholder="e.g. SBI" value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Card Variant</Label>
                      <Input placeholder="e.g. Cashback+, Platinum" value={cardName} onChange={(e) => setCardName(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Card Holder Name</Label>
                      <Input placeholder="e.g. NIKKI" value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Last 4 Digits <span className="text-red-500">*</span></Label>
                      <Input placeholder="1234" maxLength={4} minLength={4} required value={lastFour} onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 font-mono tracking-widest text-center" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                    <h3 className="font-semibold text-lg">Settings & Limits</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Card Type</Label>
                      <Select value={cardType} onValueChange={setCardType}>
                        <SelectTrigger className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 glass-card">
                          <SelectItem value="Credit" className="focus:bg-white/10 cursor-pointer">Credit Card</SelectItem>
                          <SelectItem value="Debit" className="focus:bg-white/10 cursor-pointer">Debit Card</SelectItem>
                          <SelectItem value="Prepaid" className="focus:bg-white/10 cursor-pointer">Prepaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Exp Month</Label>
                      <Input placeholder="MM" maxLength={2} value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 text-center font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Exp Year</Label>
                      <Input placeholder="YYYY" maxLength={4} value={expiryYear} onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 text-center font-mono" />
                    </div>
                  </div>

                  {cardType === 'Credit' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Credit Limit</Label>
                      <Input placeholder="0.00" type="number" min="0" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 flex-1 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Available</Label>
                      <Input placeholder="0.00" type="number" min="0" step="0.01" value={availableLimit} onChange={(e) => setAvailableLimit(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 flex-1 font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Bill Date</Label>
                      <Input placeholder="1-31" type="number" min="1" max="31" value={billingDate} onChange={(e) => setBillingDate(e.target.value)} className="h-11 rounded-lg bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-primary/50 flex-1 font-mono" />
                    </div>
                  </div>
                  )}
                </section>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 bg-transparent py-4">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl px-6 h-12 w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" className="rounded-xl px-8 h-12 w-full sm:w-auto font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">Save Card</Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-6 xl:grid-cols-3">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div key={card.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <CardVisual card={card} onDelete={handleDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
        {cards.length === 0 && !loading && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <CreditCard size={56} className="opacity-10 mb-6" />
            <p className="text-xl font-semibold text-white">No cards saved yet.</p>
            <p className="text-sm mt-2 opacity-60">Add your credit or debit cards to manage your finances seamlessly.</p>
            <Button className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-base px-8 py-6 h-auto" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-2" /> Add Your First Card
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
