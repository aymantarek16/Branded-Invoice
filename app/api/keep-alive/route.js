import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        ok: false,
        message: "Missing environment variables",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("system_heartbeat")
      .select("*");

    return NextResponse.json({
      keyStart: supabaseKey.substring(0, 15),
      error,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}
// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// export async function GET() {
//   try {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//     if (!supabaseUrl || !supabaseKey) {
//       return NextResponse.json(
//         {
//           ok: false,
//           message: "Missing Supabase environment variables",
//         },
//         { status: 500 }
//       );
//     }

//     const supabase = createClient(supabaseUrl, supabaseKey);

//     // قراءة العداد الحالي
//     const { data, error: fetchError } = await supabase
//       .from("system_heartbeat")
//       .select("ping_count")
//       .eq("id", 1)
//       .single();

//     if (fetchError) {
//       return NextResponse.json(
//         {
//           ok: false,
//           message: "Failed to read heartbeat",
//           error: fetchError.message,
//         },
//         { status: 500 }
//       );
//     }

//     // تحديث آخر Ping والعداد
//     const { error: updateError } = await supabase
//       .from("system_heartbeat")
//       .update({
//         last_ping: new Date().toISOString(),
//         ping_count: (data?.ping_count ?? 0) + 1,
//       })
//       .eq("id", 1);

//     if (updateError) {
//       return NextResponse.json(
//         {
//           ok: false,
//           message: "Failed to update heartbeat",
//           error: updateError.message,
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       ok: true,
//       message: "Hi Ayman, Branded Invoice is alive",
//       ping_count: (data?.ping_count ?? 0) + 1,
//       time: new Date().toISOString(),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         ok: false,
//         message: "Unexpected error",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }