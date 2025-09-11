import { prisma } from "@/lib/db";
import { isValidName } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { hex, name, price } = await request.json();

		if (!hex || !name || price === undefined) {
			return NextResponse.json(
				{ error: "Missing hex, name, price" },
				{ status: 400 }
			);
		}

		if (!/^[A-F0-9]{6}$/.test(hex.toUpperCase())) {
			return NextResponse.json(
				{ error: "Invalid hex format" },
				{ status: 400 }
			);
		}

		if (!isValidName(name)) {
			return NextResponse.json(
				{ error: "Invalid name" },
				{ status: 400 }
			);
		}

		if (typeof price !== "number" || price !== 0) {
			return NextResponse.json(
				{ error: "Invalid price" },
				{ status: 400 }
			);
		}

		await prisma.color.upsert({
			create: {
				hex: hex.toUpperCase(),
				name,
				price
			},
			update: { name, price },
			where: { hex: hex.toUpperCase() }
		});

		return NextResponse.json({ status: 200 });
	} catch (error) {
		console.error("API /colors error:", error);

		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
