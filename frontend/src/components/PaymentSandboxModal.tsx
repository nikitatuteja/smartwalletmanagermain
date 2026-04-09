import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { sandboxService, paymentService } from "@/services/index";

export type Transaction = {
  id: number;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string;
  notes: string | null;
  payment_method: 'Cash' | 'UPI' | 'Card';
  card_id: number | null;
};

interface PaymentSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionData: Transaction) => void;
  amount: number;
  title: string;
  category?: string;
  notes?: string;
}

type PaymentStep = 'selection' | 'details' | 'processing' | 'success';
type PaymentMethod = 'card' | 'upi' | 'netbanking';

const paymentMethodMap: Record<PaymentMethod, "Card" | "UPI" | "Card"> = {
  card: 'Card',
  upi: 'UPI',
  netbanking: 'Card'
};

export default function PaymentSandboxModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  title,
  category = 'Other',
  notes = 'Payment via Sandbox'
}: PaymentSandboxModalProps) {
  const [step, setStep] = useState<PaymentStep>('selection');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('selection');
      setLoading(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setStep('processing');
    setLoading(true);
    setErrorMessage(null);
    
    if (method === 'upi') {
      try {
        const orderRes: any = await paymentService.createOrder({ amount });
        if (orderRes.success && orderRes.order_id) {
          const options = {
            key: orderRes.key_id,
            amount: orderRes.amount,
            currency: orderRes.currency,
            name: "FinTrack",
            description: `Payment for ${title}`,
            order_id: orderRes.order_id,
            handler: async (response: any) => {
              try {
                const verifyRes = await paymentService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amount,
                  notes: notes
                });
                if (verifyRes.success) {
                  toast.success("Payment Successful!");
                  setStep('success');
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  const payload = {
                    amount,
                    category,
                    payment_method: 'UPI',
                    notes: `${title}: ${notes}`
                  };
                  
                  onSuccess(payload as any);
                  onClose();
                } else {
                  throw new Error("Payment verification failed");
                }
              } catch (err: any) {
                setLoading(false);
                setErrorMessage(err.message || "Payment verification failed");
                setStep('details');
                toast.error(err.message || "Payment verification failed");
              }
            },
            prefill: {
              email: "test@example.com",
              contact: ""
            },
            theme: {
              color: "#4f46e5"
            }
          };
          
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any){
            setLoading(false);
            setStep('details');
            setErrorMessage(`Payment Failed: ${response.error.description}`);
          });
          rzp.open();
        } else {
          throw new Error("Failed to initialize payment");
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err.message || "Could not connect to payment gateway");
        setStep('details');
      }
      return;
    }

    const payload = {
      amount,
      category,
      payment_method: paymentMethodMap[method],
      notes: `${title}: ${notes}`
    };

    console.log("[DEBUG] Sending payment data:", payload);

    try {
      const res = await sandboxService.processPayment(payload);

      if (res.success) {
        setLoading(false);
        setStep('success');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSuccess(res.data);
        // Removed refetch(); since it's not defined
        onClose();
      } else {
        throw new Error(res.error || "Payment failed");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Payment declined. Please try again.");
      setStep('details');
      toast.error(err.message || "Payment failed");
    }
  };

  const renderSelection = () => (
    <div className="space-y-6 pt-4">
      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Amount Due</p>
          <h3 className="text-3xl font-bold text-primary">₹{amount.toLocaleString()}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xs font-mono text-primary/60">TXN_MOCK_{Math.floor(Math.random() * 1000000)}</p>
        </div>
      </div>
      <RadioGroup value={method} onValueChange={(v: any) => setMethod(v)} className="grid grid-cols-1 gap-3">
          <div 
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'border-white/10 hover:border-white/20'}`}
            onClick={() => setMethod('card')}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><CreditCard className="w-6 h-6 text-blue-500" /></div>
              <div>
                <p className="font-semibold">Credit / Debit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <RadioGroupItem value="card" />
          </div>

          <div 
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'upi' ? 'border-primary bg-primary/5 shadow-md' : 'border-white/10 hover:border-white/20'}`}
            onClick={() => setMethod('upi')}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg"><Smartphone className="w-6 h-6 text-green-500" /></div>
              <div>
                <p className="font-semibold">UPI / QR Code</p>
                <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
              </div>
            </div>
            <RadioGroupItem value="upi" />
          </div>

          <div 
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'netbanking' ? 'border-primary bg-primary/5 shadow-md' : 'border-white/10 hover:border-white/20'}`}
            onClick={() => setMethod('netbanking')}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><Globe className="w-6 h-6 text-purple-500" /></div>
              <div>
                <p className="font-semibold">Net Banking</p>
                <p className="text-xs text-muted-foreground">All major Indian banks</p>
              </div>
            </div>
            <RadioGroupItem value="netbanking" />
          </div>
        </RadioGroup>
      <Button className="w-full h-14 rounded-xl text-lg font-bold group" onClick={() => setStep('details')}>
        Continue to Pay
        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );

  // ... other render methods will be added here

  const renderDetails = () => (
    <div className="space-y-6 pt-4">
      <Button variant="ghost" className="p-0 hover:bg-transparent text-muted-foreground hover:text-white mb-2" onClick={() => setStep('selection')}>
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to methods
      </Button>

      <div className="space-y-4 text-center py-4">
        <p className="text-lg font-semibold">You are paying <span className="text-primary">₹{amount.toLocaleString()}</span> using {method.charAt(0).toUpperCase() + method.slice(1)}</p>
        <p className="text-sm text-muted-foreground">Click the button below to confirm your payment.</p>
      </div>

      {method === 'netbanking' && (
        <div className="space-y-4">
          <Label>Select your Bank</Label>
          <div className="grid grid-cols-2 gap-3">
            {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'IDFC'].map(bank => (
              <Button key={bank} variant="outline" className="h-14 border-white/10 hover:border-primary/50 justify-start px-4">
                <span className="font-bold mr-2 text-primary">{bank[0]}</span>
                {bank} Bank
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full h-14 rounded-xl text-lg font-bold group" onClick={handlePayment} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toLocaleString()} Now`
        )}
      </Button>
      
      {errorMessage && (
        <p className="text-sm text-center text-red-500 font-medium">{errorMessage}</p>
      )}
      
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-60">
        <ShieldCheck className="w-4 h-4" />
        SECURE 256-BIT ENCRYPTED TRANSACTION
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <Loader2 className="w-24 h-24 text-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary/50" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-bold">Processing Payment...</h3>
        <p className="text-muted-foreground mt-2">Please do not close the window or refresh the page</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
      >
        <CheckCircle2 className="w-14 h-14 text-white" />
      </motion.div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-green-500">Payment Successful!</h3>
        <p className="text-muted-foreground">Your transaction has been recorded.</p>
        <p className="text-xs text-muted-foreground/60">Transaction ID: SW_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-card border-white/10 rounded-3xl overflow-hidden p-6">
        <DialogHeader className={step === 'processing' || step === 'success' ? 'hidden' : ''}>
          <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>
          <DialogDescription>Simulated payment sandbox for testing</DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'selection' && renderSelection()}
            {step === 'details' && renderDetails()}
            {step === 'processing' && renderProcessing()}
            {step === 'success' && renderSuccess()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
