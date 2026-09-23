import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Technically | Hiring Platform",
  description: "Specialized hiring platform connecting industrial, technical, and skilled machine operators with employers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
