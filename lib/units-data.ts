export interface OpeningHours {
    open: string;
    close: string;
    active: boolean;
}

export interface Unit {
    id: string;
    name: string;
    slug: string;
    cnpj?: string;
    phone: string;
    email: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    openingHours: Record<string, OpeningHours>;
    responsible: string;
    status: 'active' | 'inactive';
    createdAt: string;
    isMain: boolean;
    observations?: string;
}

export const DEFAULT_OPENING_HOURS: Record<string, OpeningHours> = {
    mon: { open: "08:00", close: "18:00", active: true },
    tue: { open: "08:00", close: "18:00", active: true },
    wed: { open: "08:00", close: "18:00", active: true },
    thu: { open: "08:00", close: "18:00", active: true },
    fri: { open: "08:00", close: "18:00", active: true },
    sat: { open: "08:00", close: "13:00", active: true },
    sun: { open: "08:00", close: "12:00", active: false },
};

const DEFAULT_UNIT: Unit = {
    id: "default",
    name: "Matriz Centro",
    slug: "matriz-centro",
    phone: "(11) 3000-4000",
    email: "matriz@lavanderiapro.com.br",
    street: "Rua das Lavanderias",
    number: "100",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01001-000",
    openingHours: DEFAULT_OPENING_HOURS,
    responsible: "Gabriel Alves",
    status: 'active',
    createdAt: new Date().toISOString(),
    isMain: true
};

export function getUnits(): Unit[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem("lavanpro_units");
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveUnits(units: Unit[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("lavanpro_units", JSON.stringify(units));
}
