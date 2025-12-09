import { supabase } from "./supabaseClient.js";

export async function login(phone, pin) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .eq("pin", pin)
    .single();
  if (error || !data) {
    alert("Invalid login");
    return null;
  }
  localStorage.setItem("user", JSON.stringify(data));
  return data;
}

export async function register(phone, pin, inviteCode = null) {
  try {
    let family_id, role;

    // If invite code provided, join existing family as member
    if (inviteCode) {
      const { data: adminUser, error: adminError } = await supabase
        .from("users")
        .select("family_id")
        .eq("invite_code", inviteCode)
        .eq("role", "admin")
        .single();

      if (adminError || !adminUser) {
        alert("Invalid invite code");
        return null;
      }

      family_id = adminUser.family_id;
      role = "member";
    } else {
      // Create new family with this user as admin
      family_id = crypto.randomUUID();
      role = "admin";
    }

    // Generate unique invite code for admins
    const invite_code = role === "admin" 
      ? Math.random().toString(36).substring(2, 10).toUpperCase()
      : null;

    const { data, error } = await supabase
      .from("users")
      .insert([{ 
        phone, 
        pin, 
        family_id, 
        role,
        invite_code,
        is_admin: role === "admin"
      }])
      .select()
      .single();

    if (error) {
      alert("Registration failed: " + error.message);
      return null;
    }

    localStorage.setItem("user", JSON.stringify(data));
    return data;
  } catch (error) {
    alert("Registration failed: " + error.message);
    return null;
  }
}
