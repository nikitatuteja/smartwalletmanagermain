import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/index";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Sun, Moon } from "lucide-react";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isSignUp) {
        res = await authService.register({ email, password, display_name: displayName });
      } else {
        res = await authService.login({ email, password });
      }

      if (res.success && res.access_token) {
        signIn(res.access_token, res.user);
        toast.success(isSignUp ? `Account created for ${res.user.display_name}!` : `Welcome back, ${res.user.display_name}!`);
        
        // Redirect based on role
        if (res.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || (isSignUp ? "Registration failed. Please try again." : "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#020817] transition-colors duration-300">
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition duration-300 z-50"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

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
        <Card className="glass-card border-black/10 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl transition-colors duration-300">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 mt-2">
               <img src="/logo.png" alt="FINTRACK Logo" className="w-24 sm:w-32 h-auto object-contain drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">FINTRACK</CardTitle>
            <CardDescription className="text-slate-600 dark:text-gray-400 transition-colors">
              {isSignUp ? "Create a new account" : "Secure access to your finances"}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <motion.form
                  key={isSignUp ? "register" : "login"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 pt-4"
                >
                  <AnimatePresence>
                    {isSignUp && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label className="text-slate-700 dark:text-gray-300 transition-colors">Display Name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="text" 
                            placeholder="John Doe" 
                            required={isSignUp} 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="pl-10 bg-white dark:bg-[#020817] border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:ring-purple-500/50 transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300 transition-colors">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white dark:bg-[#020817] border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:ring-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300 transition-colors">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white dark:bg-[#020817] border-black/10 dark:border-white/10 text-slate-900 dark:text-white focus:ring-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 text-lg font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 mt-2" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? "Sign Up" : "Login")}
                  </Button>
                </motion.form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
