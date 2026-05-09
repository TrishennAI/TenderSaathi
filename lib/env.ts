export const env = {
  supabaseUrl: process.env.TS_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.TS_SUPABASE_ANON_KEY ?? "",
  agentWhatsappNumber: process.env.TS_AGENT_WHATSAPP_NUMBER ?? "",
  paymentAmount: Number(process.env.TS_PAYMENT_AMOUNT ?? 799),
  paymentQrImagePath: process.env.TS_PAYMENT_QR_IMAGE_PATH ?? "/upi-qr.png",
};

export function isSupabaseConfigured(): boolean {
  return (
    !!env.supabaseUrl &&
    !env.supabaseUrl.includes("placeholder") &&
    !!env.supabaseAnonKey &&
    !env.supabaseAnonKey.includes("placeholder")
  );
}
