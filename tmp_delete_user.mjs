
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zkhsxzfejqymyzgektav.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraHN4emZlanF5bXl6Z2VrdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTUzMDEsImV4cCI6MjA4NDE3MTMwMX0.jL9BhdBAC9qIe28x22MiLBHKYr10tkrpyoQ7ROeF0rU"

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteUserReferences() {
  const targetUid = '22b4e467-4b97-4f7f-9a45-2045afd1f828'
  
  console.log(`Limpando referências para o UID: ${targetUid}...`)

  const tables = ['staff', 'laundry_data', 'company_subscriptions']
  
  for (const table of tables) {
    // Try to delete where user_id or owner_id matches
    const { error: err1 } = await supabase.from(table).delete().eq('owner_id', targetUid)
    const { error: err2 } = await supabase.from(table).delete().eq('user_id', targetUid)
    
    console.log(`✓ Limpeza na tabela [${table}] finalizada.`)
  }

  console.log('\nLimpeza concluída em todas as tabelas mapeadas! Tente excluir o usuário no dashboard do Supabase agora.')
}

deleteUserReferences()
