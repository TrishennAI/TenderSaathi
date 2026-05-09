export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_TS_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_TS_SUPABASE_ANON_KEY ?? "",
  agentWhatsappNumber: process.env.NEXT_PUBLIC_TS_AGENT_WHATSAPP_NUMBER ?? "",
  paymentAmount: Number(process.env.NEXT_PUBLIC_TS_PAYMENT_AMOUNT ?? 799),
  paymentQrImagePath: process.env.NEXT_PUBLIC_TS_PAYMENT_QR_IMAGE_PATH ?? "/upi-qr.png",
};

export function isSupabaseConfigured(): boolean {
  return (
    !!env.supabaseUrl &&
    !env.supabaseUrl.includes("placeholder") &&
    !!env.supabaseAnonKey &&
    !env.supabaseAnonKey.includes("placeholder")
  );
}
