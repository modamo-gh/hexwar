import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
	request: NextRequest,
	context: { params: { hex: string } }
) {
	let { hex } = context.params;

	if (!hex) {
		return NextResponse.json({});
	}

	hex = hex.toUpperCase();

	if (/^[A-F0-9]{6}$/.test(hex)) {
		try {
			const color = await prisma.color.findUnique({
				where: { hex }
			});

			if (!color) {
				return NextResponse.json({ hex, name: null, price: 0 });
			}

			return NextResponse.json(color);
		} catch (error) {
			console.error(error);

			return NextResponse.json(
				{ error: "Database error" },
				{ status: 500 }
			);
		}
	}

	return NextResponse.json({ error: "Invalid hex format" }, { status: 400 });
}
