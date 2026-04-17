import { LayoutDashboard, ArrowLeftRight, CreditCard, CalendarClock } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Dues", url: "/dues", icon: CalendarClock },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/5 flex items-center justify-around px-4 z-50 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          end={item.url === "/"}
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
          activeClassName="text-primary font-medium"
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px]">{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
