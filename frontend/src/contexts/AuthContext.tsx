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
  login: (tokenValue: string, userObj: IUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | null>(null)
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
      delete api.defaults.headers.common['Authorization']
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

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}