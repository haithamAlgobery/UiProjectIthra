'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const auth = useSelector((s) => s.auth)

  useEffect(() => {
    if (!auth?.isAuth) {
      // Redirect to login page
      router.push('/auth/login')
    }
  }, [auth?.isAuth, router])

  if (!auth?.isAuth) return null // أو Loading skeleton
  return children
}