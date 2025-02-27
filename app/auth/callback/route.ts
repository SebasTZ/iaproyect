import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Se redirige siempre usando la URL del entorno de producción
  const baseUrl = productionUrl
    ? `https://${productionUrl}`
    : requestUrl.origin;
  if (redirectTo) {
    return NextResponse.redirect(`${baseUrl}${redirectTo}`);
  }

  return NextResponse.redirect(baseUrl);
}
