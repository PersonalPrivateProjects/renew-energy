import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "../contexts/Web3Provider";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Green Supply Chain",
  description: "Trazabilidad y tokenización con ERC-1155"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true} >
        <Web3Provider>
          <NavBar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
