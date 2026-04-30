import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compta GTA RP",
  description: "Plateforme de comptabilité pour entreprises GTA RP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
