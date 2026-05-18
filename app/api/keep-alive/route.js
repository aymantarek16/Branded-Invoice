import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabaseKey = serviceRoleKey || anonKey;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing Supabase environment variables",
          hasUrl: Boolean(supabaseUrl),
          hasServiceRole: Boolean(serviceRoleKey),
          hasAnonKey: Boolean(anonKey),
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("invoices")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Supabase ping failed",
          table: "invoices",
          usingKey: serviceRoleKey ? "service_role" : "anon",
          hasServiceRole: Boolean(serviceRoleKey),
          hasAnonKey: Boolean(anonKey),
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Branded Invoice is alive",
      table: "invoices",
      usingKey: serviceRoleKey ? "service_role" : "anon",
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unexpected error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}