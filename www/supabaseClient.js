import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://sbhlptxnxlpxwaikfpqk.supabase.co",
  "sb_publishable_5ow6JZOzqg1MHzNd-3V3EA_dfPfGfJx"
);

// Make supabase available globally for non-module scripts
window.supabase = supabase;
