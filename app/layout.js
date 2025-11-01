export const metadata = {
  title: "Malakye Cockpit",
  description: "Central admin UI",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
