import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const hex = searchParams.get("hex");

	if (!hex) {
		return NextResponse.json({});
	}

	const color = await prisma.color.findUnique({
		where: { hex: hex.toUpperCase() }
	});

	if (!color) {
		return NextResponse.json({ hex, name: null });
	}

	return NextResponse.json(color ?? null);
}

export async function POST(request: NextRequest) {
	const {name} = await request.json();
	const { searchParams } = new URL(request.url);
	const hex = searchParams.get("hex");

	await prisma.color.create({
		data: {
			hex: hex!.toUpperCase(),
			name,
			source: "user"
		}
	});

	return NextResponse.json({
		hex: hex!.toUpperCase(),
		name,
		source: "user"
	});
}
