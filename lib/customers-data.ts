export interface OrderEntry { id: string; date: string; service: string; value: number; status: string; }
export interface Customer {
    id: string; name: string; phone: string; email: string; address: string;
    origin: string; notes: string; active: boolean; createdAt: string;
    tags: string[]; orders: OrderEntry[];
}

export const seedCustomers: Customer[] = [
    {
        id: "C001", name: "Carlos Machado", phone: "(11) 98765-4321", email: "carlos.machado@email.com",
        address: "Rua Augusta, 1500 - Consolação, SP", origin: "Indicação",
        notes: "Prefere amaciante extra. Mora em condomínio, deixar na portaria.", active: true,
        createdAt: "2025-06-12", tags: ["VIP", "Recorrente"],
        orders: [
            { id: "#ORD-2856", date: "2026-03-08", service: "Lavagem Completa (3x)", value: 135, status: "Em Lavagem" },
            { id: "#ORD-2801", date: "2026-02-15", service: "Lavagem Completa (4x)", value: 180, status: "Entregue" },
            { id: "#ORD-2744", date: "2026-01-20", service: "Terno / Blazer", value: 90, status: "Entregue" },
        ],
    },
    {
        id: "C002", name: "Maria Oliveira", phone: "(11) 91234-5678", email: "maria.oli@email.com",
        address: "Av. Paulista, 1000 - Bela Vista, SP", origin: "Instagram", notes: "", active: true,
        createdAt: "2025-08-03", tags: ["Residencial"],
        orders: [
            { id: "#ORD-2854", date: "2026-03-08", service: "Edredom / Cobertor (2x)", value: 120, status: "Em Secagem" },
            { id: "#ORD-2790", date: "2026-02-01", service: "Edredom / Cobertor (1x)", value: 60, status: "Entregue" },
        ],
    },
    {
        id: "C003", name: "João Silva", phone: "(11) 99999-1111", email: "jao.silva@email.com",
        address: "Rua Xuxa, 20 - Centro, SP", origin: "WhatsApp", notes: "Não usar alta temperatura.", active: true,
        createdAt: "2025-11-20", tags: ["Pontual"],
        orders: [
            { id: "#ORD-2851", date: "2026-03-07", service: "Apenas Passar (5x)", value: 125, status: "Em Finalização" },
        ],
    },
    {
        id: "C004", name: "Ana Paula", phone: "(11) 98888-2222", email: "ana.p@email.com",
        address: "Av. Brigadeiro, 500 - Jardins, SP", origin: "Indicação", notes: "", active: true,
        createdAt: "2025-04-10", tags: ["VIP", "Recorrente", "Pontual"],
        orders: [
            { id: "#ORD-2850", date: "2026-03-07", service: "Lavagem a Seco, Terno", value: 260, status: "Entregue" },
            { id: "#ORD-2800", date: "2026-02-14", service: "Lavagem a Seco", value: 80, status: "Entregue" },
            { id: "#ORD-2740", date: "2026-01-08", service: "Terno / Blazer (2x)", value: 180, status: "Entregue" },
            { id: "#ORD-2680", date: "2025-12-20", service: "Lavagem Completa", value: 45, status: "Entregue" },
        ],
    },
    {
        id: "C005", name: "Hotel Bela Vista", phone: "(11) 97777-3333", email: "contato@hotelbelavista.com",
        address: "Rua Oscar Freire, 1200 - Jardins, SP", origin: "Parcerias",
        notes: "Cliente corporativo. Pagamento via boleto mensal.", active: true,
        createdAt: "2025-01-15", tags: ["VIP", "Comercial", "Recorrente"],
        orders: [
            { id: "#ORD-2849", date: "2026-03-08", service: "Enxoval (50kg)", value: 600, status: "Cancelado" },
            { id: "#ORD-2788", date: "2026-02-05", service: "Enxoval (45kg)", value: 540, status: "Entregue" },
            { id: "#ORD-2720", date: "2026-01-05", service: "Enxoval (48kg)", value: 576, status: "Entregue" },
        ],
    },
    {
        id: "C006", name: "Pousada Sol Nascente", phone: "(11) 96666-4444", email: "contato@pousadasol.com",
        address: "Rua das Flores, 55 - Pinheiros, SP", origin: "Google",
        notes: "Preferência por horários matutinos para coleta.", active: false,
        createdAt: "2025-03-22", tags: ["Comercial"],
        orders: [
            { id: "#ORD-2600", date: "2025-11-10", service: "Enxoval (30kg)", value: 360, status: "Entregue" },
        ],
    },
    {
        id: "C007", name: "Roberto Dias", phone: "(11) 95555-7777", email: "roberto.dias@email.com",
        address: "Rua São Bento, 200 - Centro, SP", origin: "Walk-in",
        notes: "Visitou a loja sem indicação.", active: true, createdAt: "2026-01-30", tags: ["Residencial"], orders: [],
    },
];
