import { AuthProvider } from '@/context/AuthContext'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faith Journal',
  description: 'Record your spiritual journey, track emotions, and receive contextual Bible verses',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
