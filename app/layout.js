export const metadata = {
  title: "Malakye Cockpit UI",
  description: "Central admin UI for Malakye.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: "sans-serif",
        backgroundColor: "#fafafa"
      }}>
        {children}
      </body>
    </html>
  );
}
