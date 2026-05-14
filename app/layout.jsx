import { GeistSans } from 'geist/font/sans'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata = {
  title: 'فاتورتي - سيستم فواتير عربي',
  description: 'واجهة فواتير عربية مصرية سهلة لعمل فواتير branded وتصديرها PDF و PNG.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
