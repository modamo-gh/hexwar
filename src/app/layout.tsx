import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
	description: "Let the #HEXWAR begin!",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-32x32.png",
		apple: "/apple-touch-icon.png"
	},
	manifest: "/site.webmanifest",
	title: "#HEXWAR"
};

const pressStart2P = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-press-start"
});

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${pressStart2P.className} antialiased`}>
				{children}
			</body>
		</html>
	);
}
