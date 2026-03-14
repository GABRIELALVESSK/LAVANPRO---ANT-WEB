import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";
console.log("===> ASAAS API KEY CARREGADA:", ASAAS_API_KEY);

type PlanTier = "free" | "pro" | "enterprise";

const PLAN_PRICES: Record<PlanTier, number> = {
    free: 0,
    pro: 197.00,
    enterprise: 397.00,
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { plan, company, ownerId } = body;

        if (!ASAAS_API_KEY) {
            // Se não tiver chave de API configurada, vamos fingir sucesso em dev
            // ou retornar erro em prod.
            console.warn("ASAAS_API_KEY não configurada. Crie a chave no painel do Asaas e adicione no .env.local.");
            return NextResponse.json(
                { error: "API do Asaas não configurada no servidor." },
                { status: 500 }
            );
        }

        if (!plan || !PLAN_PRICES[plan as PlanTier]) {
            return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
        }

        // 1. Verificar/Criar Customer no Asaas
        let customerId = "";

        // Busca cliente existente por CNPJ/CPF (opcional mas recomendado)
        const searchRes = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${company.cnpj}`, {
            headers: { "access_token": ASAAS_API_KEY },
        });
        const searchData = await searchRes.json();

        if (searchData.data && searchData.data.length > 0) {
            customerId = searchData.data[0].id;
        } else {
            // Cria novo customer
            const createCustomerRes = await fetch(`${ASAAS_API_URL}/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "access_token": ASAAS_API_KEY },
                body: JSON.stringify({
                    name: company.razaoSocial || company.nomeFantasia || "Lavanderia Cliente",
                    cpfCnpj: company.cnpj,
                    email: company.email || undefined,
                    phone: company.phone || undefined,
                    externalReference: ownerId, // Link com o Supabase
                }),
            });
            const createCustomerData = await createCustomerRes.json();
            if (!createCustomerRes.ok) {
                console.error("Asaas erro (criar cliente):", JSON.stringify(createCustomerData));
                const errorDetails = createCustomerData.errors?.[0]?.description || "Erro desconhecido";
                return NextResponse.json({ error: `Erro ao criar cliente no Asaas: ${errorDetails}` }, { status: 400 });
            }
            customerId = createCustomerData.id;
        }

        // 2. Criar a Assinatura (Subscription)
        const today = new Date();
        // Vencimento para o mesmo dia
        const nextDueDate = today.toISOString().split('T')[0];

        const subRes = await fetch(`${ASAAS_API_URL}/subscriptions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "access_token": ASAAS_API_KEY },
            body: JSON.stringify({
                customer: customerId,
                billingType: "UNDEFINED", // Deixa o cliente escolher (Cartão, Pix, Boleto)
                value: PLAN_PRICES[plan as PlanTier],
                nextDueDate: nextDueDate,
                cycle: "MONTHLY",
                description: `LavanPro - Plano ${plan.toUpperCase()}`,
                externalReference: ownerId // Usado no Webhook
            }),
        });

        const subData = await subRes.json();
        if (!subRes.ok) {
            console.error("Asaas erro (criar assinatura):", subData);
            return NextResponse.json({ error: "Erro ao criar assinatura no Asaas." }, { status: 400 });
        }

        // 3. Salvar o ID do Asaas no Supabase para referência futura no webhook
        // Precisaria passar a Service Role Key do Supabase ou usar RPC
        // Vamos ignorar a atualização direta aqui para manter seguro e apenas depender do Webhook e RPC

        // 4. Pegar o link de pagamento da primeira cobrança dessa assinatura
        const chargesRes = await fetch(`${ASAAS_API_URL}/payments?subscription=${subData.id}`, {
            headers: { "access_token": ASAAS_API_KEY },
        });
        const chargesData = await chargesRes.json();

        let invoiceUrl = "";
        if (chargesData.data && chargesData.data.length > 0) {
            invoiceUrl = chargesData.data[0].invoiceUrl;
        }

        return NextResponse.json({
            success: true,
            customerId: customerId,
            subscriptionId: subData.id,
            invoiceUrl: invoiceUrl || `https://sandbox.asaas.com/i/${subData.id}` // Fallback incerto
        });

    } catch (err: any) {
        console.error("Erro no checkout Asaas:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
