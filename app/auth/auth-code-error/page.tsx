'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
        <p className="text-gray-600">
          Something went wrong during authentication. The link may have expired or is invalid.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
          
          <Button 
            onClick={() => router.push('/signup')}
            variant="outline"
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}
