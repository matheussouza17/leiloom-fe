'use client'

import { useEffect, useState, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { decodeToken, TokenPayload } from '@/utils/jwtUtils'

interface WithAuthProps {
  user: TokenPayload
}

export function withAuth<T extends object>(WrappedComponent: ComponentType<T & WithAuthProps>) {

  return function WithAuthComponent(props: T) {
    const [user, setUser] = useState<TokenPayload | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    console.log('withAuth HOC called')
    useEffect(() => {
        const token = localStorage.getItem('token')
        console.log('raw token:', token)
        if (!token) {
          console.log('nenhum token encontrado')
          router.push('/login')
          return
        }
      
        const payload = decodeToken(token)
        console.log('decoded payload:', payload)
        if (!payload) {
          console.log('payload null → token inválido')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
      
        const expiresAt = payload.exp * 1000
        console.log('expiresAt:', new Date(expiresAt), 'now:', new Date())
        if (expiresAt > Date.now()) {
          setUser(payload)
        } else {
          console.log('token já expirou')
          localStorage.removeItem('token')
          router.push('/login')
        }
      
        setLoading(false)
      }, [])
      

    if (loading || !user) return null

    return <WrappedComponent {...props} user={user} />
  }
}
