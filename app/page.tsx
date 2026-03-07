import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Filters } from "@/components/filters";
import { StatsCards } from "@/components/stats-cards";
import { MainChart } from "@/components/main-chart";
import { DonutChart } from "@/components/donut-chart";
import { BarChart } from "@/components/bar-chart";
import { TransactionTable } from "@/components/transaction-table";
import { SupabaseConnectionTest } from "@/components/supabase-connection-test";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          <Filters />
          <div className="px-8 space-y-8 pb-12">
            <SupabaseConnectionTest />
            <StatsCards />
            <MainChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DonutChart />
              <BarChart />
            </div>
            <TransactionTable />
          </div>
        </main>
      </div>
    </div>
  );
}
