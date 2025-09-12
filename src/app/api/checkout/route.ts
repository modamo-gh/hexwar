import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { isValidName } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { color, hex, name, price } = await request.json();

		if (!hex || !name || typeof price !== "number" || price < 0) {
			return NextResponse.json(
				{ error: "Invalid payload" },
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

		const existingColor = await prisma.color.findUnique({
			where: { hex: hex.toUpperCase() }
		});

		const minimumBid = (existingColor?.price || 0) + 100;

		if (price < minimumBid) {
			return NextResponse.json(
				{ error: `Minimum bid is $${formatPrice(minimumBid)}` },
				{ status: 400 }
			);
		}

		const successURL = `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelURL = `${process.env.APP_URL}/?canceled=1`;
		const session = await stripe.checkout.sessions.create({
			cancel_url: cancelURL,
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							metadata: { hex: hex.toUpperCase(), name },
							name: `#${hex.toUpperCase()} — ${name}`
						},
						unit_amount: price
					},
					quantity: 1
				}
			],
			metadata: { color, hex, name, price: String(price) },
			mode: "payment",
			success_url: successURL
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error(error);

		return NextResponse.json({ error: "Stripe error" }, { status: 500 });
	}
}
