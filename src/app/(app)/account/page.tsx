'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
    }
  }, [user])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPassword) {
      setError('Current password is required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setIsUpdating(true)

    try {
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setError(error.message || 'Failed to update password')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete user data first
        if (user) {
          // Delete journal entries
          const { error: journalError } = await supabase
            .from('journal_entries')
            .delete()
            .eq('user_id', user.id)

          if (journalError) {
            console.error('Error deleting journal entries:', journalError)
          }

          // Delete favorite verses
          const { error: versesError } = await supabase
            .from('favorite_verses')
            .delete()
            .eq('user_id', user.id)

          if (versesError) {
            console.error('Error deleting favorite verses:', versesError)
          }
        }

        // Sign out and redirect to login
        await signOut()
      } catch (error) {
        console.error('Error deleting account:', error)
        setError('Failed to delete account')
      }
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-[#1A0A1F] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="mr-2 h-5 w-5 text-[#6C63FF]" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-[#2A2A2A] border-gray-700 text-white"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-none shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Lock className="mr-2 h-5 w-5 text-[#6C63FF]" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-900 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-900/30 border-green-900 text-white">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-white">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-white">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#2A2A2A] border-gray-700 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#6C63FF] hover:bg-[#5A52D5]"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Danger Zone</CardTitle>
            <CardDescription className="text-gray-400">
              Actions here cannot be undone
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
