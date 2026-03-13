"use client";
import { MoreVertical, ArrowUpRight } from "lucide-react";
import { Order } from "@/lib/orders-data";

interface TransactionTableProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
  orders: Order[];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusColor(status: string) {
  switch (status) {
    case "Entregue": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Cancelado": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "Pronto": return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
    default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
}

export function TransactionTable({ orders }: TransactionTableProps) {
  // Sort by date desc and take top 5
  const transactions = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-brand-text">Transações Recentes</h4>
          <p className="text-sm text-brand-muted mt-0.5">{orders.length} registros no total</p>
        </div>
        <button 
          onClick={() => window.location.href = '/orders'}
          className="flex items-center gap-1.5 text-brand-primary text-sm font-bold hover:underline"
        >
          Ver todas <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-brand-darkBorder bg-brand-bg/40">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">ID Pedido</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Cliente</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Serviço Principal</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Pagamento</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Valor</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Data</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map((tx, i) => {
              const totalValue = tx.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
              const mainService = tx.items[0]?.service || "N/A";
              
              return (
                <tr
                  key={tx.id}
                  className={`hover:bg-brand-primary/5 transition-colors border-b border-brand-darkBorder last:border-0 ${i % 2 === 0 ? "" : "bg-brand-bg/20"}`}
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-muted">{tx.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-brand-primary/20 text-brand-primary`}>
                        {getInitials(tx.client)}
                      </div>
                      <span className="text-sm font-semibold text-brand-text whitespace-nowrap">{tx.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">{mainService}</td>
                  <td className="px-6 py-4 text-sm text-brand-muted">{tx.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm font-bold text-brand-text">
                    {totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-muted hover:text-brand-primary transition-colors p-1 rounded-lg hover:bg-brand-primary/5">
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-brand-muted text-sm font-medium">
                  Nenhuma transação encontrada para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
