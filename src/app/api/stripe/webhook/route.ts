import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	const signature = (await headers()).get("stripe-signature");

	if (!secret || !signature) {
		return new NextResponse("Missing signature/secret", { status: 400 });
	}

	const payload = await request.text();

	let event;

	try {
		event = stripe.webhooks.constructEvent(payload, signature, secret);
	} catch (error: any) {
		console.error("Missing signature/secret", error.message);

		return new NextResponse("Invalid signature", { status: 400 });
	}

	try {
		if (event.type === "checkout.session.completed") {
			const session = event.data.object;

			if (session.payment_status === "paid") {
				const hex = session.metadata?.hex || "";
				const name = session.metadata?.name || "";
				const price = Number(session.metadata?.price || 0);

				if (hex && name) {
					await prisma.color.upsert({
						create: {
							hex,
							name,
							price
						},
						update: { name, price },
						where: { hex }
					});
				}

				return new NextResponse("ok", { status: 200 });
			}
		}
	} catch (error) {
        console.error("Webhook handler error", error);

        return new NextResponse("Webhook error", { status: 200 });
    }
}
