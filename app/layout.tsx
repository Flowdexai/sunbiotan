import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
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
  title: "SUNBIOTAN | Bronzeado Natural Profissional sem Raios UV",
  description:
    "SUNBIOTAN — ativador de melanina com ingredientes 100% naturais. Bronzeado seguro, uniforme e duradouro. Disponível em salões autorizados em Portugal e Espanha.",
  keywords: [
    "bronzeado natural",
    "bronzeado sem UV",
    "ativador de melanina",
    "tratamento bronzeado profissional",
    "sunbiotan",
    "bronzeado seguro",
    "salão de beleza bronzeado",
  ],
  openGraph: {
    title: "SUNBIOTAN | Bronzeado Natural Profissional",
    description:
      "O tratamento natural que respeita e trata a sua pele. Bronzeado radiante, seguro e duradouro — sem raios UV.",
    type: "website",
    locale: "pt_PT",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUNBIOTAN | Bronzeado Natural Profissional",
    description:
      "Bronzeado seguro, uniforme e duradouro com ingredientes 100% naturais.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
