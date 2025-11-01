import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import api from '../services/api' // Use the api instance

// Define types
export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IAuthContext {
  user: IUser | null;
  token: string | null;
  isAuthReady: boolean; // <-- 1. ADD THIS
  login: (tokenValue: string, userObj: IUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | null>(null)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isAuthReady, setIsAuthReady] = useState(false); // <-- 2. ADD THIS

  useEffect(() => {
    try {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // We assume if a token exists, the user is "logged in" for this context
        // A full app might fetch a /me route here to verify the token
      } else {
        delete axios.defaults.headers.common['Authorization']
        delete api.defaults.headers.common['Authorization']
      }
    } catch (e) {
      console.error("Auth setup failed", e);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setIsAuthReady(true); // <-- 3. MARK AUTH AS READY
    }
  }, [token])

  const login = (tokenValue: string, userObj: IUser) => {
    setToken(tokenValue); 
    setUser(userObj); 
    localStorage.setItem('token', tokenValue)
  }

  const logout = () => {
    setToken(null); 
    setUser(null); 
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthReady, login, logout }}> {/* <-- 4. PASS IT */}
      {children}
    </AuthContext.Provider>
  )
}
