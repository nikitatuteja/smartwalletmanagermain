import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardService } from "@/services/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";
import { toast } from "sonner";

const COLORS = ['#5B5BD6', '#7C7CFF', '#9E9EFF', '#C1C1FF', '#eb4899', '#f43f5e', '#22c55e', '#eab308'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dashboardService.getAnalytics();
        if (res.success) setData(res.data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="space-y-8"><Skeleton className="h-12 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><Skeleton className="h-[400px]" /><Skeleton className="h-[400px]" /></div></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into your spending habits</p>
      </div>

      {data?.summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-white/10 overflow-hidden group hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-green-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight text-green-500">₹{data.summary.current_month_income.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 overflow-hidden group hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-red-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Expense</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight text-red-500">₹{data.summary.current_month_expense.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 overflow-hidden group hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-[#5B5BD6]/10 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight text-[#5B5BD6]">₹{data.summary.net_balance.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.summary.top_category && data.summary.top_category !== "None" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#5B5BD6]/10 to-[#7C7CFF]/10 border border-[#5B5BD6]/20 text-center hover:-translate-y-1 shadow-lg transition-all">
              <p className="text-lg font-medium">
                You spent the most on <span className="text-[#5B5BD6] font-bold text-xl">{data.summary.top_category}</span> this month.
              </p>
            </div>
          )}
        </>
      )}

      {data?.bar_chart?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <p className="text-lg font-semibold text-white">No data yet. Start making transactions to see insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card border-white/10 hover:-translate-y-1 hover:shadow-2xl">
            <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.pie_chart} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data?.pie_chart?.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:-translate-y-1 hover:shadow-2xl">
            <CardHeader><CardTitle>Monthly Expense Trend</CardTitle></CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.line_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="expenses" stroke="#5B5BD6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 lg:col-span-2 hover:-translate-y-1 hover:shadow-2xl">
            <CardHeader><CardTitle>Income vs Expenses</CardTitle></CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.bar_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}


    </motion.div>
  );
}
