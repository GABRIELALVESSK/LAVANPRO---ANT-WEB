export interface OrderItem { service: string; qty: number; unitPrice: number; }
export interface HistoryEntry { time: string; status: string; note: string; }
export interface Order {
    id: string; client: string; phone: string; email: string; address: string;
    paymentMethod: string; paymentStatus: string; delivery: string;
    items: OrderItem[]; status: string; progress: number; bgColor: string;
    textColor: string; observations: string; estimatedDelivery: string;
    history: HistoryEntry[]; createdAt: string; unitId: string;
}

export const SERVICES = [
    { name: "Lavagem Completa", price: 45 },
    { name: "Apenas Passar", price: 25 },
    { name: "Lavagem a Seco", price: 80 },
    { name: "Edredom / Cobertor", price: 60 },
    { name: "Enxoval (kg)", price: 12 },
    { name: "Tapete Pequeno", price: 35 },
    { name: "Tapete Grande", price: 75 },
    { name: "Terno / Blazer", price: 90 },
];
