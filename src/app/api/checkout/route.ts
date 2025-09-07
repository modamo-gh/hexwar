import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { color, hex, name, price } = await request.json();

		console.log(hex, name, price);

		if (!hex || !name || typeof price !== "number" || price < 0) {
			return NextResponse.json(
				{ error: "Invalid payload" },
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
							metadata: { hex, name },
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
