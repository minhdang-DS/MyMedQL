import './globals.css';

export const metadata = {
  title: 'MyMedQL',
  description: 'Real-time patient vital monitoring with a database-first design.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F7FBFF] text-[#0F172A]">{children}</body>
    </html>
  );
}
