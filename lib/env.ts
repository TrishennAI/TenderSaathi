export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  agentWhatsappFallback: process.env.NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Gem Portal",
  paymentAmountInr: Number(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT_INR ?? 799),
  paymentQrPath: process.env.NEXT_PUBLIC_PAYMENT_QR_PATH ?? "/upi-qr.png",
};

export function isSupabaseConfigured(): boolean {
  return (
    !!env.supabaseUrl &&
    !env.supabaseUrl.includes("placeholder") &&
    !!env.supabaseAnonKey &&
    !env.supabaseAnonKey.includes("placeholder")
  );
}
