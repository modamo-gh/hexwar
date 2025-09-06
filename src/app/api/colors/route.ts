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

	return Response.json(color ?? null);
}
