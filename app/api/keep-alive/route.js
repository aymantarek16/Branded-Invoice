import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing Supabase environment variables",
          hasUrl: Boolean(supabaseUrl),
          hasKey: Boolean(supabaseKey),
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc(
      "keep_branded_invoice_alive"
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Supabase ping failed",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Hi Ayman, Branded Invoice is alive",
      data,
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