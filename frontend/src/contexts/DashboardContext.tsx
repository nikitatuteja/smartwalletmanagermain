import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dashboardService } from '@/services/index';

interface DashboardContextType {
  data: any;
  loading: boolean;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await dashboardService.getSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <DashboardContext.Provider value={{ data, loading, refetch: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
