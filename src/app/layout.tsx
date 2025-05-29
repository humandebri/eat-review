import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Eat Review - 飲食店レビューdApp",
    template: "%s | Eat Review"
  },
  description: "Internet Computer Protocol (ICP) 上で動作する分散型飲食店レビューアプリケーション。お気に入りのレストランを見つけて、レビューを共有しましょう。",
  keywords: ["飲食店", "レビュー", "レストラン", "グルメ", "ICP", "ブロックチェーン", "dApp", "Juno"],
  authors: [{ name: "Eat Review Team" }],
  creator: "Eat Review Team",
  publisher: "Eat Review",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://eat-review.juno.build"),
  openGraph: {
    title: "Eat Review - 飲食店レビューdApp",
    description: "お気に入りのレストランを見つけて、レビューを共有しましょう",
    url: "/",
    siteName: "Eat Review",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eat Review - 飲食店レビューdApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eat Review - 飲食店レビューdApp",
    description: "お気に入りのレストランを見つけて、レビューを共有しましょう",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", sizes: "any" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${jetBrainsMono.className} bg-white dark:bg-black`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
