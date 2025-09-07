'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './hooks'

// Create authentication context
const AuthContext = createContext()

// Authentication provider component
export function AuthProvider({ children }) {
  const auth = useAuth()
  
  // Check authentication status on mount
  useEffect(() => {
    auth.checkAuth()
  }, [auth.checkAuth])
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use authentication context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}


