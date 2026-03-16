import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/sidebar';
import { BusinessDataProvider } from '@/components/business-data-provider';
import { DebugOverlay } from '@/components/debug-overlay';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

import { SubscriptionGuard } from '@/components/subscription-guard';

// ... (metadata/viewport unchanged)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <BusinessDataProvider>
            <SidebarProvider>
              <SubscriptionGuard>
                {children}
              </SubscriptionGuard>
              <DebugOverlay />
            </SidebarProvider>
          </BusinessDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
