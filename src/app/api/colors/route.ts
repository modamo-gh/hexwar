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
	const { hex, name } = await request.json();

	if(!hex || !name){
		return NextResponse.json({error: "Missing hex or name"}, {status: 400})
	}

	await prisma.color.create({
		data: {
			hex,
			name,
			source: "user"
		}
	});

	return NextResponse.json({status: 200});
}
