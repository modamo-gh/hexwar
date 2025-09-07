import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
	const count = await prisma.color.count();
	const highest = await prisma.color.findFirst({
		orderBy: { price: "desc" },
		select: { hex: true, name: true, price: true }
	});

	return NextResponse.json({ count, highest });
}
