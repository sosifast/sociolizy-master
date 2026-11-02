import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getAllTicketsAdmin } from "@/lib/ticket-db";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "all";
  const category = searchParams.get("category") || "all";
  const priority = searchParams.get("priority") || "all";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const result = await getAllTicketsAdmin({
    status: status as any,
    category: category as any,
    priority: priority as any,
    search,
    page,
    limit,
  });

  return NextResponse.json(result);
}

