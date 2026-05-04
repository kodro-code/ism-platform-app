import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "./layout-shell";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ISM Platform",
  description: "Kodland Internal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
