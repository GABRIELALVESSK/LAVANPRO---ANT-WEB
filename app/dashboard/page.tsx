"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Filters } from "@/components/filters";
import { StatsCards } from "@/components/stats-cards";
import { MainChart } from "@/components/main-chart";
import { DonutChart } from "@/components/donut-chart";
import { BarChart } from "@/components/bar-chart";
import { TransactionTable } from "@/components/transaction-table";

export default function Page() {
  const [activeRange, setActiveRange] = useState("30d");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-brand-bg">
          <Filters
            activeRange={activeRange}
            onChange={setActiveRange}
            customDates={customDates}
            onCustomDatesChange={setCustomDates}
          />
          <div className="px-8 space-y-8 pb-12">
            <StatsCards activeRange={activeRange} customDates={customDates} />
            <MainChart activeRange={activeRange} customDates={customDates} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DonutChart activeRange={activeRange} customDates={customDates} />
              <BarChart activeRange={activeRange} customDates={customDates} />
            </div>
            <TransactionTable activeRange={activeRange} customDates={customDates} />
          </div>
        </main>
      </div>
    </div>
  );
}
