import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const patchSchema = z.object({
  id: z.string().min(1).optional(),
  all: z.boolean().optional(),
  read: z.boolean().optional().default(true),
}).refine((v) => !!v.id || v.all === true, { message: "Provide a notification id or all=true" });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, type: true, title: true, message: true, href: true, readAt: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  if (parsed.data.all) {
    await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  } else if (parsed.data.id) {
    const result = await prisma.notification.updateMany({
      where: { id: parsed.data.id, userId: user.id },
      data: { readAt: parsed.data.read ? new Date() : null },
    });
    if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
