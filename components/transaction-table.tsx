"use client";
import { MoreVertical, ArrowUpRight } from "lucide-react";

interface TransactionTableProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const allTransactions: Record<string, any[]> = {
  hoje: [
    { id: "#PED-5001", name: "Ricardo Dias", initials: "RD", initColor: "bg-brand-primary/20 text-brand-primary", service: "Lavagem Completa", payment: "PIX", value: "R$ 89,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "Hoje, 10:30" },
    { id: "#PED-5002", name: "Carla Menezes", initials: "CM", initColor: "bg-purple-500/20 text-purple-500", service: "Dry Clean", payment: "Cartão", value: "R$ 145,90", status: "Em Andamento", statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20", date: "Hoje, 09:15" },
    { id: "#PED-5003", name: "Lucas Ferreira", initials: "LF", initColor: "bg-amber-500/20 text-amber-500", service: "Apenas Passar", payment: "PIX", value: "R$ 55,00", status: "Aguardando", statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20", date: "Hoje, 08:40" },
  ],
  "7d": [
    { id: "#PED-4980", name: "João Pedro", initials: "JP", initColor: "bg-blue-500/20 text-blue-500", service: "Lavagem Completa", payment: "PIX", value: "R$ 120,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "Ontem, 15:20" },
    { id: "#PED-4979", name: "Lucia Rocha", initials: "LR", initColor: "bg-rose-500/20 text-rose-500", service: "Enxoval", payment: "Dinheiro", value: "R$ 230,00", status: "Cancelado", statusColor: "bg-rose-500/10 text-rose-500 border-rose-500/20", date: "3 dias atrás" },
    { id: "#PED-4978", name: "Marcos Souza", initials: "MS", initColor: "bg-emerald-500/20 text-emerald-500", service: "Dry Clean", payment: "Cartão", value: "R$ 95,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "4 dias atrás" },
    { id: "#PED-4977", name: "Patricia Lima", initials: "PL", initColor: "bg-pink-500/20 text-pink-500", service: "Lavagem Completa", payment: "PIX", value: "R$ 78,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "5 dias atrás" },
  ],
  "30d": [
    { id: "#PED-4921", name: "Ana Paula Silva", initials: "AP", initColor: "bg-brand-primary/20 text-brand-primary", service: "Enxoval Premium", payment: "PIX", value: "R$ 158,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "22 Mai, 14:30" },
    { id: "#PED-4920", name: "Gabriel Alves", initials: "GA", initColor: "bg-purple-500/20 text-purple-500", service: "Apenas Passar", payment: "Débito", value: "R$ 42,90", status: "Aguardando", statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20", date: "22 Mai, 12:15" },
    { id: "#PED-4919", name: "Mariana Costa", initials: "MC", initColor: "bg-blue-500/20 text-blue-500", service: "Dry Clean", payment: "Cartão", value: "R$ 210,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "21 Mai, 18:45" },
    { id: "#PED-4918", name: "Roberto Junior", initials: "RJ", initColor: "bg-rose-500/20 text-rose-500", service: "Lavagem Completa", payment: "PIX", value: "R$ 85,00", status: "Cancelado", statusColor: "bg-rose-500/10 text-rose-500 border-rose-500/20", date: "21 Mai, 09:10" },
    { id: "#PED-4917", name: "Fernanda Brito", initials: "FB", initColor: "bg-teal-500/20 text-teal-500", service: "Lavagem a Seco", payment: "PIX", value: "R$ 185,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "20 Mai, 11:00" },
  ],
  custom: [
    { id: "#PED-CUST-1", name: "Pousada Rio Verde", initials: "PV", initColor: "bg-teal-500/20 text-teal-500", service: "Enxoval (50kg)", payment: "Boleto", value: "R$ 980,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", date: "Período customizado" },
    { id: "#PED-CUST-2", name: "Hotel Bela Vista", initials: "HB", initColor: "bg-blue-500/20 text-blue-500", service: "Enxoval Industrial", payment: "Transferência", value: "R$ 1.250,00", status: "Em Andamento", statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20", date: "Período customizado" },
  ],
};

export function TransactionTable({ activeRange }: TransactionTableProps) {
  const key = activeRange || "30d";
  const transactions = allTransactions[key] || allTransactions["30d"];

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-brand-text">Transações Recentes</h4>
          <p className="text-sm text-brand-muted mt-0.5">{transactions.length} registros no período</p>
        </div>
        <button className="flex items-center gap-1.5 text-brand-primary text-sm font-bold hover:underline">
          Ver todas <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-brand-darkBorder bg-brand-bg/40">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">ID Pedido</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Cliente</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Serviço</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Pagamento</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Valor</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Data</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={tx.id}
                className={`hover:bg-brand-primary/5 transition-colors border-b border-brand-darkBorder last:border-0 ${i % 2 === 0 ? "" : "bg-brand-bg/20"}`}
              >
                <td className="px-6 py-4 font-mono text-xs font-bold text-brand-muted">{tx.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${tx.initColor}`}>
                      {tx.initials}
                    </div>
                    <span className="text-sm font-semibold text-brand-text whitespace-nowrap">{tx.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">{tx.service}</td>
                <td className="px-6 py-4 text-sm text-brand-muted">{tx.payment}</td>
                <td className="px-6 py-4 text-sm font-bold text-brand-text">{tx.value}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${tx.statusColor}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">{tx.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-muted hover:text-brand-primary transition-colors p-1 rounded-lg hover:bg-brand-primary/5">
                    <MoreVertical className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
