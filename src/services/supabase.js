
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yoptvzbogdhkqjlymnxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oXm2DizYAZh_0lTFxD1mRA_4CxNfjhX';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
