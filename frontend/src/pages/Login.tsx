import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/index";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.access_token) {
        signIn(res.access_token, res.user);
        toast.success(`Welcome back, ${res.user.display_name}!`);
        
        // Redirect based on role
        if (res.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020817]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass-card border-white/10 shadow-2xl bg-[#0f172a]/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 mt-2">
               <img src="/logo-transparent.png" alt="FinTrack Logo" className="w-56 sm:w-64 h-auto object-contain scale-125 drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">FinTrack</CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1 ? "Secure access to your finances" : "Enter the verification code"}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <motion.form
                  key="login-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-[#020817] border-white/10 text-white focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-[#020817] border-white/10 text-white focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 text-lg font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Login"}
                  </Button>
                </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
