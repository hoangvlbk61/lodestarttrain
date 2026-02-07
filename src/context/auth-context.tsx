import { AuthState, useAuth } from '@/hooks/use-auth'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'


const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

  const auth = useAuth()
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}
