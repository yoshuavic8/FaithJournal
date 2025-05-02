import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Faith Journal',
  description: 'Sign in to your Faith Journal account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#1A0A1F] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] bg-clip-text text-transparent">
            Faith Journal
          </h1>
          <p className="text-gray-400 mt-2">
            Record your spiritual journey
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
