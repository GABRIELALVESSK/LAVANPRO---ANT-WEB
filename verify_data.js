const { createClient } = require('@supabase/supabase-js');

// Configs do .env.local
const supabaseUrl = 'https://pfgcvoldyilqlnemsjci.supabase.co';
const supabaseKey = 'sb_publishable_jXoWgarxWj2DB3LwrkixVg_wSTdZUK1';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("🔍 Verificando banco de dados...");

    // Tentar ler toda a tabela de dados (já que o RLS foi desativado no script anterior)
    const { data: laundryData, error: laundryError } = await supabase
        .from('laundry_data')
        .select('*');

    if (laundryError) {
        console.error("❌ Erro ao ler laundry_data:", laundryError.message);
    } else {
        console.log(`📦 Encontrados ${laundryData.length} registros (chaves) em laundry_data:`);
        
        let totalOrders = 0;
        let totalCustomers = 0;

        laundryData.forEach(row => {
            console.log(`- owner_id: ${row.owner_id} | data_key: ${row.data_key} | Registros: ${Array.isArray(row.data_value) ? row.data_value.length : 'N/A'}`);
            
            if (row.data_key === 'lavanpro_orders_v3' && Array.isArray(row.data_value)) {
                totalOrders += row.data_value.length;
            }
            if (row.data_key === 'lavanpro_customers' && Array.isArray(row.data_value)) {
                totalCustomers += row.data_value.length;
            }
        });

        console.log(`\n📊 TOTAL ENCONTRADO NO BANCO:`);
        console.log(`- Pedidos (lavanpro_orders_v3): ${totalOrders}`);
        console.log(`- Clientes (lavanpro_customers): ${totalCustomers}`);
    }

    // Tentar ler usuários na tabela staff
    const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('name, email, role, user_id, owner_id');
        
    if (staffError) {
        console.error("\n❌ Erro ao ler staff:", staffError.message);
    } else {
        console.log(`\n👤 Usuários encontrados (${staffData.length}):`);
        staffData.forEach(s => {
            console.log(`- ${s.name} (${s.email}) | Role: ${s.role}`);
            console.log(`  > user_id:  ${s.user_id}`);
            console.log(`  > owner_id: ${s.owner_id}`);
        });
    }
}

checkData();
