import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getTicketById, addTicketMessage } from "@/lib/ticket-db";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await getTicketById(id, user.server_area, user.uuid);
  if (!ticket || ticket.user_uuid !== user.uuid) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await getTicketById(id, user.server_area, user.uuid);
  if (!ticket || ticket.user_uuid !== user.uuid) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (ticket.status === "closed") {
    return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
  }

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  const newMsg = await addTicketMessage(
    id,
    { sender: "user", sender_name: user.username, content: content.trim() },
    user.server_area,
    user.uuid
  );

  if (!newMsg) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Trigger Pusher events
  await pusherServer.trigger(`ticket-${id}`, "new-message", newMsg);
  await pusherServer.trigger("admin-tickets", "ticket-updated", {
    ticket_id: id,
    sender: "user",
    username: user.username,
  });
  await pusherServer.trigger("admin-notifications", "ticket-replied", {
    ticket_id: id,
    username: user.username,
    content: newMsg.content.slice(0, 80),
  });

  return NextResponse.json({ message: newMsg });
}

