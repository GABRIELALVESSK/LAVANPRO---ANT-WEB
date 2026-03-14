export interface OrderEntry { id: string; date: string; service: string; value: number; status: string; }
export interface Customer {
    id: string; name: string; phone: string; email: string; address: string;
    origin: string; notes: string; active: boolean; createdAt: string;
    tags: string[]; orders: OrderEntry[]; unitId: string;
}

export const seedCustomers: Customer[] = [];
