import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: "Kadali - Women's Safety Platform",
  description: 'Real-time safety monitoring and emergency alert platform for women.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
