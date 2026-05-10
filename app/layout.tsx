import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportWell - Active Serenity",
  description: "Wellness tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        ` }}></style>
      </head>
      <body className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
