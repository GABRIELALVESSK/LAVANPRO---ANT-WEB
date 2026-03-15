const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (prefix):', supabaseAnonKey?.substring(0, 15));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log('Testing connection...');
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('staff').select('count', { count: 'exact', head: true });
        console.log('Time taken:', Date.now() - start, 'ms');
        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log('Success! Data:', data);
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

test();
