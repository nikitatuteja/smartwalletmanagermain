import { LayoutDashboard, ArrowLeftRight, CreditCard, CalendarClock, LogOut, Sun, Moon, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Dues", url: "/dues", icon: CalendarClock },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const [openLogout, setOpenLogout] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src="/logo.png" alt="logo" style={{ width: "30px", height: "30px" }} />
              <span>FINTRACK</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#5B5BD6]/10 hover:translate-x-1 transition-all"
                      activeClassName="bg-gradient-to-r from-[#5B5BD6]/20 to-transparent text-[#5B5BD6] dark:text-[#7C7CFF] font-semibold border-r-4 border-[#5B5BD6]"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 rounded-xl hover:bg-sidebar-accent" 
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
        <Dialog open={openLogout} onOpenChange={setOpenLogout}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-card border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Are you sure you want to logout?</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 justify-end mt-4">
              <Button variant="outline" onClick={() => setOpenLogout(false)} className="rounded-xl border-white/10">Cancel</Button>
              <Button onClick={() => { setOpenLogout(false); signOut(); }} className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all">Logout</Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
