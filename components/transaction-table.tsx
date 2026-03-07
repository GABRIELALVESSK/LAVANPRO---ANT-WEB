import { MoreVertical } from "lucide-react";

const transactions = [
  {
    id: "#ORD-2849",
    initials: "MA",
    name: "Mariana Alves",
    value: "R$ 145,90",
    status: "Pago",
    statusColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    date: "Hoje, 14:30",
    initialsColor: "bg-primary/10 text-primary",
  },
  {
    id: "#ORD-2848",
    initials: "JS",
    name: "João Silva",
    value: "R$ 82,50",
    status: "Pendente",
    statusColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    date: "Hoje, 12:15",
    initialsColor: "bg-slate-100 dark:bg-slate-700 text-slate-500",
  },
  {
    id: "#ORD-2847",
    initials: "RC",
    name: "Ricardo Costa",
    value: "R$ 210,00",
    status: "Pago",
    statusColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    date: "Ontem, 18:45",
    initialsColor: "bg-primary/10 text-primary",
  },
  {
    id: "#ORD-2846",
    initials: "BF",
    name: "Beatriz Farias",
    value: "R$ 45,00",
    status: "Cancelado",
    statusColor: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    date: "Ontem, 16:20",
    initialsColor: "bg-slate-100 dark:bg-slate-700 text-slate-500",
  },
];

export function TransactionTable() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h4 className="text-lg font-bold">Transações Recentes</h4>
        <button className="text-primary text-sm font-bold hover:underline">
          Ver todas
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                ID Pedido
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Cliente
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Valor
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Data
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs font-bold">
                  {tx.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${tx.initialsColor}`}
                    >
                      {tx.initials}
                    </div>
                    <span className="text-sm font-semibold">{tx.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold">{tx.value}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${tx.statusColor}`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {tx.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <MoreVertical className="size-5" />
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
