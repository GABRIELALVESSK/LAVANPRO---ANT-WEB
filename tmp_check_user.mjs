
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserReferences() {
  const targetUid = '22b4e467-4b97-4f7f-9a45-2045afd1f828'
  
  console.log(`Verificando referências para o UID: ${targetUid}...`)

  // Check staff table
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .or(`user_id.eq.${targetUid},owner_id.eq.${targetUid}`)

  if (staffError) {
    console.error('Erro ao buscar na tabela staff:', staffError)
  } else {
    console.log(`Encontrado na tabela staff: ${staff.length} registros.`)
    console.log(JSON.stringify(staff, null, 2))
  }

  // Check laundry_data (since owner_id is there)
  const { data: laundryData, error: laundryError } = await supabase
    .from('laundry_data')
    .select('data_key')
    .eq('owner_id', targetUid)

  if (laundryError) {
    console.error('Erro ao buscar na tabela laundry_data:', laundryError)
  } else {
    console.log(`Encontrado na tabela laundry_data: ${laundryData.length} chaves.`)
  }
}

checkUserReferences()
