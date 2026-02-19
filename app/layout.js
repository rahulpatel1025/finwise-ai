import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FINWISE",
  description: "AI Financial Advisor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
