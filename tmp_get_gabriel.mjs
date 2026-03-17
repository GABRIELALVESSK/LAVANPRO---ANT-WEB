import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const lines = envContent.split('\n');
let supabaseUrl = '';
let supabaseKey = '';

for (let line of lines) {
  line = line.replace('\r', '').replace(/"/g, '').replace(/'/g, '').trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data, error } = await supabase.auth.admin.getUserById('dd96597a-df15-47d3-8b39-899c5510f1b8');
  console.log('auth user:', data, error);
}

checkUser();
