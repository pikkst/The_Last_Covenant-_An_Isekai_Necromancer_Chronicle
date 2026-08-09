import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Last Covenant',
  description: 'A narrative-first RPG about identity, death, power, and responsibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
