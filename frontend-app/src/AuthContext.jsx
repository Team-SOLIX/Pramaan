import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // Simple auth state management without Firebase dependency
  useEffect(() => {
    const token = localStorage.getItem('idToken')
    const phone = localStorage.getItem('userPhone')
    if (token && phone) {
      setCurrentUser({ phoneNumber: phone })
    }
  }, [])

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    setCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
