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

export async function register(phone, pin, currency = 'INR', language = 'en', languageName = 'English') {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{ 
        phone, 
        pin,
        default_currency: currency,
        default_language: language,
        language_name: languageName,
        is_premium: false
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
