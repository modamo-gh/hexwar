import Header from "@/components/Header";
import { stripe } from "@/lib/stripe";
import Link from "next/link";

const SuccessPage = async ({
	searchParams
}: {
	searchParams: {
		color?: string;
		hex?: string;
		name?: string;
		session_id?: string;
	};
}) => {
	let color = searchParams.color ?? "";
	let hex = searchParams.hex ?? "";
	let name = searchParams.name ?? "";

	if (searchParams.session_id) {
		const session = await stripe.checkout.sessions.retrieve(
			searchParams.session_id,
			{
				expand: ["line_items.data.price.product"]
			}
		);

		hex = session.metadata?.hex ?? "";
		color = session.metadata?.color ?? "";
		name = session.metadata?.name ?? "";
	}

	return (
		<div
			className={`gap-2 flex flex-col h-screen w-screen p-4`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<Header color={color} hex={hex} />
			<div
				className="border flex flex-col flex-4 gap-4 items-center justify-center p-4 rounded-lg text-center text-2xl"
				style={{ borderColor: color, color }}
			>
				<p>#{hex} is now</p>
				<p>{name}!</p>
				<p>
					Click #HEXWAR above or{" "}
					<Link
						className="underline"
						href="/"
					>
						this link
					</Link>{" "}
					to name another color
				</p>
			</div>
		</div>
	);
};

export default SuccessPage;
