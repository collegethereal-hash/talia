import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetArchi() {
  const { error } = await supabase
    .from('global_state')
    .delete()
    .eq('key', 'archi_state');
    
  if (error) {
    console.error("Error resetting Archi:", error);
  } else {
    console.log("Archi state reset successfully to starting values!");
  }
}

resetArchi();
