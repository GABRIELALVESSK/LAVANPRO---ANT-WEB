import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ASAAS_WEBHOOK_SECRET = process.env.ASAAS_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    try {
        // Validação do Token de Segurança do Webhook
        const asaasToken = req.headers.get("asaas-access-token");
        if (ASAAS_WEBHOOK_SECRET && asaasToken !== ASAAS_WEBHOOK_SECRET) {
            console.error("Token de Webhook inválido ou não autorizado.");
            return NextResponse.json({ error: "Token Invalido" }, { status: 401 });
        }

        const payload = await req.json();
        console.log("Asaas Webhook Received:", JSON.stringify(payload, null, 2));

        const event = payload.event;
        const payment = payload.payment;

        if (!payment) {
            return NextResponse.json({ received: true });
        }

        // Identificar o Owner ID baseado na Referencia Externa que enviamos no checkout
        const ownerId = payment.externalReference || payload.subscription?.externalReference;

        // Se confirmou o pagamento
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            if (ownerId) {
                console.log(`Pagamento confirmado para owner: ${ownerId}`);

                // Descobre o plano comprado baseado no valor no Asaas
                let planPurchased = "";
                if (payment.value == 197) planPurchased = "pro";
                else if (payment.value == 397) planPurchased = "enterprise";
                else if (payment.value == 97) planPurchased = "free"; // Starter

                // Atualizar no banco via RPC burlando o RLS (já que webhooks são anônimos)
                const { error } = await supabase.rpc('asaas_webhook_update_sub', {
                    p_owner_id: ownerId,
                    p_plan: planPurchased || undefined,
                    p_status: 'active'
                });

                if (error) {
                    console.error("Erro ao atualizar BD após webhook:", error);
                } else {
                    console.log(`Plano atualizado para ${planPurchased || "desconhecido"}!`);
                }
            }
        }
        // Se o pagamento for cancelado
        else if (event === "PAYMENT_DELETED" || event === "PAYMENT_OVERDUE" || event === "PAYMENT_REFUNDED" || event === "PAYMENT_CHARGEBACK_REQUESTED") {
            if (ownerId) {
                console.log(`Pagamento revogado para owner: ${ownerId}`);

                // Retorna ao Starter ou desativa conta
                const { error } = await supabase.rpc('asaas_webhook_update_sub', {
                    p_owner_id: ownerId,
                    p_plan: 'free', // Voltou pro Starter automático
                    p_status: 'trialing'
                });

                if (error) console.error("Erro ao revogar BD:", error);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Erro no webhook Asaas:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
