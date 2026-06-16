import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  keywords: [
    "bronzeado natural",
    "bronzeado sem UV",
    "fórmula avançada de origem natural",
    "tratamento bronzeado profissional",
    "sunbiotan",
    "bronzeado seguro",
    "salão de beleza bronzeado",
    "bronzeado portugal",
    "bronzeado espanha",
    "bronzeado sem sol",
    "tratamento pele natural",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="scroll-smooth">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C1R1VVSYX7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C1R1VVSYX7');
            gtag('config', 'AW-18244892935');
          `}
        </Script>
      </body>
    </html>
  );
}