import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://adsvvwisdxwnkvihmybu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc3Z2d2lzZHh3bmt2aWhteWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTYxNTIsImV4cCI6MjA2NzE5MjE1Mn0.cqRbgY2d3RKoRTOQZTYvcna0JStyW20TEoGGLBBae2g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
