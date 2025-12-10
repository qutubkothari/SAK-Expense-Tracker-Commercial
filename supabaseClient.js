import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://hcjsmankbnnehylughxy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjanNtYW5rYm5uZWh5bHVnaHh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjk4MzgsImV4cCI6MjA4MDg0NTgzOH0.zRzsPj21BSY4wKKuDeDGhvYx6zUGBezCL9kjpu863A4"
);

// Make supabase available globally for non-module scripts
window.supabase = supabase;
