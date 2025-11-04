"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  username: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login logic
    const mockUser: User = {
      id: "user-123",
      email,
      name: "المستخدم الحالي",
      username: "current_user",
      avatar: "/placeholder.svg",
    }

    localStorage.setItem("user", JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  const register = async (userData: any) => {
    // Mock registration logic
    const mockUser: User = {
      id: "user-new",
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      username: userData.username,
      avatar: "/placeholder.svg",
    }

    localStorage.setItem("user", JSON.stringify(mockUser))
    setUser(mockUser)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
