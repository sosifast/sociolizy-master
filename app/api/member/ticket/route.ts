import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { createTicket, getTicketsByUser } from "@/lib/ticket-db";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await getTicketsByUser(user.uuid, user.server_area || "SG_1");
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, category, priority, message } = body;
  if (!subject || !category || !priority || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const dbUser = await prisma.user.findUnique({ where: { uuid: user.uuid } });

  const ticket = await createTicket({
    user_uuid: user.uuid,
    username: user.username,
    email: dbUser?.email || user.email || "",
    server_area: user.server_area || "SG_1",
    subject,
    category,
    priority,
    first_message: message,
  });

  // Notify admin channel
  await pusherServer.trigger("admin-tickets", "new-ticket", {
    ticket_id: ticket.ticket_id,
    subject: ticket.subject,
    username: ticket.username,
    category: ticket.category,
    priority: ticket.priority,
    created_at: ticket.created_at,
  });
  await pusherServer.trigger("admin-notifications", "new-ticket", {
    ticket_id: ticket.ticket_id,
    subject: ticket.subject,
    username: ticket.username,
    category: ticket.category,
    priority: ticket.priority,
    created_at: ticket.created_at,
  });

  return NextResponse.json({ ticket }, { status: 201 });
}

