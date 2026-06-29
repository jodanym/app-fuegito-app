import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

// Tipografia de marca: Baloo 2 (titulos, redonda y jugueton) + Nunito
// (texto, muy legible). Ambas con soporte de espanol (subset latin).
const display = Baloo_2({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Nunito({
  variable: "--font-body-src",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universo de Fueguito",
  description:
    "Aprende a pensar jugando: logica, pensamiento critico y resolucion de problemas para ninos, con Fueguito, Desconocido y Acidito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
