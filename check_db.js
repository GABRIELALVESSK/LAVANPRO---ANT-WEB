import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pfgcvoldyilqlnemsjci.supabase.co'
const supabaseKey = 'sb_publishable_jXoWgarxWj2DB3LwrkixVg_wSTdZUK1' // This is the public key, I can't do much with it for admin tasks.

// I'll try to use the public key to just see what the current user sees.
// But wait, I don't have a session.
// The user has the program running.

console.log("Checking environment...");
console.log("URL:", supabaseUrl);
