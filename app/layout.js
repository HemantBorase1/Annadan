import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ToastProvider } from '../components/ui/toaster'
import { AuthProvider } from '../lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Annadan',
  description: 'Your app description here',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 font-sans`}>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 p-4">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
