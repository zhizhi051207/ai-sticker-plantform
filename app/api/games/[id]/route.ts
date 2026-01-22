import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const { isPublic, title } = await request.json();

    if (typeof isPublic !== "boolean" && typeof title !== "string") {
      return NextResponse.json(
        { error: "Provide isPublic or title" },
        { status: 400 }
      );
    }

    if (typeof title === "string" && !title.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const isOwner =
      (session.user.id && game.userId === session.user.id) ||
      game.user?.email === session.user.email;

    if (!isOwner) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const updated = await prisma.game.update({
      where: { id },
      data: {
        ...(typeof isPublic === "boolean" ? { isPublic } : {}),
        ...(typeof title === "string" ? { title: title.trim() } : {}),
      },
    });

    return NextResponse.json({ success: true, game: updated });
  } catch (error) {
    console.error("Update game error:", error);
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const game = await prisma.game.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const isOwner =
      (session.user.id && game.userId === session.user.id) ||
      game.user?.email === session.user.email;

    if (!isOwner) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete game error:", error);
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }
}
