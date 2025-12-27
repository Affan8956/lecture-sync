import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuipghzcggjgmeputswh.supabase.co';
const supabaseAnonKey = 'sb_publishable_eJq1QJ56a_T2Q-NV6dqZzg_GMMGp42q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);