import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
	request: Request,
	{ params }: { params: { hex: string } }
) {
	let { hex } = params;

	if (!hex) {
		return NextResponse.json({});
	}

    hex = hex.toUpperCase();

	if (/^[A-F0-9]{6}$/.test(hex)) {
		const color = await prisma.color.findUnique({
			where: { hex }
		});

		if (!color) {
			return NextResponse.json({ hex, name: null, price: 0 });
		}

		return NextResponse.json(color ?? null);
	}

	return NextResponse.json({ error: "Invalid hex format" }, { status: 400 });
}
