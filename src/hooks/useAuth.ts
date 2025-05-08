import { useEffect, useState } from 'react'
import { decodeToken, TokenPayload } from '@/utils/jwtUtils'

export function useAuth() {
  const [user, setUser] = useState<TokenPayload | null>(null)

  useEffect(() => {
    console.log('useAuth hook called')
    const token = localStorage.getItem('token')
    if (token) {
      const payload = decodeToken(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser(payload)
      } else {
        console.log('Token expired or invalid')
        localStorage.removeItem('token')
        setUser(null)
      }
    }
  }, [])

  return { user, isAuthenticated: !!user }
}
