import "../globals.css";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
