import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const { hex, name, price } = await request.json();

	if (!hex || !name || price === undefined) {
		return NextResponse.json(
			{ error: "Missing hex, name, price" },
			{ status: 400 }
		);
	}

	await prisma.color.upsert({
		create: {
			hex,
			name,
			price
		},
		update: { name, price },
		where: { hex }
	});

	return NextResponse.json({ status: 200 });
}
