import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixProfile() {
  const userId = "ed8130df-31e7-4639-8ef0-48e8578cf24a";
  console.log("Inserting into profiles...");
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    full_name: "Hackathon Tester",
    date_of_birth: "1990-01-01"
  });
  if (error) {
    console.error("Profile insert error:", error);
  } else {
    console.log("Success!");
  }
}

fixProfile().catch(console.error);
