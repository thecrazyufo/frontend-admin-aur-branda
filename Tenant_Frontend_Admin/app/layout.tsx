import type { Metadata } from"next";
import"./globals.css";

export const metadata: Metadata = {
 title: {
 default:"Admin Portal — Multi-Tenant Console",
 template:"%s | Admin Portal",
 },
 description:"Multi-Tenant Admin Console for managing software selling storefronts.",
 icons: {
 icon:"/favicon.ico",
 },
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <link rel="preconnect" href="https://fonts.googleapis.com" />
 <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 </head>
 <body className="min-h-screen flex flex-col antialiased">
 <main className="flex-1">{children}</main>
 </body>
 </html>
 );
}

