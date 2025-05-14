'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { decodeToken, TokenPayload } from '@/utils/jwtUtils'

type AuthContextType = {
  user: TokenPayload | null
  login: (token: string, context: 'CLIENT' | 'BACKOFFICE') => void
  logout: (context: 'CLIENT' | 'BACKOFFICE') => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TokenPayload | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('backofficeToken')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded)
      }
    }
  }, [])

  function login(token: string, context: 'CLIENT' | 'BACKOFFICE') {
    const key = context === 'CLIENT' ? 'clientToken' : 'backofficeToken'
    localStorage.setItem(key, token)
    const decoded = decodeToken(token)
    setUser(decoded)
  }

  function logout(context: 'CLIENT' | 'BACKOFFICE') {
    localStorage.removeItem('clientToken')
    localStorage.removeItem('backofficeToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext precisa estar dentro de AuthProvider')
  return ctx
}
