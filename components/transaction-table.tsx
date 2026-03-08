import { MoreVertical } from "lucide-react";

interface TransactionTableProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
}

const transactions = [
  { id: "#PED-4921", name: "Ana Paula Silva", initials: "AP", initialsColor: "bg-brand-primary/20 text-brand-primary", value: "R$ 158,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "22 Mai, 14:30" },
  { id: "#PED-4920", name: "Gabriel Alves", initials: "GA", initialsColor: "bg-purple-500/20 text-purple-400", value: "R$ 42,90", status: "Pendente", statusColor: "bg-amber-500/10 text-amber-400", date: "22 Mai, 12:15" },
  { id: "#PED-4919", name: "Mariana Costa", initials: "MC", initialsColor: "bg-blue-500/20 text-blue-400", value: "R$ 210,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "21 Mai, 18:45" },
  { id: "#PED-4918", name: "Roberto Junior", initials: "RJ", initialsColor: "bg-rose-500/20 text-rose-400", value: "R$ 85,00", status: "Cancelado", statusColor: "bg-rose-500/10 text-rose-400", date: "21 Mai, 09:10" },
];

export function TransactionTable({ activeRange, customDates: _customDates }: TransactionTableProps) {
  const mockData: Record<string, any[]> = {
    'hoje': [
      { id: "#PED-5001", name: "Ricardo Dias", initials: "RD", initialsColor: "bg-brand-primary/20 text-brand-primary", value: "R$ 45,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "Hoje, 10:30" },
      { id: "#PED-5002", name: "Carla Menezes", initials: "CM", initialsColor: "bg-purple-500/20 text-purple-400", value: "R$ 89,90", status: "Pendente", statusColor: "bg-amber-500/10 text-amber-400", date: "Hoje, 09:15" },
    ],
    '7d': [
      { id: "#PED-4980", name: "João Pedro", initials: "JP", initialsColor: "bg-blue-500/20 text-blue-400", value: "R$ 120,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "昨天, 15:20" },
      { id: "#PED-4979", name: "Lucia Rocha", initials: "LR", initialsColor: "bg-rose-500/20 text-rose-400", value: "R$ 55,00", status: "Cancelado", statusColor: "bg-rose-500/10 text-rose-400", date: "3 dias atrás" },
    ],
    '30d': [
      { id: "#PED-4921", name: "Ana Paula Silva", initials: "AP", initialsColor: "bg-brand-primary/20 text-brand-primary", value: "R$ 158,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "22 Mai, 14:30" },
      { id: "#PED-4920", name: "Gabriel Alves", initials: "GA", initialsColor: "bg-purple-500/20 text-purple-400", value: "R$ 42,90", status: "Pendente", statusColor: "bg-amber-500/10 text-amber-400", date: "22 Mai, 12:15" },
      { id: "#PED-4919", name: "Mariana Costa", initials: "MC", initialsColor: "bg-blue-500/20 text-blue-400", value: "R$ 210,00", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "21 Mai, 18:45" },
      { id: "#PED-4918", name: "Roberto Junior", initials: "RJ", initialsColor: "bg-rose-500/20 text-rose-400", value: "R$ 85,00", status: "Cancelado", statusColor: "bg-rose-500/10 text-rose-400", date: "21 Mai, 09:10" },
    ],
    'custom': [
      { id: "#PED-CUST", name: "Cliente Custom", initials: "CC", initialsColor: "bg-brand-primary/20 text-brand-primary", value: "R$ 142,80", status: "Concluído", statusColor: "bg-emerald-500/10 text-emerald-400", date: "Período Custom" },
    ]
  };

  const currentTransactions = mockData[activeRange || '30d'] || mockData['30d'];

  return (
    <div className="bg-brand-card rounded-xl border border-brand-darkBorder shadow-xl overflow-hidden">
      <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
        <h4 className="text-lg font-bold text-white">Transações Recentes</h4>
        <button className="text-brand-primary text-sm font-bold hover:underline">
          Ver todas
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-bg/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">
                ID Pedido
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">
                Cliente
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">
                Valor
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted">
                Data
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-darkBorder">
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-brand-muted">
                  Nenhuma transação financeira recente.
                </td>
              </tr>
            ) : (
              currentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-brand-primary/5 transition-colors border-b border-brand-darkBorder"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-muted">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${tx.initialsColor}`}
                      >
                        {tx.initials}
                      </div>
                      <span className="text-sm font-semibold text-white">{tx.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{tx.value}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${tx.statusColor}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-muted">
                    {tx.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-brand-muted hover:text-brand-primary transition-colors">
                      <MoreVertical className="size-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
