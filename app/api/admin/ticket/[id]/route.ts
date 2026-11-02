import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import {
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
  updateTicketPriority,
  TicketStatus,
  TicketPriority,
} from "@/lib/ticket-db";
import { pusherServer } from "@/lib/pusher";
import { getMongoClientByNode } from "@/lib/mongodb";
import { getDiscoveredServers } from "@/lib/server-db";

/** Find a ticket across all servers by ticket_id */
async function findTicketAcrossServers(ticketId: string) {
  const allServers = getDiscoveredServers().filter((s: { isConfigured: boolean }) => s.isConfigured);
  for (const srv of allServers) {
    const ticket = await getTicketById(ticketId, srv.id);
    if (ticket) return { ticket, serverArea: srv.id };
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const found = await findTicketAcrossServers(id);
  if (!found) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  return NextResponse.json({ ticket: found.ticket });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const found = await findTicketAcrossServers(id);
  if (!found) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = await req.json();
  let updated = false;

  if (body.status) {
    updated = await updateTicketStatus(id, body.status as TicketStatus, found.serverArea, found.ticket.user_uuid);
    // Push to member's private channel
    await pusherServer.trigger(`member-${found.ticket.user_uuid}`, "ticket-updated", {
      ticket_id: id,
      status: body.status,
    });
    await pusherServer.trigger(`ticket-${id}`, "status-changed", { status: body.status });
  }

  if (body.priority) {
    updated = await updateTicketPriority(id, body.priority as TicketPriority, found.serverArea, found.ticket.user_uuid);
  }

  return NextResponse.json({ success: updated });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value || cookieStore.get("session")?.value;
  const user = await verifySessionToken(token);
  if (!user || user.level !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const found = await findTicketAcrossServers(id);
  if (!found) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  const newMsg = await addTicketMessage(
    id,
    { sender: "admin", sender_name: "Support Team", content: content.trim() },
    found.serverArea,
    found.ticket.user_uuid
  );

  if (!newMsg) return NextResponse.json({ error: "Failed to send" }, { status: 500 });

  // Update ticket status to in_progress if it was open
  if (found.ticket.status === "open") {
    await updateTicketStatus(id, "in_progress", found.serverArea, found.ticket.user_uuid);
    await pusherServer.trigger(`ticket-${id}`, "status-changed", { status: "in_progress" });
  }

  // Push realtime events
  await pusherServer.trigger(`ticket-${id}`, "new-message", newMsg);
  await pusherServer.trigger(`member-${found.ticket.user_uuid}`, "ticket-updated", {
    ticket_id: id,
    sender: "admin",
  });

  return NextResponse.json({ message: newMsg });
}

