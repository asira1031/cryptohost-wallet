import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rvhaekzjbjabqihfzbhy.supabase.co";
const supabaseAnonKey = "sb_publishable_mdUvyUdgeMXGO9k__qE-oA_iTlMHThPE";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);