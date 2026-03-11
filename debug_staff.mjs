// Script de diagnóstico: testa se a query na tabela staff funciona
// Rode com: node debug_staff.mjs

const SUPABASE_URL = "https://zkhsxzfejqymyzgektav.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraHN4emZlanF5bXl6Z2VrdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTUzMDEsImV4cCI6MjA4NDE3MTMwMX0.jL9BhdBAC9qIe28x22MiLBHKYr10tkrpyoQ7ROeF0rU";

// 1. Listar todos os registros da tabela staff (como anon+RLS)
async function listStaff() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/staff?select=id,name,email,role,user_id,active`,
        {
            headers: {
                "apikey": ANON_KEY,
                "Authorization": `Bearer ${ANON_KEY}`,
            },
        }
    );
    const data = await res.json();
    console.log("=== STAFF TABLE ===");
    console.log("Status:", res.status);
    if (Array.isArray(data)) {
        data.forEach(row => {
            console.log(`  Name: ${row.name} | Email: ${row.email} | Role: ${row.role} | user_id: ${row.user_id || 'NULL'} | Active: ${row.active}`);
        });
        if (data.length === 0) console.log("  (vazio - nenhum registro encontrado)");
    } else {
        console.log("  Error:", JSON.stringify(data));
    }
    return data;
}

// 2. Listar app_settings
async function listSettings() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/app_settings?select=key,value`,
        {
            headers: {
                "apikey": ANON_KEY,
                "Authorization": `Bearer ${ANON_KEY}`,
            },
        }
    );
    const data = await res.json();
    console.log("\n=== APP_SETTINGS TABLE ===");
    console.log("Status:", res.status);
    if (Array.isArray(data)) {
        data.forEach(row => {
            console.log(`  Key: ${row.key}`);
            console.log(`  Value:`, JSON.stringify(row.value, null, 2));
        });
        if (data.length === 0) console.log("  (vazio - permissions_matrix não encontrada)");
    } else {
        console.log("  Error:", JSON.stringify(data));
    }
}

// 3. Testar RPC get_my_staff_role (se existir)
async function testRPC() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_my_staff_role`,
        {
            method: "POST",
            headers: {
                "apikey": ANON_KEY,
                "Authorization": `Bearer ${ANON_KEY}`,
                "Content-Type": "application/json",
            },
            body: "{}",
        }
    );
    const data = await res.json();
    console.log("\n=== RPC get_my_staff_role (anon) ===");
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(data));
}

async function main() {
    console.log("Diagnosticando Supabase...\n");
    await listStaff();
    await listSettings();
    await testRPC();
    console.log("\n=== FIM DO DIAGNÓSTICO ===");
}

main();
