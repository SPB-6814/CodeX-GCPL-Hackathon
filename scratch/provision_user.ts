import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupHackathonUser() {
  console.log("Setting up hackathon user...");
  // Check if user exists
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  let user = users?.users?.find(u => u.email === "test@sportwell.app");

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "test@sportwell.app",
      password: "password123",
      email_confirm: true,
      user_metadata: { full_name: "Hackathon Tester" }
    });
    if (error) throw error;
    user = data.user;
    console.log("Created new user:", user.id);
  } else {
    console.log("Found existing user:", user.id);
  }

  // Also ensure sport_profiles exists so dashboard works perfectly
  const { error: spError } = await supabase.from("sport_profiles").insert({
    user_id: user.id,
    primary_sport: "Running",
    fitness_level: "intermediate"
  });
  // Ignore conflict error
  
  console.log("UUID_TO_USE:", user.id);
}

setupHackathonUser().catch(console.error);
