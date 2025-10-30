import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // <-- 1. IMPORT
import { SocketProvider } from './contexts/SocketContext';
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <Routes>
        {/* The Layout component now wraps EVERYTHING */}
        <Route element={<Layout />}>

          {/* Public Routes (Login & Signup) */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}> 
            {/* These routes can only be accessed if you are logged in */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/requests" element={<Requests />} />
          </Route>

        </Route>
      </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}