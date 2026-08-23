import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "Startup Atlas",
  description:
    "Explore startups worldwide and source-backed investors, angels, incubators, accelerators, and live founder programs across India.",
  openGraph: {
    title: "Startup Atlas",
    description: "India's source-backed startup capital and support map.",
    type: "website",
    images: [
      {
        url: "/startup-atlas-og.png",
        width: 1729,
        height: 910,
        alt: "Startup Atlas — India's capital and support map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Startup Atlas",
    description: "India's source-backed startup capital and support map.",
    images: ["/startup-atlas-og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
