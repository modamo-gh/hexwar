import { deepseek } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	try {
		const { hex } = await request.json();

		if (!hex) {
			return NextResponse.json({});
		}

		if (/^[A-F0-9]{6}$/i.test(hex)) {
			const prompt =
				`Give THREE distinct color names for ${hex}.\n` +
				`Rules: max 3 words each; only letters, hyphen, apostrophe; no numbers, brands, or emojis.\n` +
				`Return ONLY the three names, one per line.`;

			const response = await deepseek.chat.completions.create({
				model: "deepseek-chat",
				messages: [{ role: "user", content: prompt }],
				max_tokens: 50,
				temperature: 0.7
			});

			const content = response.choices?.[0]?.message?.content ?? "";

			const suggestions = Array.from(
				new Set(
					content
						?.split("\n")
						.map((s) => s.trim())
						.filter(Boolean)
				)
			);

			return NextResponse.json({ hex, suggestions });
		}
	} catch (error) {
		console.error("DeepSeek error:", error);

		return new Response("AI error", { status: 500 });
	}
}
