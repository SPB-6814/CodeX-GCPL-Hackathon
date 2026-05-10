// ============================================================
// SportWell – Supabase Clients
// /lib/supabase/client.ts
//
// THREE clients – each used in a specific context:
//
//  browserClient()  → Next.js Client Components / hooks
//                     Uses anon key, respects user session cookies
//
//  serverClient()   → Next.js Server Components / Route Handlers
//                     Uses anon key + reads session from cookies
//
//  serviceClient()  → Express backend / cron jobs ONLY
//                     Uses service_role key – bypasses RLS
//                     NEVER expose to browser
// ============================================================

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// Env validation helper
// ─────────────────────────────────────────────
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[SportWell] Missing required environment variable: ${name}`
    );
  }
  return value;
}

// ─────────────────────────────────────────────
// Singleton cache — avoid creating a new client
// on every function call in hot paths
// ─────────────────────────────────────────────
let _browserClientInstance: SupabaseClient | null = null;
let _serviceClientInstance: SupabaseClient | null = null;

// ─────────────────────────────────────────────
// BROWSER CLIENT
// Use inside 'use client' components and /hooks
// ─────────────────────────────────────────────
export function browserClient(): SupabaseClient {
  if (_browserClientInstance) return _browserClientInstance;

  _browserClientInstance = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return _browserClientInstance;
}

// ─────────────────────────────────────────────
// SERVER CLIENT (Next.js Server Components)
// Reads the user's session from request cookies.
// Import dynamically so this is never bundled client-side.
// Usage: import { serverClient } from "@/lib/supabase/client"
// ─────────────────────────────────────────────
export async function serverClient(): Promise<SupabaseClient> {
  // Dynamic import to avoid bundling Next.js server packages into client
  const { cookies } = await import("next/headers");
  const { createServerClient } = await import("@supabase/ssr");

  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

// ─────────────────────────────────────────────
// SERVICE CLIENT  ⚠️  BACKEND ONLY
// Bypasses RLS. Never import in /app or /components.
// ─────────────────────────────────────────────
export function serviceClient(): SupabaseClient {
  if (_serviceClientInstance) return _serviceClientInstance;

  _serviceClientInstance = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return _serviceClientInstance;
}
