import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
// Proteção de escape de $ no env local
let rawKey = process.env.ASAAS_API_KEY || "";
if (rawKey.startsWith('\\$')) rawKey = rawKey.replace('\\$', '$');
const ASAAS_API_KEY = rawKey;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ownerId } = body;

        if (!ownerId) {
            return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
        }

        if (!ASAAS_API_KEY) {
            return NextResponse.json({ error: "ASAAS_API_KEY is not configured" }, { status: 500 });
        }

        // 1. Buscar a assinatura mais recente do usuário no Asaas usando externalReference = ownerId
        const subscriptionsRes = await fetch(`${ASAAS_API_URL}/subscriptions?externalReference=${ownerId}&status=ACTIVE,TRIAL`, {
            headers: { "access_token": ASAAS_API_KEY },
        });

        const subscriptionsData = await subscriptionsRes.json();

        if (subscriptionsData.data && subscriptionsData.data.length > 0) {
            // Existe uma assinatura ativa!
            const actSub = subscriptionsData.data[0];

            let planPurchased = "";
            if (actSub.value == 197) planPurchased = "pro";
            else if (actSub.value == 397) planPurchased = "enterprise";
            else if (actSub.value == 97) planPurchased = "free";

            if (planPurchased) {
                // Sincroniza o banco de dados burlando o RLS (estamos no servidor via chamada interna)
                const { error } = await supabase.rpc('asaas_webhook_update_sub', {
                    p_owner_id: ownerId,
                    p_plan: planPurchased,
                    p_status: 'active'
                });

                if (error) {
                    console.error("Erro RPC ao sincronizar plano:", error);
                    return NextResponse.json({ error: "Erro ao atualizar banco de dados" }, { status: 500 });
                }

                return NextResponse.json({
                    success: true,
                    synced: true,
                    newPlan: planPurchased
                });
            }
        }

        return NextResponse.json({ success: true, synced: false, message: "No active subscriptions found in Asaas" });

    } catch (err: any) {
        console.error("Erro na sincronização Asaas:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
