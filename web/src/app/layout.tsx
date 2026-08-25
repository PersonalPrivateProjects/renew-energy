import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "../contexts/Web3Provider";
import NavBar from "../components/NavBar";
import Web3DiagnosticsDrawer from "../components/Web3DiagnosticsDrawer";

export const metadata: Metadata = {
  title: "GreenChain - Renewable Energy Traceability",
  description: "Sistema de trazabilidad y tokenización de energía renovable usando ERC-1155"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true} className="pattern-grid">
        <Web3Provider>
          <NavBar />
          <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <Web3DiagnosticsDrawer />
        </Web3Provider>
      </body>
    </html>
  );
}
